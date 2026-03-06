import type { FastifyPluginAsync } from "fastify";
import { ProductModel } from "@hanami/db";

const productsRoutes: FastifyPluginAsync = async (fastify) => {

  // ── GET /products ───────────────────────────────────────────────────────────
  fastify.get("/", async (req, reply) => {
    const {
      page  = "1",
      limit = "12",
      tag,
      sort  = "createdAt",
      order = "desc",
      q,
    } = req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    // Build filter
    const filter: Record<string, unknown> = { isActive: true };
    if (tag)  filter.tag = tag;
    if (q)    filter.$text = { $search: q };

    const sortDir = order === "asc" ? 1 : -1;

    const [items, total] = await Promise.all([
      ProductModel.find(filter)
        .sort({ [sort]: sortDir })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ProductModel.countDocuments(filter),
    ]);

    return reply.send({
      success: true,
      data: {
        items,
        total,
        page:  pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  });

  // ── GET /products/featured ──────────────────────────────────────────────────
  fastify.get("/featured", async (_req, reply) => {
    const items = await ProductModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();
    return reply.send({ success: true, data: items });
  });

  // ── GET /products/:slug ─────────────────────────────────────────────────────
  fastify.get<{ Params: { slug: string } }>("/:slug", async (req, reply) => {
    const product = await ProductModel.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!product) {
      return reply.status(404).send({ success: false, error: "Sản phẩm không tồn tại" });
    }

    // Related: same tag, exclude current
    const related = await ProductModel.find({
      isActive: true,
      _id:      { $ne: product._id },
      ...(product.tag ? { tag: product.tag } : {}),
    })
      .limit(4)
      .lean();

    return reply.send({ success: true, data: { product, related } });
  });
};

export default productsRoutes;
