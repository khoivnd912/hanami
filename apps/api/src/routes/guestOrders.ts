import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ProductModel, OrderModel, InventoryLogModel } from "@hanami/db";
import { generateOrderNumber } from "../lib/orderNumber";
import { sendOrderConfirmation } from "../lib/email";

// ─── Schema ───────────────────────────────────────────────────────────────────

const GuestOrderSchema = z.object({
  guestEmail: z.string().email("Email không hợp lệ"),
  items: z.array(z.object({
    productId: z.string().min(1),
    qty:       z.number().int().positive(),
  })).min(1, "Giỏ hàng trống"),
  shippingAddress: z.object({
    name:         z.string().min(2, "Tên ít nhất 2 ký tự"),
    phone:        z.string().min(9, "Số điện thoại không hợp lệ"),
    province:     z.string(),
    provinceName: z.string().min(1, "Vui lòng chọn tỉnh / thành"),
    district:     z.string(),
    districtName: z.string(),
    ward:         z.string(),
    wardName:     z.string(),
    detail:       z.string().min(5, "Vui lòng nhập địa chỉ chi tiết"),
  }),
  paymentMethod: z.enum(["cod", "bank_transfer"]),
  note:          z.string().optional(),
});

// ─── Route ────────────────────────────────────────────────────────────────────

const guestOrdersRoutes: FastifyPluginAsync = async (fastify) => {

  fastify.post("/", async (req, reply) => {
    const body = GuestOrderSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({
        success: false,
        error:   "Dữ liệu không hợp lệ",
        issues:  body.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      });
    }

    const { guestEmail, items: reqItems, shippingAddress, paymentMethod, note } = body.data;

    // ── Validate products & stock ────────────────────────────────────────────
    const productIds = reqItems.map((i) => i.productId);
    const products   = await ProductModel.find({ _id: { $in: productIds }, isActive: true });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const orderItems = [];
    let subtotal = 0;

    for (const reqItem of reqItems) {
      const product = productMap.get(reqItem.productId);
      if (!product) {
        return reply.status(422).send({
          success: false,
          error: "Sản phẩm không tồn tại hoặc đã ngừng bán",
        });
      }
      if (product.stock < reqItem.qty) {
        return reply.status(422).send({
          success: false,
          error: `"${product.nameVi}" không đủ hàng (còn ${product.stock} sản phẩm)`,
        });
      }
      const itemSubtotal = product.price * reqItem.qty;
      orderItems.push({
        productId: product._id,
        slug:      product.slug,
        nameVi:    product.nameVi,
        nameEn:    product.nameEn,
        gradient:  product.gradient,
        qty:       reqItem.qty,
        unitPrice: product.price,
        subtotal:  itemSubtotal,
      });
      subtotal += itemSubtotal;
    }

    // ── Pricing ───────────────────────────────────────────────────────────────
    const shippingFee = subtotal >= 1_000_000 ? 0 : 30_000;
    const total       = subtotal + shippingFee;

    // ── Build address ─────────────────────────────────────────────────────────
    const { detail, provinceName, districtName, wardName, ...addrCodes } = shippingAddress;
    const fullAddress = [detail, wardName, districtName, provinceName].filter(Boolean).join(", ");

    // ── bank_transfer → map to "cod" + note ──────────────────────────────────
    const storedPayment = "cod";
    const staffNote     = paymentMethod === "bank_transfer"
      ? "Khách chọn: Chuyển khoản ngân hàng"
      : undefined;

    // ── Create order ──────────────────────────────────────────────────────────
    const orderNumber = await generateOrderNumber();
    const order = await OrderModel.create({
      orderNumber,
      guestEmail,
      items: orderItems,
      shippingAddress: {
        ...addrCodes,
        detail,
        provinceName,
        districtName,
        wardName,
        full: fullAddress,
      },
      note,
      paymentMethod:  storedPayment,
      paymentStatus:  "pending",
      status:         "pending",
      subtotal,
      shippingFee,
      discount:       0,
      total,
      staffNote,
      statusHistory:  [{ status: "pending", at: new Date() }],
    });

    // ── Deduct stock ──────────────────────────────────────────────────────────
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

    // ── Confirmation email (non-blocking) ─────────────────────────────────────
    sendOrderConfirmation(guestEmail, order).catch((err) =>
      console.error("[Email] guest order confirmation failed:", err)
    );

    return reply.status(201).send({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        total:       order.total,
        _id:         order.id,
      },
    });
  });
};

export default guestOrdersRoutes;
