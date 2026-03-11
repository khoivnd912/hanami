import type { FastifyPluginAsync } from "fastify";
import { InventoryLogModel, ProductModel } from "@hanami/db";
import { requirePermission } from "../lib/middleware";

const adminInventoryRoutes: FastifyPluginAsync = async (fastify) => {

  // ── GET /admin/inventory ─────────────────────────────────────────────────────
  fastify.get("/", { preHandler: [requirePermission("products:read")] }, async (req, reply) => {
    const { page = "1", limit = "30", productId, reason } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (productId) filter.productId = productId;
    if (reason)    filter.reason    = reason;

    const [items, total] = await Promise.all([
      InventoryLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      InventoryLogModel.countDocuments(filter),
    ]);

    return reply.send({
      success: true,
      data: { items, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  });

  // ── GET /admin/inventory/low-stock ───────────────────────────────────────────
  fastify.get("/low-stock", { preHandler: [requirePermission("products:read")] }, async (_req, reply) => {
    const products = await ProductModel.find({ isActive: true, stock: { $lte: 5 } })
      .select("nameVi slug stock")
      .sort({ stock: 1 })
      .lean();
    return reply.send({ success: true, data: products });
  });
};

export default adminInventoryRoutes;
