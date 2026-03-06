import type { FastifyPluginAsync } from "fastify";
import { CustomerModel } from "@hanami/db";
import { RegisterSchema, LoginSchema } from "@hanami/types";
import {
  signAccessToken, signRefreshToken,
  verifyRefreshToken,
} from "../lib/jwt";
import { redisSet, redisGet, redisDel, redisIncr } from "../lib/redis";
import crypto from "crypto";

const authRoutes: FastifyPluginAsync = async (fastify) => {

  // ── POST /auth/register ─────────────────────────────────────────────────────
  fastify.post("/register", async (req, reply) => {
    const body = RegisterSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({
        success: false,
        error: "Dữ liệu không hợp lệ",
        issues: body.error.issues.map((i) => ({
          field:   i.path.join("."),
          message: i.message,
        })),
      });
    }

    const { email, phone, name, password } = body.data;

    const existing = await CustomerModel.findOne({ email });
    if (existing) {
      return reply.status(409).send({ success: false, error: "Email đã được sử dụng" });
    }

    const customer = await CustomerModel.create({
      email, phone, name,
      hashedPassword: password, // hashed by pre-save hook
      isVerified: false,
      isActive:   true,
    });

    // TODO: send verification email

    const accessToken  = signAccessToken({ sub: customer.id, role: "customer", email });
    const refreshToken = signRefreshToken({ sub: customer.id });
    await redisSet(`refresh:${hashToken(refreshToken)}`, customer.id, 60 * 60 * 24 * 7);

    return reply.status(201).send({
      success: true,
      data: { accessToken, refreshToken, customer: customer.toJSON() },
    });
  });

  // ── POST /auth/login ────────────────────────────────────────────────────────
  fastify.post("/login", async (req, reply) => {
    const ip = req.ip;
    const rateLimitKey = `rate:login:${ip}`;
    const attempts = await redisIncr(rateLimitKey, 60 * 15);
    if (attempts > 10) {
      return reply.status(429).send({ success: false, error: "Quá nhiều lần đăng nhập. Thử lại sau 15 phút." });
    }

    const body = LoginSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ success: false, error: "Email hoặc mật khẩu không hợp lệ" });
    }

    const { email, password } = body.data;
    const customer = await CustomerModel.findOne({ email }).select("+hashedPassword");
    if (!customer || !(await customer.comparePassword(password))) {
      return reply.status(401).send({ success: false, error: "Email hoặc mật khẩu không đúng" });
    }

    if (!customer.isActive) {
      return reply.status(403).send({ success: false, error: "Tài khoản đã bị khóa" });
    }

    const accessToken  = signAccessToken({ sub: customer.id, role: "customer", email });
    const refreshToken = signRefreshToken({ sub: customer.id });
    await redisSet(`refresh:${hashToken(refreshToken)}`, customer.id, 60 * 60 * 24 * 7);

    return reply.send({
      success: true,
      data: { accessToken, refreshToken, customer: customer.toJSON() },
    });
  });

  // ── POST /auth/refresh ──────────────────────────────────────────────────────
  fastify.post("/refresh", async (req, reply) => {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      return reply.status(400).send({ success: false, error: "Thiếu refresh token" });
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      const hash    = hashToken(refreshToken);
      const stored  = await redisGet(`refresh:${hash}`);
      if (!stored) return reply.status(401).send({ success: false, error: "Token không hợp lệ hoặc đã hết hạn" });

      const customer = await CustomerModel.findById(payload.sub);
      if (!customer || !customer.isActive) {
        return reply.status(401).send({ success: false, error: "Tài khoản không tồn tại" });
      }

      // Rotate tokens
      await redisDel(`refresh:${hash}`);
      const newAccess  = signAccessToken({ sub: customer.id, role: "customer", email: customer.email });
      const newRefresh = signRefreshToken({ sub: customer.id });
      await redisSet(`refresh:${hashToken(newRefresh)}`, customer.id, 60 * 60 * 24 * 7);

      return reply.send({ success: true, data: { accessToken: newAccess, refreshToken: newRefresh } });
    } catch {
      return reply.status(401).send({ success: false, error: "Token không hợp lệ" });
    }
  });

  // ── POST /auth/logout ───────────────────────────────────────────────────────
  fastify.post("/logout", async (req, reply) => {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) {
      await redisDel(`refresh:${hashToken(refreshToken)}`);
    }
    return reply.send({ success: true, data: null });
  });
};

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export default authRoutes;
