import { Schema, model, models, type Document, type Model } from "mongoose";

// ─── Sub-schema: footer content ──────────────────────────────────────────────

const FooterContentSchema = new Schema(
  {
    taglineVi: { type: String, default: "" },
    taglineEn: { type: String, default: "" },
    bizName:   { type: String, default: "" },
    instagram: { type: String, default: "" },
    facebook:  { type: String, default: "" },
    threads: { type: String, default: "" },
    tiktok:    { type: String, default: "" },
  },
  { _id: false }
);

export interface FooterContent {
  taglineVi: string;
  taglineEn: string;
  bizName:   string;
  instagram: string;
  facebook:  string;
  threads: string;
  tiktok:    string;
}

// ─── Sub-schema: contact info ────────────────────────────────────────────────

const ContactInfoSchema = new Schema(
  {
    address:   { type: String, default: "" },
    phone:     { type: String, default: "" },
    email:     { type: String, default: "" },
    facebook:  { type: String, default: "" },
    hoursMF:   { type: String, default: "" },
    hoursSat:  { type: String, default: "" },
    hoursSun:  { type: String, default: "" },
  },
  { _id: false }
);

export interface ContactInfo {
  address:   string;
  phone:     string;
  email:     string;
  facebook:  string;
  hoursMF:   string;
  hoursSat:  string;
  hoursSun:  string;
}

// ─── Sub-schema: feature item ────────────────────────────────────────────────

const FeatureItemSchema = new Schema(
  {
    titleVi: { type: String, default: "" },
    titleEn: { type: String, default: "" },
    descVi:  { type: String, default: "" },
    descEn:  { type: String, default: "" },
  },
  { _id: false }
);

export interface FeatureItem {
  titleVi: string;
  titleEn: string;
  descVi:  string;
  descEn:  string;
}

// ─── Sub-schema: testimonial item ────────────────────────────────────────────

const TestimonialItemSchema = new Schema(
  {
    quote:     { type: String, default: "" },
    name:      { type: String, default: "" },
    location:  { type: String, default: "" },
    floral:    { type: String, default: "" },
    imageUrl:  { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
  },
  { _id: false }
);

export interface TestimonialItem {
  quote:      string;
  name:       string;
  location:   string;
  floral:     string;
  imageUrl?:  string;
  avatarUrl?: string;
}

// ─── Sub-schema: gallery item ────────────────────────────────────────────────

const GalleryItemSchema = new Schema(
  {
    nameVi:   { type: String, default: "" },
    nameEn:   { type: String, default: "" },
    tagKey:   { type: String, default: "tagSignature" },
    gradient: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { _id: false }
);

export interface GalleryItem {
  nameVi:    string;
  nameEn:    string;
  tagKey:    string;
  gradient:  string;
  imageUrl?: string;
}

// ─── Sub-schema: per-language about fields ────────────────────────────────────

const AboutLangSchema = new Schema(
  {
    heading:      { type: String, default: "" },
    headingEm:    { type: String, default: "" },
    p1:           { type: String, default: "" },
    p2:           { type: String, default: "" },
    p3:           { type: String, default: "" },
    stat1num:     { type: String, default: "" },
    stat1label:   { type: String, default: "" },
    stat2num:     { type: String, default: "" },
    stat2label:   { type: String, default: "" },
    stat3num:     { type: String, default: "" },
    stat3label:   { type: String, default: "" },
    founderTitle: { type: String, default: "" },
  },
  { _id: false }
);

// ─── Document interface ───────────────────────────────────────────────────────

export interface AboutLang {
  heading:      string;
  headingEm:    string;
  p1:           string;
  p2:           string;
  p3:           string;
  stat1num:     string;
  stat1label:   string;
  stat2num:     string;
  stat2label:   string;
  stat3num:     string;
  stat3label:   string;
  founderTitle: string;
}

export interface SiteContentDocument extends Document {
  key:         string;
  // About section fields
  vi?:          AboutLang;
  en?:          AboutLang;
  founderName?:      string;
  foundedYear?:      string;
  founderImageUrl?:  string;
  // Gallery section fields
  items?:        GalleryItem[];
  // Footer fields
  footer?:       FooterContent;
  // Contact section fields
  contact?:      ContactInfo;
  // Features section fields
  features?:     FeatureItem[];
  // Testimonials section fields
  testimonials?: TestimonialItem[];
  // Hero section fields
  heroImageUrl?: string;
  updatedAt:     Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const SiteContentSchema = new Schema<SiteContentDocument>(
  {
    key:         { type: String, required: true, unique: true },
    vi:          { type: AboutLangSchema, default: undefined },
    en:          { type: AboutLangSchema, default: undefined },
    founderName:      { type: String },
    foundedYear:      { type: String },
    founderImageUrl:  { type: String },
    footer:       { type: FooterContentSchema,          default: undefined },
    contact:      { type: ContactInfoSchema,            default: undefined },
    items:        { type: [GalleryItemSchema],         default: undefined },
    features:     { type: [FeatureItemSchema],       default: undefined },
    testimonials: { type: [TestimonialItemSchema],   default: undefined },
    heroImageUrl: { type: String },
  },
  { timestamps: true }
);

// ─── Export ───────────────────────────────────────────────────────────────────

export const SiteContentModel: Model<SiteContentDocument> =
  models.SiteContent ?? model<SiteContentDocument>("SiteContent", SiteContentSchema);
