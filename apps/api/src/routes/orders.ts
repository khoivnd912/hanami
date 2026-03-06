import type { FastifyPluginAsync } from "fastify";
import { ProductModel, OrderModel, InventoryLogModel } from "@hanami/db";
import { CreateOrderSchema } from "@hanami/types";
import { verifyAccessToken } from "../lib/jwt";
import { generateOrderNumber } from "../lib/orderNumber";
import { sendOrderConfirmation } from "../lib/email";

const ordersRoutes: FastifyPluginAsync = async (fastify) => {

  // ── Auth middleware (customer) ─────────────────────────────────────────────
  fastify.addHook("onRequest", async (req, reply) => {
    if (req.method === "OPTIONS") return;
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return reply.status(401).send({ success: false, error: "Yêu cầu đăng nhập" });
    }
    try {
      (req as typeof req & { customerId: string; customerEmail: string }).customerId =
        verifyAccessToken(auth.slice(7)).sub;
      (req as typeof req & { customerEmail: string }).customerEmail =
        verifyAccessToken(auth.slice(7)).email;
    } catch {
      return reply.status(401).send({ success: false, error: "Token không hợp lệ" });
    }
  });

  // ── GET /orders ────────────────────────────────────────────────────────────
  fastify.get("/", async (req, reply) => {
    const customerId = (req as typeof req & { customerId: string }).customerId;
    const { page = "1", limit = "10" } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      OrderModel.find({ customerId }).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      OrderModel.countDocuments({ customerId }),
    ]);

    return reply.send({
      success: true,
      data: { items, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  });

  // ── GET /orders/:id ────────────────────────────────────────────────────────
  fastify.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const customerId = (req as typeof req & { customerId: string }).customerId;
    const order      = await OrderModel.findOne({ _id: req.params.id, customerId }).lean();
    if (!order) return reply.status(404).send({ success: false, error: "Không tìm thấy đơn hàng" });
    return reply.send({ success: true, data: order });
  });

  // ── POST /orders ───────────────────────────────────────────────────────────
  fastify.post("/", async (req, reply) => {
    const customerId    = (req as typeof req & { customerId: string }).customerId;
    const customerEmail = (req as typeof req & { customerEmail: string }).customerEmail;

    const body = CreateOrderSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({
        success: false,
        error:  "Dữ liệu không hợp lệ",
        issues: body.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      });
    }

    const { items: reqItems, shippingAddress, note, paymentMethod, couponCode } = body.data;

    // ── Fetch & validate products ────────────────────────────────────────────
    const productIds = reqItems.map((i) => i.productId);
    const products   = await ProductModel.find({ _id: { $in: productIds }, isActive: true });

    const productMap = new Map(products.map((p) => [p.id as string, p]));
    const orderItems = [];
    let subtotal = 0;

    for (const reqItem of reqItems) {
      const product = productMap.get(reqItem.productId);
      if (!product) {
        return reply.status(422).send({ success: false, error: `Sản phẩm ${reqItem.productId} không tồn tại` });
      }
      if (product.stock < reqItem.qty) {
        return reply.status(422).send({
          success: false,
          error: `Sản phẩm "${product.nameVi}" không đủ hàng (còn ${product.stock})`,
        });
      }
      const itemSubtotal = product.price * reqItem.qty;
      orderItems.push({
        productId: product._id,
        slug:      product.slug,
        nameVi:    product.nameVi,
        nameEn:    product.nameEn,
        gradient:  product.gradient,
        petals:    product.petals,
        qty:       reqItem.qty,
        unitPrice: product.price,
        subtotal:  itemSubtotal,
      });
      subtotal += itemSubtotal;
    }

    // ── Shipping fee ────────────────────────────────────────────────────────
    const shippingFee = subtotal >= 1_000_000 ? 0 : 30_000;
    const discount    = 0; // TODO: coupon processing
    const total       = subtotal + shippingFee - discount;

    // ── Build full address string ────────────────────────────────────────────
    const { detail, wardName, districtName, provinceName, ...restAddr } = shippingAddress;
    const fullAddress = `${detail}, ${wardName}, ${districtName}, ${provinceName}`;

    // ── Generate order number ────────────────────────────────────────────────
    const orderNumber = await generateOrderNumber();

    // ── Create order ─────────────────────────────────────────────────────────
    const order = await OrderModel.create({
      orderNumber,
      customerId,
      items: orderItems,
      shippingAddress: { ...restAddr, detail, wardName, districtName, provinceName, full: fullAddress },
      note,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      status:        paymentMethod === "cod" ? "confirmed" : "pending",
      subtotal,
      shippingFee,
      discount,
      total,
      couponCode,
      statusHistory: [{ status: paymentMethod === "cod" ? "confirmed" : "pending", at: new Date() }],
    });

    // ── Deduct stock atomically ──────────────────────────────────────────────
    await Promise.all(
      orderItems.map(async (item) => {
        const updated = await ProductModel.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.qty } },
          { new: true }
        );
        if (updated) {
          await InventoryLogModel.create({
            productId:  item.productId,
            delta:      -item.qty,
            reason:     "order_placed",
            orderId:    order._id,
            stockAfter: updated.stock,
          });
        }
      })
    );

    // ── Send confirmation email (non-blocking) ───────────────────────────────
    sendOrderConfirmation(customerEmail, order).catch((err) =>
      console.error("[Email] order confirmation failed:", err)
    );

    return reply.status(201).send({ success: true, data: order.toJSON() });
  });
};

export default ordersRoutes;
