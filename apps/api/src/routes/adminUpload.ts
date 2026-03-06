import type { FastifyPluginAsync } from "fastify";
import { verifyAdminToken } from "../lib/jwt";
import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";

const UPLOAD_DIR  = path.join(process.cwd(), "uploads");
const MAX_BYTES   = 5 * 1024 * 1024; // 5 MB
const ALLOWED     = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
};

const adminUploadRoutes: FastifyPluginAsync = async (fastify) => {
  // Ensure upload dir exists on startup
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  // ── POST /admin/upload ────────────────────────────────────────────────────
  fastify.post("/", async (req, reply) => {
    // Auth
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return reply.status(401).send({ success: false, error: "Unauthorized" });
    }
    try {
      verifyAdminToken(auth.slice(7));
    } catch {
      return reply.status(401).send({ success: false, error: "Token không hợp lệ" });
    }

    const data = await req.file();
    if (!data) {
      return reply.status(400).send({ success: false, error: "Không tìm thấy file" });
    }

    if (!ALLOWED.has(data.mimetype)) {
      // consume stream to avoid memory leak
      data.file.resume();
      return reply.status(400).send({ success: false, error: "Chỉ chấp nhận JPG, PNG, WEBP" });
    }

    // Read with size guard
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of data.file) {
      size += chunk.length;
      if (size > MAX_BYTES) {
        return reply.status(400).send({ success: false, error: "File vượt quá 5 MB" });
      }
      chunks.push(chunk as Buffer);
    }

    const ext      = EXT_MAP[data.mimetype];
    const filename = `${randomBytes(16).toString("hex")}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filepath, Buffer.concat(chunks));

    const baseUrl = (process.env.PUBLIC_URL ?? "http://localhost:4000").replace(/\/$/, "");
    return reply.status(201).send({ success: true, data: { url: `${baseUrl}/uploads/${filename}` } });
  });

  // ── GET /uploads/:filename  (served without /api/v1 prefix – see server.ts) ─
  // This route is registered separately at root level.
};

export default adminUploadRoutes;

// ── Static file handler (registered at root, not under /api/v1) ──────────────

export async function serveUploads(fastify: import("fastify").FastifyInstance) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  fastify.get<{ Params: { filename: string } }>("/uploads/:filename", async (req, reply) => {
    const { filename } = req.params;

    // Security: reject path traversal
    if (/[/\\]|\.\./.test(filename)) {
      return reply.status(400).send({ success: false, error: "Invalid filename" });
    }

    const filepath = path.join(UPLOAD_DIR, filename);
    try {
      const buf  = await fs.readFile(filepath);
      const ext  = path.extname(filename).slice(1).toLowerCase();
      const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
      reply.header("Content-Type", mime);
      reply.header("Cache-Control", "public, max-age=31536000, immutable");
      return reply.send(buf);
    } catch {
      return reply.status(404).send({ success: false, error: "File không tồn tại" });
    }
  });
}
