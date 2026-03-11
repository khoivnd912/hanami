import type { FastifyPluginAsync } from "fastify";
import { OrderModel, AuditLogModel, ProductModel, InventoryLogModel } from "@hanami/db";
import { UpdateOrderStatusSchema } from "@hanami/types";
import { requirePermission } from "../lib/middleware";
import { sendDispatchNotification } from "../lib/email";
import { generateOrderNumber } from "../lib/orderNumber";

// ─── Routes ───────────────────────────────────────────────────────────────────

const adminOrdersRoutes: FastifyPluginAsync = async (fastify) => {

  // ── GET /admin/orders ───────────────────────────────────────────────────────
  fastify.get("/", { preHandler: [requirePermission("orders:read")] }, async (req, reply) => {
    const {
      page   = "1",
      limit  = "20",
      status,
      q,
      from,
      to,
    } = req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (q)      filter.orderNumber = { $regex: q, $options: "i" };
    if (from || to) {
      filter.createdAt = {
        ...(from ? { $gte: new Date(from) } : {}),
        ...(to   ? { $lte: new Date(to)   } : {}),
      };
    }

    const [items, total] = await Promise.all([
      OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      OrderModel.countDocuments(filter),
    ]);

    return reply.send({
      success: true,
      data: { items, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  });

  // ── GET /admin/orders/:id ───────────────────────────────────────────────────
  fastify.get<{ Params: { id: string } }>(
    "/:id", { preHandler: [requirePermission("orders:read")] },
    async (req, reply) => {
      const order = await OrderModel.findById(req.params.id).lean();
      if (!order) return reply.status(404).send({ success: false, error: "Không tìm thấy đơn hàng" });
      return reply.send({ success: true, data: order });
    }
  );

  // ── PUT /admin/orders/:id/status ────────────────────────────────────────────
  fastify.put<{ Params: { id: string } }>(
    "/:id/status", { preHandler: [requirePermission("orders:update")] },
    async (req, reply) => {
      const { staff } = req;

      const body = UpdateOrderStatusSchema.safeParse(req.body);
      if (!body.success) {
        return reply.status(400).send({ success: false, error: "Dữ liệu không hợp lệ" });
      }

      const order = await OrderModel.findById(req.params.id);
      if (!order) return reply.status(404).send({ success: false, error: "Không tìm thấy đơn hàng" });

      const prevStatus = order.status;
      order.status    = body.data.status;
      if (body.data.staffNote) order.staffNote = body.data.staffNote;
      order.statusHistory.push({
        status:  body.data.status,
        note:    body.data.staffNote,
        staffId: staff.sub as unknown as import("mongoose").Schema.Types.ObjectId,
        at:      new Date(),
      });
      await order.save();

      // If moving to "shipping", send dispatch email
      if (body.data.status === "shipping" && order.trackingCode) {
        const contactEmail = order.guestEmail ?? "";
        if (contactEmail) {
          sendDispatchNotification(contactEmail, order.orderNumber, order.trackingCode)
            .catch((err) => console.error("[Email] dispatch failed:", err));
        }
      }

      // If cancelled, restore stock
      if (body.data.status === "cancelled" && prevStatus !== "cancelled") {
        const updated = await Promise.all(
          order.items.map((item) =>
            ProductModel.findByIdAndUpdate(
              item.productId,
              { $inc: { stock: item.qty } },
              { new: true }
            ).then((p) => p ? { item, stockAfter: p.stock } : null)
          )
        );
        const logs = updated
          .filter((r): r is { item: (typeof order.items)[number]; stockAfter: number } => r !== null)
          .map(({ item, stockAfter }) => ({
            productId:  item.productId,
            delta:      item.qty,
            reason:     "order_cancelled",
            orderId:    order._id,
            staffId:    staff.sub,
            stockAfter,
          }));
        if (logs.length) await InventoryLogModel.insertMany(logs);
      }

      // Audit
      await AuditLogModel.create({
        actorId:    staff.sub,
        actorType:  "staff",
        actorName:  staff.email,
        action:     "order.status.update",
        resource:   "Order",
        resourceId: order.id,
        diff:       { from: prevStatus, to: body.data.status },
        ip:         req.ip,
      });

      return reply.send({ success: true, data: order.toJSON() });
    }
  );

  // ── POST /admin/orders/manual ───────────────────────────────────────────────
  fastify.post(
    "/manual", { preHandler: [requirePermission("orders:update")] },
    async (req, reply) => {
      const { staff } = req;

      const {
        customerName,
        phone,
        address,
        source       = "other",
        items        = [],
        paymentMethod = "cod",
        paymentStatus = "pending",
        note,
        staffNote,
        createdAt: customDate,
      } = req.body as {
        customerName:  string;
        phone:         string;
        address?:      string;
        source?:       string;
        items:         { name: string; qty: number; unitPrice: number }[];
        paymentMethod?: string;
        paymentStatus?: string;
        note?:         string;
        staffNote?:    string;
        createdAt?:    string;
      };

      if (!customerName?.trim() || !phone?.trim()) {
        return reply.status(400).send({ success: false, error: "Tên và số điện thoại là bắt buộc" });
      }
      if (!items.length) {
        return reply.status(400).send({ success: false, error: "Phải có ít nhất 1 sản phẩm" });
      }

      const orderItems = items.map((it) => ({
        slug:      "manual",
        nameVi:    it.name.trim(),
        nameEn:    it.name.trim(),
        gradient:  "",
        qty:       it.qty,
        unitPrice: it.unitPrice,
        subtotal:  it.qty * it.unitPrice,
      }));

      const subtotal = orderItems.reduce((s, it) => s + it.subtotal, 0);
      const orderNumber = await generateOrderNumber();
      const fullAddress = address?.trim() || phone.trim();

      const order = await OrderModel.create({
        orderNumber,
        items:  orderItems,
        shippingAddress: {
          name:  customerName.trim(),
          phone: phone.trim(),
          full:  fullAddress,
        },
        note:          note?.trim(),
        staffNote:     staffNote?.trim(),
        status:        "confirmed",
        paymentMethod: ["cod", "vnpay", "momo"].includes(paymentMethod) ? paymentMethod : "cod",
        paymentStatus: ["pending", "paid", "failed"].includes(paymentStatus) ? paymentStatus : "pending",
        subtotal,
        shippingFee: 0,
        discount:    0,
        total:       subtotal,
        source,
        statusHistory: [{ status: "confirmed", note: `Nhập tay từ ${source}`, at: new Date() }],
        ...(customDate ? { createdAt: new Date(customDate) } : {}),
      });

      await AuditLogModel.create({
        actorId:    staff.sub,
        actorType:  "staff",
        actorName:  staff.email,
        action:     "order.create.manual",
        resource:   "Order",
        resourceId: String(order._id),
        diff:       { source, total: subtotal },
        ip:         req.ip,
      });

      return reply.status(201).send({ success: true, data: order.toJSON() });
    }
  );

  // ── DELETE /admin/orders/:id ─────────────────────────────────────────────────
  fastify.delete<{ Params: { id: string } }>(
    "/:id", { preHandler: [requirePermission("orders:update")] },
    async (req, reply) => {
      const order = await OrderModel.findById(req.params.id);
      if (!order) return reply.status(404).send({ success: false, error: "Không tìm thấy đơn hàng" });
      if (!["manual", "facebook", "zalo", "instagram", "other"].includes(order.source ?? "")) {
        return reply.status(403).send({ success: false, error: "Chỉ có thể xoá đơn nhập tay" });
      }
      await order.deleteOne();
      return reply.send({ success: true, data: null });
    }
  );

  // ── PUT /admin/orders/:id/tracking ──────────────────────────────────────────
  fastify.put<{ Params: { id: string } }>(
    "/:id/tracking", { preHandler: [requirePermission("orders:update")] },
    async (req, reply) => {
      const { trackingCode } = req.body as { trackingCode?: string };
      if (!trackingCode?.trim()) {
        return reply.status(400).send({ success: false, error: "Mã vận đơn không được trống" });
      }
      const order = await OrderModel.findByIdAndUpdate(
        req.params.id,
        { trackingCode: trackingCode.trim() },
        { new: true }
      );
      if (!order) return reply.status(404).send({ success: false, error: "Không tìm thấy đơn hàng" });
      return reply.send({ success: true, data: order.toJSON() });
    }
  );
};

export default adminOrdersRoutes;
