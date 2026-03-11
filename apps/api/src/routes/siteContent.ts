import type { FastifyPluginAsync } from "fastify";
import { SiteContentModel } from "@hanami/db";

const siteContentRoutes: FastifyPluginAsync = async (fastify) => {

  // ── GET /site-content/:key ──────────────────────────────────────────────────
  fastify.get<{ Params: { key: string } }>("/:key", async (req, reply) => {
    const doc = await SiteContentModel.findOne({ key: req.params.key }).lean();
    if (!doc) {
      return reply.status(404).send({ success: false, error: "Nội dung không tồn tại" });
    }
    return reply.send({ success: true, data: doc });
  });

};

export default siteContentRoutes;
