import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const OrderStatusSchema = z.enum([
  "pending",     // just created, awaiting confirmation
  "confirmed",   // payment received or COD accepted
  "packing",     // being prepared
  "shipping",    // handed to courier
  "delivered",   // customer received
  "cancelled",   // cancelled before shipping
  "refunded",    // refund processed
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const PaymentMethodSchema = z.enum(["cod", "vnpay", "momo"]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const PaymentStatusSchema = z.enum(["pending", "paid", "failed", "refunded"]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// ─── Nested schemas ──────────────────────────────────────────────────────────

export const OrderItemSchema = z.object({
  productId:   z.string(),
  slug:        z.string(),
  nameVi:      z.string(),
  nameEn:      z.string(),
  gradient:    z.string(),
  petals:      z.number(),
  qty:         z.number().int().positive(),
  unitPrice:   z.number().positive(),   // price at time of order (snapshot)
  subtotal:    z.number().positive(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const ShippingAddressSchema = z.object({
  name:         z.string(),
  phone:        z.string(),
  province:     z.string(),
  provinceName: z.string(),
  district:     z.string(),
  districtName: z.string(),
  ward:         z.string(),
  wardName:     z.string(),
  detail:       z.string(),
  full:         z.string(),  // pre-built full address string
});
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

// ─── Order ───────────────────────────────────────────────────────────────────

export const OrderSchema = z.object({
  _id:            z.string(),
  orderNumber:    z.string(),    // e.g. "HN-20260304-1042"
  customerId:     z.string().optional(),
  guestEmail:     z.string().email().optional(),
  items:          z.array(OrderItemSchema),
  shippingAddress: ShippingAddressSchema,
  note:           z.string().optional(),
  status:         OrderStatusSchema,
  paymentMethod:  PaymentMethodSchema,
  paymentStatus:  PaymentStatusSchema,
  subtotal:       z.number(),
  shippingFee:    z.number(),
  discount:       z.number(),
  total:          z.number(),
  couponCode:     z.string().optional(),
  trackingCode:   z.string().optional(),
  staffNote:      z.string().optional(),
  createdAt:      z.string().datetime(),
  updatedAt:      z.string().datetime(),
});
export type Order = z.infer<typeof OrderSchema>;

// ─── API payloads ────────────────────────────────────────────────────────────

export const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    qty:       z.number().int().positive(),
  })).min(1, "Giỏ hàng trống"),
  shippingAddress: ShippingAddressSchema.omit({ full: true }),
  note:            z.string().optional(),
  paymentMethod:   PaymentMethodSchema,
  couponCode:      z.string().optional(),
});
export type CreateOrderPayload = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  status:    OrderStatusSchema,
  staffNote: z.string().optional(),
});
export type UpdateOrderStatusPayload = z.infer<typeof UpdateOrderStatusSchema>;
