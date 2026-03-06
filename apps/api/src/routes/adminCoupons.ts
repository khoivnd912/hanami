import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { CouponModel } from "@hanami/db";
import { verifyAdminToken } from "../lib/jwt";
import { z } from "zod";

function requirePermission(permission: string) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return reply.status(401).send({ success: false, error: "Unauthorized" });
    }
    try {
      const payload = verifyAdminToken(auth.slice(7));
      if (!payload.permissions.includes(permission)) {
        return reply.status(403).send({ success: false, error: "Không có quyền" });
      }
      (req as FastifyRequest & { staff: typeof payload }).staff = payload;
    } catch {
      return reply.status(401).send({ success: false, error: "Token không hợp lệ" });
    }
  };
}

const CouponSchema = z.object({
  code:        z.string().min(3).max(20).toUpperCase(),
  type:        z.enum(["percent", "fixed", "free_shipping"]),
  value:       z.number().min(0),
  minOrder:    z.number().min(0).default(0),
  usageLimit:  z.number().min(0).default(0),
  expiresAt:   z.string().datetime().optional(),
  isActive:    z.boolean().default(true),
});

const adminCouponsRoutes: FastifyPluginAsync = async (fastify) => {

  // ── GET /admin/coupons ───────────────────────────────────────────────────────
  fastify.get("/", { preHandler: [requirePermission("coupons:manage")] }, async (req, reply) => {
    const { page = "1", limit = "20", q } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (q) filter.code = { $regex: q.toUpperCase(), $options: "i" };

    const [items, total] = await Promise.all([
      CouponModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      CouponModel.countDocuments(filter),
    ]);

    return reply.send({
      success: true,
      data: { items, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  });

  // ── POST /admin/coupons ──────────────────────────────────────────────────────
  fastify.post("/", { preHandler: [requirePermission("coupons:manage")] }, async (req, reply) => {
    const body = CouponSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ success: false, error: "Dữ liệu không hợp lệ" });
    }

    const existing = await CouponModel.findOne({ code: body.data.code });
    if (existing) return reply.status(409).send({ success: false, error: "Mã giảm giá đã tồn tại" });

    const coupon = await CouponModel.create({
      ...body.data,
      expiresAt: body.data.expiresAt ? new Date(body.data.expiresAt) : undefined,
    });
    return reply.status(201).send({ success: true, data: coupon.toJSON() });
  });

  // ── PUT /admin/coupons/:id ───────────────────────────────────────────────────
  fastify.put<{ Params: { id: string } }>(
    "/:id", { preHandler: [requirePermission("coupons:manage")] },
    async (req, reply) => {
      const body = CouponSchema.partial().safeParse(req.body);
      if (!body.success) {
        return reply.status(400).send({ success: false, error: "Dữ liệu không hợp lệ" });
      }
      const coupon = await CouponModel.findByIdAndUpdate(req.params.id, body.data, { new: true });
      if (!coupon) return reply.status(404).send({ success: false, error: "Mã giảm giá không tồn tại" });
      return reply.send({ success: true, data: coupon.toJSON() });
    }
  );

  // ── DELETE /admin/coupons/:id ────────────────────────────────────────────────
  fastify.delete<{ Params: { id: string } }>(
    "/:id", { preHandler: [requirePermission("coupons:manage")] },
    async (req, reply) => {
      const coupon = await CouponModel.findByIdAndDelete(req.params.id);
      if (!coupon) return reply.status(404).send({ success: false, error: "Mã giảm giá không tồn tại" });
      return reply.send({ success: true, data: null });
    }
  );
};

export default adminCouponsRoutes;
