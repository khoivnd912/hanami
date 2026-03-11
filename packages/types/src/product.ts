import { z } from "zod";

// ─── Product ──────────────────────────────────────────────────────────────────

export const ProductTagSchema = z.enum([
  "New", "Bestseller", "Seasonal", "Exclusive", "Limited",
]);
export type ProductTag = z.infer<typeof ProductTagSchema>;

export const SpecSchema = z.object({
  label: z.string(),
  value: z.string(),
});
export type Spec = z.infer<typeof SpecSchema>;

export const ProductSchema = z.object({
  _id:            z.string(),
  slug:           z.string(),
  nameVi:         z.string(),
  nameEn:         z.string(),
  price:          z.number().positive(),
  originalPrice:  z.number().positive().optional(),
  tag:            ProductTagSchema.optional(),
  gradient:       z.string().optional(),
  imageUrl:       z.string().optional(),
  descriptionVi:  z.array(z.string()),
  descriptionEn:  z.array(z.string()),
  specs:          z.array(SpecSchema),
  stock:          z.number().int().min(0),
  isActive:       z.boolean(),
  createdAt:      z.string().datetime(),
  updatedAt:      z.string().datetime(),
});
export type Product = z.infer<typeof ProductSchema>;

// ─── API payloads ────────────────────────────────────────────────────────────

export const CreateProductSchema = ProductSchema.omit({
  _id: true, createdAt: true, updatedAt: true,
});
export type CreateProductPayload = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial();
export type UpdateProductPayload = z.infer<typeof UpdateProductSchema>;
