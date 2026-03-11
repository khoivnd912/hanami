import { Schema, model, models, type Document, type Model } from "mongoose";
import bcrypt from "bcryptjs";
import type { StaffRole, Permission } from "@hanami/types";

// ─── Document interface ───────────────────────────────────────────────────────

export interface StaffDocument extends Document {
  email:                  string;
  name:                   string;
  hashedPassword:         string;
  role:                   StaffRole;
  permissions:            Permission[];
  totpSecret?:            string;
  totpEnabled:            boolean;
  isActive:               boolean;
  lastLoginAt?:           Date;
  inviteToken?:           string;
  inviteExpires?:         Date;
  tempToken2faHash?:      string;
  tempToken2faExpiresAt?: Date;
  pendingTotpSecret?:     string;
  pendingTotpExpiresAt?:  Date;
  createdAt:              Date;
  updatedAt:              Date;

  comparePassword(plain: string): Promise<boolean>;
}

interface StaffModel extends Model<StaffDocument> {}

// ─── Schema ───────────────────────────────────────────────────────────────────

const StaffSchema = new Schema<StaffDocument, StaffModel>(
  {
    email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:           { type: String, required: true, trim: true },
    hashedPassword: { type: String, required: true, select: false },
    role:           { type: String, enum: ["OWNER", "MANAGER", "STAFF"], required: true },
    permissions:    [{ type: String }],
    totpSecret:     { type: String, select: false },
    totpEnabled:    { type: Boolean, default: false },
    isActive:       { type: Boolean, default: true },
    lastLoginAt:    { type: Date },
    inviteToken:           { type: String, select: false },
    inviteExpires:         { type: Date,   select: false },
    tempToken2faHash:      { type: String, select: false },
    tempToken2faExpiresAt: { type: Date,   select: false },
    pendingTotpSecret:     { type: String, select: false },
    pendingTotpExpiresAt:  { type: Date,   select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        Reflect.deleteProperty(ret, "hashedPassword");
        Reflect.deleteProperty(ret, "totpSecret");
        Reflect.deleteProperty(ret, "inviteToken");
        Reflect.deleteProperty(ret, "inviteExpires");
        return ret;
      },
    },
  }
);

// ── Hash on save
StaffSchema.pre("save", async function (next) {
  if (!this.isModified("hashedPassword")) return next();
  this.hashedPassword = await bcrypt.hash(this.hashedPassword, 12);
  next();
});

StaffSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.hashedPassword);
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const StaffUserModel: StaffModel =
  (models.StaffUser as StaffModel) ?? model<StaffDocument, StaffModel>("StaffUser", StaffSchema);
