import { Schema, model, models, type Document, type Model } from "mongoose";

export type ConsultationStatus = "new" | "contacted" | "done";
export type ConsultationSource = "website" | "facebook" | "zalo" | "instagram" | "other";

export interface ConsultationDocument extends Document {
  name:          string;
  email?:        string;
  phone?:        string;
  source?:       ConsultationSource;
  deliveryDate?: string;
  message:       string;
  status:        ConsultationStatus;
  staffNote?:    string;
  createdAt:     Date;
  updatedAt:     Date;
}

const ConsultationSchema = new Schema<ConsultationDocument>(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, trim: true, lowercase: true },
    phone:        { type: String, trim: true },
    source:       { type: String, enum: ["website", "facebook", "zalo", "instagram", "other"], default: "website" },
    deliveryDate: { type: String },
    message:      { type: String, required: true },
    status:       { type: String, enum: ["new", "contacted", "done"], default: "new" },
    staffNote:    { type: String },
  },
  { timestamps: true }
);

ConsultationSchema.index({ status: 1, createdAt: -1 });

export const ConsultationModel: Model<ConsultationDocument> =
  models.Consultation ?? model<ConsultationDocument>("Consultation", ConsultationSchema);
