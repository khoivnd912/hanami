import type { FastifyPluginAsync } from "fastify";
import { ConsultationModel } from "@hanami/db";
import { verifyAdminToken } from "../lib/jwt";

const adminConsultationsRoutes: FastifyPluginAsync = async (fastify) => {

  // ── Auth middleware ────────────────────────────────────────────────────────
  fastify.addHook("onRequest", async (req, reply) => {
    if (req.method === "OPTIONS") return;
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return reply.status(401).send({ success: false, error: "Yêu cầu đăng nhập" });
    }
    try {
      verifyAdminToken(auth.slice(7));
    } catch {
      return reply.status(401).send({ success: false, error: "Token không hợp lệ" });
    }
  });

  // ── GET /admin/consultations ───────────────────────────────────────────────
  fastify.get("/", async (req, reply) => {
    const {
      page   = "1",
      limit  = "20",
      status = "",
      q      = "",
    } = req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (q)      filter.$or = [
      { name:    { $regex: q, $options: "i" } },
      { email:   { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
    ];

    const [items, total] = await Promise.all([
      ConsultationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      ConsultationModel.countDocuments(filter),
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

  // ── PATCH /admin/consultations/:id/status ─────────────────────────────────
  fastify.patch<{ Params: { id: string } }>("/:id/status", async (req, reply) => {
    const { status, staffNote } = req.body as { status: string; staffNote?: string };
    const VALID = ["new", "contacted", "done"];
    if (!VALID.includes(status)) {
      return reply.status(400).send({ success: false, error: "Trạng thái không hợp lệ" });
    }

    const consultation = await ConsultationModel.findByIdAndUpdate(
      req.params.id,
      { status, ...(staffNote !== undefined ? { staffNote } : {}) },
      { new: true }
    ).lean();

    if (!consultation) {
      return reply.status(404).send({ success: false, error: "Không tìm thấy yêu cầu" });
    }

    return reply.send({ success: true, data: consultation });
  });
};

export default adminConsultationsRoutes;
