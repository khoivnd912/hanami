import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { OrderModel, AuditLogModel, ProductModel, InventoryLogModel } from "@hanami/db";
import { UpdateOrderStatusSchema } from "@hanami/types";
import { verifyAdminToken } from "../lib/jwt";
import { sendDispatchNotification } from "../lib/email";

// ─── Auth + RBAC hook ─────────────────────────────────────────────────────────

function requirePermission(permission: string) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return reply.status(401).send({ success: false, error: "Unauthorized" });
    }
    try {
      const payload = verifyAdminToken(auth.slice(7));
      if (!payload.permissions.includes(permission)) {
        return reply.status(403).send({ success: false, error: "Không có quyền thực hiện thao tác này" });
      }
      (req as FastifyRequest & { staff: typeof payload }).staff = payload;
    } catch {
      return reply.status(401).send({ success: false, error: "Token không hợp lệ" });
    }
  };
}

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
      const staff = (req as FastifyRequest & { staff: ReturnType<typeof verifyAdminToken> }).staff;

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
        await Promise.all(
          order.items.map(async (item) => {
            const updated = await ProductModel.findByIdAndUpdate(
              item.productId,
              { $inc: { stock: item.qty } },
              { new: true }
            );
            if (updated) {
              await InventoryLogModel.create({
                productId:  item.productId,
                delta:      item.qty,
                reason:     "order_cancelled",
                orderId:    order._id,
                staffId:    staff.sub,
                stockAfter: updated.stock,
              });
            }
          })
        );
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
