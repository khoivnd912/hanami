import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { AuditLogModel } from "@hanami/db";
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

const adminAuditRoutes: FastifyPluginAsync = async (fastify) => {

  // ── GET /admin/audit ─────────────────────────────────────────────────────────
  fastify.get("/", { preHandler: [requirePermission("audit:read")] }, async (req, reply) => {
    const {
      page = "1", limit = "30",
      actorId, resource, action,
      from, to,
    } = req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (actorId)  filter.actorId  = actorId;
    if (resource) filter.resource = resource;
    if (action)   filter.action   = { $regex: action, $options: "i" };
    if (from || to) {
      filter.createdAt = {
        ...(from ? { $gte: new Date(from) } : {}),
        ...(to   ? { $lte: new Date(to)   } : {}),
      };
    }

    const [items, total] = await Promise.all([
      AuditLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      AuditLogModel.countDocuments(filter),
    ]);

    return reply.send({
      success: true,
      data: { items, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  });
};

export default adminAuditRoutes;
