import { Schema, model, models, type Document, type Model } from "mongoose";
import type { Product } from "@hanami/types";

// ─── Document interface ───────────────────────────────────────────────────────

export interface ProductDocument extends Omit<Product, "_id" | "createdAt" | "updatedAt">, Document {}

// ─── Schema ───────────────────────────────────────────────────────────────────

const SpecSchema = new Schema(
  { label: { type: String, required: true }, value: { type: String, required: true } },
  { _id: false }
);

const ProductSchema = new Schema<ProductDocument>(
  {
    slug:          { type: String, required: true, unique: true, lowercase: true, trim: true },
    nameVi:        { type: String, required: true },
    nameEn:        { type: String, required: true },
    price:         { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    tag:           { type: String, enum: ["New", "Bestseller", "Seasonal", "Exclusive", "Limited"] },
    gradient:      { type: String },
    imageUrl:      { type: String },
    descriptionVi: [{ type: String }],
    descriptionEn: [{ type: String }],
    specs:         [SpecSchema],
    petals:        { type: Number, required: true, min: 1, default: 6 },
    stock:         { type: Number, required: true, min: 0, default: 0 },
    isActive:      { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// Indexes
ProductSchema.index({ isActive: 1, price: 1 });
ProductSchema.index({ tag: 1 });
ProductSchema.index({ nameVi: "text", nameEn: "text" });

// ─── Export ───────────────────────────────────────────────────────────────────

export const ProductModel: Model<ProductDocument> =
  models.Product ?? model<ProductDocument>("Product", ProductSchema);
