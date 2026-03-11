import type { FastifyPluginAsync } from "fastify";
import { ConsultationModel, AuditLogModel } from "@hanami/db";
import { requirePermission } from "../lib/middleware";

const adminConsultationsRoutes: FastifyPluginAsync = async (fastify) => {

  // ── GET /admin/consultations ───────────────────────────────────────────────
  fastify.get("/", { preHandler: [requirePermission("consultations:read")] }, async (req, reply) => {
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

  // ── POST /admin/consultations ─────────────────────────────────────────────
  fastify.post("/", { preHandler: [requirePermission("consultations:write")] }, async (req, reply) => {
    const { staff } = req;
    const { name, email, phone, source, message, deliveryDate, status, staffNote } =
      req.body as Record<string, string>;

    if (!name?.trim() || !message?.trim()) {
      return reply.status(400).send({ success: false, error: "Tên và nội dung là bắt buộc" });
    }

    const consultation = await ConsultationModel.create({
      name:         name.trim(),
      email:        email?.trim().toLowerCase() || undefined,
      phone:        phone?.trim()  || undefined,
      source:       source || "other",
      message:      message.trim(),
      deliveryDate: deliveryDate || undefined,
      status:       status || "new",
      staffNote:    staffNote?.trim() || undefined,
    });

    await AuditLogModel.create({
      actorId: staff.sub, actorType: "staff", actorName: staff.email,
      action: "consultation.create", resource: "Consultation", resourceId: consultation.id,
      diff: { name: consultation.name, email: consultation.email, source: consultation.source },
      ip: req.ip,
    });

    return reply.status(201).send({ success: true, data: consultation.toJSON() });
  });

  // ── DELETE /admin/consultations/:id ───────────────────────────────────────
  fastify.delete<{ Params: { id: string } }>("/:id", { preHandler: [requirePermission("consultations:write")] }, async (req, reply) => {
    const { staff } = req;
    const deleted = await ConsultationModel.findByIdAndDelete(req.params.id);
    if (!deleted) return reply.status(404).send({ success: false, error: "Không tìm thấy" });

    await AuditLogModel.create({
      actorId: staff.sub, actorType: "staff", actorName: staff.email,
      action: "consultation.delete", resource: "Consultation", resourceId: req.params.id,
      diff: { name: deleted.name, email: deleted.email },
      ip: req.ip,
    });

    return reply.send({ success: true, data: null });
  });

  // ── PATCH /admin/consultations/:id/status ─────────────────────────────────
  fastify.patch<{ Params: { id: string } }>("/:id/status", { preHandler: [requirePermission("consultations:write")] }, async (req, reply) => {
    const { staff } = req;
    const { status, staffNote } = req.body as { status: string; staffNote?: string };
    const VALID = ["new", "contacted", "done"];
    if (!VALID.includes(status)) {
      return reply.status(400).send({ success: false, error: "Trạng thái không hợp lệ" });
    }

    const before = await ConsultationModel.findById(req.params.id).select("status").lean();
    const consultation = await ConsultationModel.findByIdAndUpdate(
      req.params.id,
      { status, ...(staffNote !== undefined ? { staffNote } : {}) },
      { new: true }
    ).lean();

    if (!consultation) {
      return reply.status(404).send({ success: false, error: "Không tìm thấy yêu cầu" });
    }

    await AuditLogModel.create({
      actorId: staff.sub, actorType: "staff", actorName: staff.email,
      action: "consultation.status.update", resource: "Consultation", resourceId: req.params.id,
      diff: { from: before?.status, to: status, ...(staffNote !== undefined ? { staffNote } : {}) },
      ip: req.ip,
    });

    return reply.send({ success: true, data: consultation });
  });
};

export default adminConsultationsRoutes;
