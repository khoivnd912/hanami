import { Schema, model, models, type Document, type Model } from "mongoose";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@hanami/types";

// ─── Document interface ───────────────────────────────────────────────────────

export interface OrderDocument extends Document {
  orderNumber:    string;
  customerId?:    Schema.Types.ObjectId;
  guestEmail?:    string;
  items:          OrderItemDoc[];
  shippingAddress: ShippingAddressDoc;
  note?:          string;
  status:         OrderStatus;
  paymentMethod:  PaymentMethod;
  paymentStatus:  PaymentStatus;
  subtotal:       number;
  shippingFee:    number;
  discount:       number;
  total:          number;
  couponCode?:    string;
  trackingCode?:  string;
  staffNote?:     string;
  statusHistory:  StatusHistoryEntry[];
  createdAt:      Date;
  updatedAt:      Date;
}

interface OrderItemDoc {
  productId:  Schema.Types.ObjectId;
  slug:       string;
  nameVi:     string;
  nameEn:     string;
  gradient:   string;
  petals:     number;
  qty:        number;
  unitPrice:  number;
  subtotal:   number;
}

interface ShippingAddressDoc {
  name:         string;
  phone:        string;
  province:     string;
  provinceName: string;
  district:     string;
  districtName: string;
  ward:         string;
  wardName:     string;
  detail:       string;
  full:         string;
}

interface StatusHistoryEntry {
  status:   OrderStatus;
  note?:    string;
  staffId?: Schema.Types.ObjectId;
  at:       Date;
}

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

const OrderItemSchema = new Schema<OrderItemDoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    slug:      { type: String, required: true },
    nameVi:    { type: String, required: true },
    nameEn:    { type: String, required: true },
    gradient:  { type: String, required: true },
    petals:    { type: Number, required: true },
    qty:       { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    subtotal:  { type: Number, required: true },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<ShippingAddressDoc>(
  {
    name:         { type: String, required: true },
    phone:        { type: String, required: true },
    province:     { type: String, required: true },
    provinceName: { type: String, required: true },
    district:     { type: String, required: true },
    districtName: { type: String, required: true },
    ward:         { type: String, required: true },
    wardName:     { type: String, required: true },
    detail:       { type: String, required: true },
    full:         { type: String, required: true },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<StatusHistoryEntry>(
  {
    status:  { type: String, required: true },
    note:    { type: String },
    staffId: { type: Schema.Types.ObjectId, ref: "StaffUser" },
    at:      { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─── Main schema ─────────────────────────────────────────────────────────────

const OrderSchema = new Schema<OrderDocument>(
  {
    orderNumber:    { type: String, required: true, unique: true },
    customerId:     { type: Schema.Types.ObjectId, ref: "Customer" },
    guestEmail:     { type: String, lowercase: true },
    items:          [OrderItemSchema],
    shippingAddress: { type: ShippingAddressSchema, required: true },
    note:           { type: String },
    status:         {
      type:    String,
      enum:    ["pending", "confirmed", "packing", "shipping", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    paymentMethod:  { type: String, enum: ["cod", "vnpay", "momo"], required: true },
    paymentStatus:  { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    subtotal:       { type: Number, required: true },
    shippingFee:    { type: Number, required: true, default: 0 },
    discount:       { type: Number, default: 0 },
    total:          { type: Number, required: true },
    couponCode:     { type: String },
    trackingCode:   { type: String },
    staffNote:      { type: String },
    statusHistory:  [StatusHistorySchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Indexes
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

// ─── Export ───────────────────────────────────────────────────────────────────

export const OrderModel: Model<OrderDocument> =
  models.Order ?? model<OrderDocument>("Order", OrderSchema);
