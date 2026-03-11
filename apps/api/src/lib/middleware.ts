import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyAdminToken, type StaffPayload } from "./jwt";

declare module "fastify" {
  interface FastifyRequest {
    staff: StaffPayload;
  }
}

export function requirePermission(permission: string) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return reply.status(401).send({ success: false, error: "Unauthorized" });
    }
    try {
      const payload = verifyAdminToken(auth.slice(7));
      if (!payload.permissions.includes(permission)) {
        return reply.status(403).send({ success: false, error: "Không có quyền thực hiện thao tác này" });
      }
      req.staff = payload;
    } catch {
      return reply.status(401).send({ success: false, error: "Token không hợp lệ" });
    }
  };
}
