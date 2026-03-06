import jwt from "jsonwebtoken";

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  ?? "change-me-access";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "change-me-refresh";
const ADMIN_SECRET   = process.env.JWT_ADMIN_SECRET   ?? "change-me-admin";

export interface CustomerPayload {
  sub:   string;
  role:  "customer";
  email: string;
}

export interface StaffPayload {
  sub:         string;
  role:        "OWNER" | "MANAGER" | "STAFF";
  email:       string;
  permissions: string[];
}

export interface TempPayload {
  sub:  string;
  type: "2fa_temp";
}

// ─── Customer tokens ──────────────────────────────────────────────────────────

export function signAccessToken(payload: CustomerPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(payload: { sub: string }): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): CustomerPayload {
  return jwt.verify(token, ACCESS_SECRET) as CustomerPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, REFRESH_SECRET) as { sub: string };
}

// ─── Staff / admin tokens ─────────────────────────────────────────────────────

export function signAdminToken(payload: StaffPayload): string {
  return jwt.sign(payload, ADMIN_SECRET, { expiresIn: "4h" });
}

export function signTempToken(payload: TempPayload): string {
  return jwt.sign(payload, ADMIN_SECRET, { expiresIn: "5m" });
}

export function verifyAdminToken(token: string): StaffPayload {
  return jwt.verify(token, ADMIN_SECRET) as StaffPayload;
}

export function verifyTempToken(token: string): TempPayload {
  return jwt.verify(token, ADMIN_SECRET) as TempPayload;
}
