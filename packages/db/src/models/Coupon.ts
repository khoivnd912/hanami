import { Schema, model, models, type Document, type Model } from "mongoose";

export type CouponType = "percent" | "fixed" | "free_shipping";

export interface CouponDocument extends Document {
  code:       string;
  type:       CouponType;
  value:      number;       // percent 0–100 or fixed VND amount
  minOrder:   number;       // minimum order total to apply
  usageLimit: number;       // 0 = unlimited
  usedCount:  number;
  isActive:   boolean;
  expiresAt?: Date;
  createdAt:  Date;
  updatedAt:  Date;
}

const CouponSchema = new Schema<CouponDocument>(
  {
    code:       { type: String, required: true, unique: true, uppercase: true, trim: true },
    type:       { type: String, enum: ["percent", "fixed", "free_shipping"], required: true },
    value:      { type: Number, required: true, min: 0 },
    minOrder:   { type: Number, default: 0 },
    usageLimit: { type: Number, default: 0 },
    usedCount:  { type: Number, default: 0 },
    isActive:   { type: Boolean, default: true },
    expiresAt:  { type: Date },
  },
  { timestamps: true }
);

CouponSchema.index({ isActive: 1 });

export const CouponModel: Model<CouponDocument> =
  models.Coupon ?? model<CouponDocument>("Coupon", CouponSchema);
