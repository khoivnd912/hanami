import { Schema, model, models, type Document, type Model } from "mongoose";

export type ActorType = "customer" | "staff" | "system";

export interface AuditLogDocument extends Document {
  actorId:    string;
  actorType:  ActorType;
  actorName:  string;
  action:     string;        // e.g. "order.status.update", "product.create"
  resource:   string;        // e.g. "Order", "Product"
  resourceId: string;
  diff?:      Record<string, unknown>;   // before/after snapshot
  ip?:        string;
  userAgent?: string;
  createdAt:  Date;
}

const AuditLogSchema = new Schema<AuditLogDocument>(
  {
    actorId:    { type: String, required: true },
    actorType:  { type: String, enum: ["customer", "staff", "system"], required: true },
    actorName:  { type: String, required: true },
    action:     { type: String, required: true },
    resource:   { type: String, required: true },
    resourceId: { type: String, required: true },
    diff:       { type: Schema.Types.Mixed },
    ip:         { type: String },
    userAgent:  { type: String },
  },
  {
    // Append-only: no updates allowed — createdAt only
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLogModel: Model<AuditLogDocument> =
  models.AuditLog ?? model<AuditLogDocument>("AuditLog", AuditLogSchema);
