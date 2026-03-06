import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { ProductModel, AuditLogModel, InventoryLogModel } from "@hanami/db";
import { CreateProductSchema, UpdateProductSchema } from "@hanami/types";
import { verifyAdminToken } from "../lib/jwt";

function requirePermission(permission: string) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return reply.status(401).send({ success: false, error: "Unauthorized" });
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

const adminProductsRoutes: FastifyPluginAsync = async (fastify) => {

  // ── GET /admin/products ─────────────────────────────────────────────────────
  fastify.get("/", { preHandler: [requirePermission("products:read")] }, async (req, reply) => {
    const { page = "1", limit = "20", q, includeInactive } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (!includeInactive) filter.isActive = true;
    if (q) filter.$text = { $search: q };

    const [items, total] = await Promise.all([
      ProductModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      ProductModel.countDocuments(filter),
    ]);

    return reply.send({
      success: true,
      data: { items, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  });

  // ── POST /admin/products ────────────────────────────────────────────────────
  fastify.post("/", { preHandler: [requirePermission("products:write")] }, async (req, reply) => {
    const staff = (req as FastifyRequest & { staff: ReturnType<typeof verifyAdminToken> }).staff;
    const body  = CreateProductSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({
        success: false, error: "Dữ liệu không hợp lệ",
        issues: body.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      });
    }

    const existing = await ProductModel.findOne({ slug: body.data.slug });
    if (existing) return reply.status(409).send({ success: false, error: "Slug đã tồn tại" });

    const product = await ProductModel.create(body.data);

    // Log initial stock
    if (body.data.stock > 0) {
      await InventoryLogModel.create({
        productId:  product._id,
        delta:      body.data.stock,
        reason:     "manual_restock",
        staffId:    staff.sub,
        stockAfter: body.data.stock,
        note:       "Initial stock",
      });
    }

    await AuditLogModel.create({
      actorId: staff.sub, actorType: "staff", actorName: staff.email,
      action: "product.create", resource: "Product", resourceId: product.id,
      diff: body.data, ip: req.ip,
    });

    return reply.status(201).send({ success: true, data: product.toJSON() });
  });

  // ── PUT /admin/products/:id ─────────────────────────────────────────────────
  fastify.put<{ Params: { id: string } }>(
    "/:id", { preHandler: [requirePermission("products:write")] },
    async (req, reply) => {
      const staff  = (req as FastifyRequest & { staff: ReturnType<typeof verifyAdminToken> }).staff;
      const body   = UpdateProductSchema.safeParse(req.body);
      if (!body.success) {
        return reply.status(400).send({ success: false, error: "Dữ liệu không hợp lệ" });
      }

      const before  = await ProductModel.findById(req.params.id).lean();
      if (!before) return reply.status(404).send({ success: false, error: "Sản phẩm không tồn tại" });

      const updated = await ProductModel.findByIdAndUpdate(req.params.id, body.data, { new: true });

      // If stock was changed, log it
      if (body.data.stock !== undefined && body.data.stock !== before.stock) {
        const delta = body.data.stock - before.stock;
        await InventoryLogModel.create({
          productId:  req.params.id,
          delta,
          reason:     "manual_adjustment",
          staffId:    staff.sub,
          stockAfter: body.data.stock,
        });
      }

      await AuditLogModel.create({
        actorId: staff.sub, actorType: "staff", actorName: staff.email,
        action: "product.update", resource: "Product", resourceId: req.params.id,
        diff: { before, after: body.data }, ip: req.ip,
      });

      return reply.send({ success: true, data: updated?.toJSON() });
    }
  );

  // ── DELETE /admin/products/:id  (soft delete) ───────────────────────────────
  fastify.delete<{ Params: { id: string } }>(
    "/:id", { preHandler: [requirePermission("products:write")] },
    async (req, reply) => {
      const staff = (req as FastifyRequest & { staff: ReturnType<typeof verifyAdminToken> }).staff;
      const product = await ProductModel.findByIdAndUpdate(
        req.params.id, { isActive: false }, { new: true }
      );
      if (!product) return reply.status(404).send({ success: false, error: "Sản phẩm không tồn tại" });

      await AuditLogModel.create({
        actorId: staff.sub, actorType: "staff", actorName: staff.email,
        action: "product.deactivate", resource: "Product", resourceId: req.params.id,
        ip: req.ip,
      });

      return reply.send({ success: true, data: { deactivated: true } });
    }
  );
};

export default adminProductsRoutes;
