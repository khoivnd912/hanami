import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { StaffUserModel, AuditLogModel } from "@hanami/db";
import { StaffLoginSchema, StaffTotpVerifySchema } from "@hanami/types";
import { authenticator } from "otplib";
import { signAdminToken, signTempToken, verifyTempToken } from "../lib/jwt";
import crypto from "crypto";

const adminAuthRoutes: FastifyPluginAsync = async (fastify) => {

  // ── POST /admin/auth/login ──────────────────────────────────────────────────
  fastify.post("/login", async (req, reply) => {
    const body = StaffLoginSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ success: false, error: "Email hoặc mật khẩu không hợp lệ" });
    }

    const { email, password } = body.data;
    const staff = await StaffUserModel.findOne({ email, isActive: true }).select("+hashedPassword +totpSecret");
    if (!staff || !(await staff.comparePassword(password))) {
      return reply.status(401).send({ success: false, error: "Email hoặc mật khẩu không đúng" });
    }

    // If TOTP is enabled, return a temporary token and require 2FA step
    if (staff.totpEnabled) {
      const tempToken  = signTempToken({ sub: staff.id, type: "2fa_temp" });
      const hash       = hashToken(tempToken);
      const expiresAt  = new Date(Date.now() + 5 * 60 * 1000); // 5 min
      await StaffUserModel.findByIdAndUpdate(staff.id, {
        tempToken2faHash:      hash,
        tempToken2faExpiresAt: expiresAt,
      });
      return reply.send({ success: true, data: { requires2FA: true, tempToken } });
    }

    // No 2FA yet — OWNER should enforce setup on first login
    return reply.send({
      success: true,
      data: {
        requires2FA:   false,
        requiresSetup: !staff.totpEnabled,
        accessToken: signAdminToken({
          sub:         staff.id,
          role:        staff.role,
          email:       staff.email,
          permissions: staff.permissions,
        }),
      },
    });
  });

  // ── POST /admin/auth/totp/verify ────────────────────────────────────────────
  fastify.post("/totp/verify", async (req, reply) => {
    const body = StaffTotpVerifySchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ success: false, error: "Dữ liệu không hợp lệ" });
    }

    const { tempToken, totpCode } = body.data;
    try {
      const payload = verifyTempToken(tempToken);
      const hash    = hashToken(tempToken);
      const now     = new Date();

      const staff = await StaffUserModel.findOne({
        _id:                   payload.sub,
        tempToken2faHash:      hash,
        tempToken2faExpiresAt: { $gt: now },
      }).select("+totpSecret +tempToken2faHash +tempToken2faExpiresAt");

      if (!staff) {
        return reply.status(401).send({ success: false, error: "Phiên xác thực đã hết hạn" });
      }

      if (!staff.totpSecret) {
        return reply.status(401).send({ success: false, error: "Tài khoản không hợp lệ" });
      }

      const isValid = authenticator.verify({ token: totpCode, secret: staff.totpSecret });
      if (!isValid) {
        return reply.status(401).send({ success: false, error: "Mã xác thực không đúng" });
      }

      await StaffUserModel.findByIdAndUpdate(staff.id, {
        lastLoginAt: new Date(),
        $unset: { tempToken2faHash: 1, tempToken2faExpiresAt: 1 },
      });

      await AuditLogModel.create({
        actorId:    staff.id,
        actorType:  "staff",
        actorName:  staff.name,
        action:     "auth.login",
        resource:   "StaffUser",
        resourceId: staff.id,
        ip:         req.ip,
      });

      return reply.send({
        success: true,
        data: {
          accessToken: signAdminToken({
            sub:         staff.id,
            role:        staff.role,
            email:       staff.email,
            permissions: staff.permissions,
          }),
        },
      });
    } catch {
      return reply.status(401).send({ success: false, error: "Token không hợp lệ" });
    }
  });

  // ── POST /admin/auth/totp/setup ─────────────────────────────────────────────
  fastify.post("/totp/setup", { preHandler: [requireAdminAuth(fastify)] }, async (req, reply) => {
    const staffId = (req as FastifyRequest & { staffId: string }).staffId;
    const staff   = await StaffUserModel.findById(staffId).select("+totpSecret");
    if (!staff) return reply.status(404).send({ success: false, error: "Không tìm thấy tài khoản" });

    const secret  = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(staff.email, "Hanami Admin", secret);

    // Store secret temporarily until user confirms with a valid code
    await StaffUserModel.findByIdAndUpdate(staffId, {
      pendingTotpSecret:    secret,
      pendingTotpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });

    return reply.send({ success: true, data: { otpauth, secret } });
  });

  // ── POST /admin/auth/totp/confirm ────────────────────────────────────────────
  fastify.post("/totp/confirm", { preHandler: [requireAdminAuth(fastify)] }, async (req, reply) => {
    const staffId = (req as FastifyRequest & { staffId: string }).staffId;
    const { code } = req.body as { code?: string };
    if (!code) return reply.status(400).send({ success: false, error: "Thiếu mã xác thực" });

    const staff = await StaffUserModel.findOne({
      _id:                 staffId,
      pendingTotpExpiresAt: { $gt: new Date() },
    }).select("+pendingTotpSecret +pendingTotpExpiresAt");

    if (!staff?.pendingTotpSecret) {
      return reply.status(400).send({ success: false, error: "Phiên cài đặt đã hết hạn" });
    }

    const isValid = authenticator.verify({ token: code, secret: staff.pendingTotpSecret });
    if (!isValid) return reply.status(400).send({ success: false, error: "Mã xác thực không đúng" });

    await StaffUserModel.findByIdAndUpdate(staffId, {
      totpSecret:   staff.pendingTotpSecret,
      totpEnabled:  true,
      $unset: { pendingTotpSecret: 1, pendingTotpExpiresAt: 1 },
    });

    return reply.send({ success: true, data: { message: "2FA đã được kích hoạt" } });
  });
};

// ── Inline preHandler to verify admin JWT ────────────────────────────────────
function requireAdminAuth(_fastify: unknown) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return reply.status(401).send({ success: false, error: "Unauthorized" });
    }
    try {
      const { verifyAdminToken } = await import("../lib/jwt");
      const payload = verifyAdminToken(auth.slice(7));
      (req as FastifyRequest & { staffId: string }).staffId = payload.sub;
    } catch {
      return reply.status(401).send({ success: false, error: "Token không hợp lệ" });
    }
  };
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export default adminAuthRoutes;
