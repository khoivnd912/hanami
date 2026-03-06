import { Schema, model, models, type Document, type Model } from "mongoose";

export type InventoryReason =
  | "order_placed"
  | "order_cancelled"
  | "manual_restock"
  | "manual_adjustment"
  | "reserve"
  | "reserve_release";

export interface InventoryLogDocument extends Document {
  productId:  Schema.Types.ObjectId;
  delta:      number;            // positive = added, negative = removed
  reason:     InventoryReason;
  orderId?:   Schema.Types.ObjectId;
  staffId?:   Schema.Types.ObjectId;
  note?:      string;
  stockAfter: number;
  createdAt:  Date;
}

const InventoryLogSchema = new Schema<InventoryLogDocument>(
  {
    productId:  { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    delta:      { type: Number, required: true },
    reason:     {
      type: String,
      enum: ["order_placed", "order_cancelled", "manual_restock", "manual_adjustment", "reserve", "reserve_release"],
      required: true,
    },
    orderId:    { type: Schema.Types.ObjectId, ref: "Order" },
    staffId:    { type: Schema.Types.ObjectId, ref: "StaffUser" },
    note:       { type: String },
    stockAfter: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

InventoryLogSchema.index({ productId: 1, createdAt: -1 });

export const InventoryLogModel: Model<InventoryLogDocument> =
  models.InventoryLog ?? model<InventoryLogDocument>("InventoryLog", InventoryLogSchema);
