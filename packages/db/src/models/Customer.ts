import { Schema, model, models, type Document, type Model } from "mongoose";
import bcrypt from "bcryptjs";

// ─── Document interface ───────────────────────────────────────────────────────

export interface CustomerDocument extends Document {
  email:          string;
  phone:          string;
  name:           string;
  hashedPassword: string;
  isVerified:     boolean;
  isActive:       boolean;
  verifyToken?:   string;
  resetToken?:    string;
  resetExpires?:  Date;
  createdAt:      Date;
  updatedAt:      Date;

  // Methods
  comparePassword(plain: string): Promise<boolean>;
}

interface CustomerModel extends Model<CustomerDocument> {
  // statics can be added here
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const CustomerSchema = new Schema<CustomerDocument, CustomerModel>(
  {
    email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:          { type: String, required: true, trim: true },
    name:           { type: String, required: true, trim: true },
    hashedPassword: { type: String, required: true, select: false },
    isVerified:     { type: Boolean, default: false },
    isActive:       { type: Boolean, default: true },
    verifyToken:    { type: String, select: false },
    resetToken:     { type: String, select: false },
    resetExpires:   { type: Date,   select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        Reflect.deleteProperty(ret, "hashedPassword");
        Reflect.deleteProperty(ret, "verifyToken");
        Reflect.deleteProperty(ret, "resetToken");
        Reflect.deleteProperty(ret, "resetExpires");
        return ret;
      },
    },
  }
);

// ── Indexes
CustomerSchema.index({ phone: 1 });

// ── Hash password before save
CustomerSchema.pre("save", async function (next) {
  if (!this.isModified("hashedPassword")) return next();
  this.hashedPassword = await bcrypt.hash(this.hashedPassword, 10);
  next();
});

// ── Instance method
CustomerSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.hashedPassword);
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const CustomerModel: CustomerModel =
  (models.Customer as CustomerModel) ?? model<CustomerDocument, CustomerModel>("Customer", CustomerSchema);
