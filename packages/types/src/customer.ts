import { z } from "zod";

// ─── Customer ─────────────────────────────────────────────────────────────────

export const CustomerSchema = z.object({
  _id:         z.string(),
  email:       z.string().email(),
  phone:       z.string(),
  name:        z.string(),
  isVerified:  z.boolean(),
  isActive:    z.boolean(),
  createdAt:   z.string().datetime(),
  updatedAt:   z.string().datetime(),
});
export type Customer = z.infer<typeof CustomerSchema>;

// ─── Auth payloads ───────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  email:    z.string().email("Email không hợp lệ"),
  phone:    z.string().regex(/^(0[3|5|7|8|9])[0-9]{8}$/, "Số điện thoại không hợp lệ"),
  name:     z.string().min(2, "Tên ít nhất 2 ký tự"),
  password: z.string().min(8, "Mật khẩu ít nhất 8 ký tự"),
});
export type RegisterPayload = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});
export type LoginPayload = z.infer<typeof LoginSchema>;

export const TokenPairSchema = z.object({
  accessToken:  z.string(),
  refreshToken: z.string(),
});
export type TokenPair = z.infer<typeof TokenPairSchema>;
