import { z } from "zod";

// ─── Staff ────────────────────────────────────────────────────────────────────

export const StaffRoleSchema = z.enum(["OWNER", "MANAGER", "STAFF"]);
export type StaffRole = z.infer<typeof StaffRoleSchema>;

export const PermissionSchema = z.enum([
  "orders:read",
  "orders:update",
  "orders:refund",
  "products:read",
  "products:write",
  "customers:read",
  "customers:suspend",
  "inventory:adjust",
  "coupons:write",
  "staff:manage",
  "analytics:read",
  "audit:read",
  "settings:write",
]);
export type Permission = z.infer<typeof PermissionSchema>;

export const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  OWNER:   [
    "orders:read", "orders:update", "orders:refund",
    "products:read", "products:write",
    "customers:read", "customers:suspend",
    "inventory:adjust",
    "coupons:write",
    "staff:manage",
    "analytics:read",
    "audit:read",
    "settings:write",
  ],
  MANAGER: [
    "orders:read", "orders:update", "orders:refund",
    "products:read", "products:write",
    "customers:read",
    "inventory:adjust",
    "coupons:write",
    "analytics:read",
  ],
  STAFF: [
    "orders:read", "orders:update",
    "products:read",
    "customers:read",
    "inventory:adjust",
  ],
};

export const StaffSchema = z.object({
  _id:            z.string(),
  email:          z.string().email(),
  name:           z.string(),
  role:           StaffRoleSchema,
  permissions:    z.array(PermissionSchema),
  totpEnabled:    z.boolean(),
  isActive:       z.boolean(),
  lastLoginAt:    z.string().datetime().optional(),
  createdAt:      z.string().datetime(),
});
export type Staff = z.infer<typeof StaffSchema>;

// ─── Auth payloads ───────────────────────────────────────────────────────────

export const StaffLoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});
export type StaffLoginPayload = z.infer<typeof StaffLoginSchema>;

export const StaffTotpVerifySchema = z.object({
  tempToken: z.string(),
  totpCode:  z.string().length(6),
});
export type StaffTotpVerifyPayload = z.infer<typeof StaffTotpVerifySchema>;
