import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { CustomerModel } from "@hanami/db";
import { verifyAdminToken } from "../lib/jwt";

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

const adminCustomersRoutes: FastifyPluginAsync = async (fastify) => {

  // ── GET /admin/customers ─────────────────────────────────────────────────────
  fastify.get("/", { preHandler: [requirePermission("customers:read")] }, async (req, reply) => {
    const { page = "1", limit = "20", q, isActive } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (q) {
      filter.$or = [
        { email:   { $regex: q, $options: "i" } },
        { name:    { $regex: q, $options: "i" } },
        { phone:   { $regex: q, $options: "i" } },
      ];
    }
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const [items, total] = await Promise.all([
      CustomerModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select("-hashedPassword -verifyToken -resetToken -resetExpires")
        .lean(),
      CustomerModel.countDocuments(filter),
    ]);

    return reply.send({
      success: true,
      data: { items, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  });

  // ── GET /admin/customers/:id ─────────────────────────────────────────────────
  fastify.get<{ Params: { id: string } }>(
    "/:id", { preHandler: [requirePermission("customers:read")] },
    async (req, reply) => {
      const customer = await CustomerModel.findById(req.params.id)
        .select("-hashedPassword -verifyToken -resetToken -resetExpires")
        .lean();
      if (!customer) return reply.status(404).send({ success: false, error: "Khách hàng không tồn tại" });
      return reply.send({ success: true, data: customer });
    }
  );

  // ── PATCH /admin/customers/:id/status ────────────────────────────────────────
  fastify.patch<{ Params: { id: string } }>(
    "/:id/status", { preHandler: [requirePermission("customers:manage")] },
    async (req, reply) => {
      const { isActive } = req.body as { isActive?: boolean };
      if (typeof isActive !== "boolean") {
        return reply.status(400).send({ success: false, error: "isActive phải là boolean" });
      }
      const customer = await CustomerModel.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
      ).select("-hashedPassword").lean();
      if (!customer) return reply.status(404).send({ success: false, error: "Khách hàng không tồn tại" });
      return reply.send({ success: true, data: customer });
    }
  );
};

export default adminCustomersRoutes;
