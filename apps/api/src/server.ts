import Fastify from "fastify";
import cors      from "@fastify/cors";
import helmet    from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import { connectDB } from "@hanami/db";

import authRoutes          from "./routes/auth";
import productsRoutes      from "./routes/products";
import ordersRoutes        from "./routes/orders";
import adminAuthRoutes      from "./routes/adminAuth";
import adminOrdersRoutes    from "./routes/adminOrders";
import adminProductsRoutes  from "./routes/adminProducts";
import adminDashboardRoutes from "./routes/adminDashboard";
import adminCustomersRoutes from "./routes/adminCustomers";
import adminInventoryRoutes from "./routes/adminInventory";
import adminCouponsRoutes   from "./routes/adminCoupons";
import adminAuditRoutes          from "./routes/adminAudit";
import adminUploadRoutes, { serveUploads } from "./routes/adminUpload";
import consultationsRoutes       from "./routes/consultations";
import adminConsultationsRoutes  from "./routes/adminConsultations";

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function bootstrap() {
  const fastify = Fastify({
    logger: {
      level:     process.env.LOG_LEVEL ?? "info",
      transport: process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
    },
  });

  // ── Multipart (file uploads) ──────────────────────────────────────────────
  await fastify.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  });

  // ── Security plugins ──────────────────────────────────────────────────────
  await fastify.register(helmet, {
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });

  await fastify.register(cors, {
    origin: (process.env.CORS_ORIGINS ?? "http://localhost:3000,http://localhost:3001")
      .split(",")
      .map((o) => o.trim()),
    methods:     ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  });

  await fastify.register(rateLimit, {
    global:  true,
    max:     100,
    timeWindow: "1 minute",
    errorResponseBuilder: (_req, context) => ({
      success:   false,
      error:     `Quá nhiều yêu cầu. Thử lại sau ${Math.ceil(context.ttl / 1000)} giây.`,
      code:      "RATE_LIMITED",
    }),
  });

  // ── Routes ────────────────────────────────────────────────────────────────
  const prefix = "/api/v1";

  fastify.register(authRoutes,            { prefix: `${prefix}/auth` });
  fastify.register(productsRoutes,        { prefix: `${prefix}/products` });
  fastify.register(ordersRoutes,          { prefix: `${prefix}/orders` });
  fastify.register(consultationsRoutes,   { prefix: `${prefix}/consultations` });

  // Admin sub-routes
  fastify.register(adminAuthRoutes,      { prefix: `${prefix}/admin/auth` });
  fastify.register(adminOrdersRoutes,    { prefix: `${prefix}/admin/orders` });
  fastify.register(adminProductsRoutes,  { prefix: `${prefix}/admin/products` });
  fastify.register(adminDashboardRoutes, { prefix: `${prefix}/admin/dashboard` });
  fastify.register(adminCustomersRoutes, { prefix: `${prefix}/admin/customers` });
  fastify.register(adminInventoryRoutes, { prefix: `${prefix}/admin/inventory` });
  fastify.register(adminCouponsRoutes,   { prefix: `${prefix}/admin/coupons` });
  fastify.register(adminAuditRoutes,          { prefix: `${prefix}/admin/audit` });
  fastify.register(adminUploadRoutes,         { prefix: `${prefix}/admin/upload` });
  fastify.register(adminConsultationsRoutes,  { prefix: `${prefix}/admin/consultations` });

  // Static uploads (served without /api/v1 prefix)
  await serveUploads(fastify);

  // ── Health check ──────────────────────────────────────────────────────────
  fastify.get("/health", async () => ({
    status: "ok",
    ts:     new Date().toISOString(),
    env:    process.env.NODE_ENV ?? "development",
  }));

  // ── 404 handler ───────────────────────────────────────────────────────────
  fastify.setNotFoundHandler((_req, reply) => {
    reply.status(404).send({ success: false, error: "Route không tồn tại" });
  });

  // ── Global error handler ──────────────────────────────────────────────────
  fastify.setErrorHandler((err: Error & { statusCode?: number }, _req, reply) => {
    fastify.log.error(err);
    const statusCode = err.statusCode ?? 500;
    reply.status(statusCode).send({
      success: false,
      error:   statusCode === 500 ? "Lỗi máy chủ, vui lòng thử lại sau" : err.message,
    });
  });

  // ── Connect DB then start ─────────────────────────────────────────────────
  await connectDB();
  fastify.log.info("[DB] MongoDB connected");

  const port = parseInt(process.env.PORT ?? "4000");
  const host = process.env.HOST ?? "0.0.0.0";

  await fastify.listen({ port, host });
  fastify.log.info(`[API] Listening on http://${host}:${port}`);

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    fastify.log.info(`[API] ${signal} received, shutting down...`);
    await fastify.close();
    process.exit(0);
  };

  process.on("SIGINT",  () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  console.error("[API] Fatal startup error:", err);
  process.exit(1);
});
