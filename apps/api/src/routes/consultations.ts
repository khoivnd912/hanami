import type { FastifyPluginAsync } from "fastify";
import { ConsultationModel } from "@hanami/db";
import { sendConsultationNotification } from "../lib/email";

const consultationsRoutes: FastifyPluginAsync = async (fastify) => {

  // ── POST /consultations ─────────────────────────────────────────────────────
  fastify.post("/", async (req, reply) => {
    const { name, email, deliveryDate, message } = req.body as Record<string, string>;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return reply.status(400).send({ success: false, error: "Vui lòng điền đầy đủ thông tin bắt buộc" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return reply.status(400).send({ success: false, error: "Email không hợp lệ" });
    }

    const consultation = await ConsultationModel.create({
      name:         name.trim(),
      email:        email.trim().toLowerCase(),
      deliveryDate: deliveryDate?.trim() || undefined,
      message:      message.trim(),
    });

    // Send owner notification (non-blocking)
    sendConsultationNotification({
      name:         consultation.name,
      email:        consultation.email ?? email.trim().toLowerCase(),
      deliveryDate: consultation.deliveryDate,
      message:      consultation.message,
    }).catch((err) => console.error("[Email] consultation notification failed:", err));

    return reply.status(201).send({ success: true, data: { _id: consultation._id } });
  });
};

export default consultationsRoutes;
