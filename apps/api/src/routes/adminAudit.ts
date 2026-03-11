import type { FastifyPluginAsync } from "fastify";
import { AuditLogModel } from "@hanami/db";
import { requirePermission } from "../lib/middleware";

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
