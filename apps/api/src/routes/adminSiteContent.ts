import type { FastifyPluginAsync } from "fastify";
import { SiteContentModel, AuditLogModel } from "@hanami/db";
import { requirePermission } from "../lib/middleware";

const adminSiteContentRoutes: FastifyPluginAsync = async (fastify) => {

  // ── GET /admin/site-content/:key ────────────────────────────────────────────
  fastify.get<{ Params: { key: string } }>(
    "/:key",
    { preHandler: [requirePermission("content:write")] },
    async (req, reply) => {
      const doc = await SiteContentModel.findOne({ key: req.params.key }).lean();
      return reply.send({ success: true, data: doc ?? null });
    }
  );

  // ── PUT /admin/site-content/:key ────────────────────────────────────────────
  fastify.put<{ Params: { key: string }; Body: Record<string, unknown> }>(
    "/:key",
    { preHandler: [requirePermission("content:write")] },
    async (req, reply) => {
      const { staff } = req;
      const { key } = req.params;

      // Strip protected fields, set everything else
      const { key: _k, _id, __v, createdAt, updatedAt, ...fields } = req.body as Record<string, unknown>;
      void _k; void _id; void __v; void createdAt; void updatedAt;

      const doc = await SiteContentModel.findOneAndUpdate(
        { key },
        { $set: fields },
        { upsert: true, new: true, runValidators: true }
      ).lean();

      await AuditLogModel.create({
        actorId: staff.sub, actorType: "staff", actorName: staff.email,
        action: "site_content.update", resource: "SiteContent", resourceId: key,
        diff: { section: key },
        ip: req.ip,
      });

      return reply.send({ success: true, data: doc });
    }
  );

};

export default adminSiteContentRoutes;
