/**
 * MongoDB seed script — populates products + initial OWNER staff account.
 *
 * Usage:
 *   cd D:/Projects/hanami
 *   pnpm tsx scripts/seed.ts
 *
 * Requires: MONGODB_URI in apps/api/.env (or set env var directly)
 */

import path from "path";
import { config } from "dotenv";
import mongoose from "mongoose";

// Load env from apps/api/.env
config({ path: path.resolve(__dirname, "../apps/api/.env") });

const MONGODB_URI = process.env.MONGODB_URI!;

// ─── Inline schemas (avoid circular workspace deps in script context) ──────────

const ProductSchema = new mongoose.Schema({
  slug:          { type: String, required: true, unique: true },
  nameVi:        { type: String, required: true },
  nameEn:        { type: String, required: true },
  descVi:        String,
  descEn:        String,
  price:         { type: Number, required: true },
  originalPrice: Number,
  tag:           String,
  gradient:      { type: String, required: true },
  stock:         { type: Number, default: 0 },
  isActive:      { type: Boolean, default: true },
  specs:         [{ labelVi: String, labelEn: String, valueVi: String, valueEn: String }],
}, { timestamps: true });

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ nameVi: "text", nameEn: "text" });

const StaffSchema = new mongoose.Schema({
  email:          { type: String, required: true, unique: true },
  name:           { type: String, required: true },
  hashedPassword: { type: String, required: true },
  role:           { type: String, enum: ["OWNER", "MANAGER", "STAFF"], required: true },
  permissions:    [String],
  totpEnabled:    { type: Boolean, default: false },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

import bcrypt from "bcryptjs";

// ─── Seed data (ported from apps/web/lib/products.ts) ─────────────────────────

const PRODUCTS = [
  {
    slug:  "den-hoa-anh-dao",
    nameVi: "Đèn Hoa Anh Đào",
    nameEn: "Cherry Blossom Lamp",
    descVi: "Đèn ngủ hình hoa anh đào tinh tế với ánh sáng ấm áp, mang lại không gian lãng mạn cho đêm tân hôn.",
    descEn: "Delicate cherry blossom night lamp with warm light, bringing romantic ambiance to your wedding night.",
    price: 890000,
    originalPrice: 1100000,
    tag: "bestseller",
    gradient: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)",
    stock: 50,
    specs: [
      { labelVi: "Kích thước", labelEn: "Size",     valueVi: "15cm × 25cm", valueEn: "15cm × 25cm" },
      { labelVi: "Nguồn điện", labelEn: "Power",    valueVi: "USB-C 5V",    valueEn: "USB-C 5V"    },
      { labelVi: "Màu sắc",    labelEn: "Light",    valueVi: "Vàng ấm",     valueEn: "Warm white"  },
      { labelVi: "Chất liệu",  labelEn: "Material", valueVi: "Nhựa ABS cao cấp", valueEn: "Premium ABS" },
    ],
  },
  {
    slug:  "den-hoa-hong-bac",
    nameVi: "Đèn Hoa Hồng Bạc",
    nameEn: "Silver Rose Lamp",
    descVi: "Hoa hồng mạ bạc vĩnh cửu kết hợp ánh sáng LED dịu nhẹ, biểu tượng của tình yêu bền vững.",
    descEn: "Silver-plated eternal rose with soft LED light, a symbol of everlasting love.",
    price: 1290000,
    originalPrice: undefined,
    tag: "new",
    gradient: "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 50%, #9fa8da 100%)",
    stock: 30,
    specs: [
      { labelVi: "Kích thước", labelEn: "Size",     valueVi: "12cm × 28cm", valueEn: "12cm × 28cm" },
      { labelVi: "Nguồn điện", labelEn: "Power",    valueVi: "Pin AA × 3",  valueEn: "3× AA battery" },
      { labelVi: "Màu sắc",    labelEn: "Light",    valueVi: "Trắng lạnh",  valueEn: "Cool white"  },
      { labelVi: "Chất liệu",  labelEn: "Material", valueVi: "Hoa thật mạ bạc", valueEn: "Real flower silver-plated" },
    ],
  },
  {
    slug:  "den-hoa-cuc-vang",
    nameVi: "Đèn Hoa Cúc Vàng",
    nameEn: "Golden Chrysanthemum Lamp",
    descVi: "Đèn hoa cúc vàng rực rỡ mang ý nghĩa thịnh vượng và hạnh phúc trường tồn.",
    descEn: "Bright golden chrysanthemum lamp symbolizing prosperity and lasting happiness.",
    price: 750000,
    originalPrice: 890000,
    tag: "sale",
    gradient: "linear-gradient(135deg, #fff9c4 0%, #fff176 50%, #ffee58 100%)",
    stock: 75,
    specs: [
      { labelVi: "Kích thước", labelEn: "Size",     valueVi: "18cm × 22cm", valueEn: "18cm × 22cm" },
      { labelVi: "Nguồn điện", labelEn: "Power",    valueVi: "USB-A 5V",    valueEn: "USB-A 5V"    },
      { labelVi: "Màu sắc",    labelEn: "Light",    valueVi: "Vàng rực",    valueEn: "Golden warm" },
      { labelVi: "Chất liệu",  labelEn: "Material", valueVi: "Sợi tơ nhân tạo", valueEn: "Synthetic silk" },
    ],
  },
  {
    slug:  "den-hoa-lan-trang",
    nameVi: "Đèn Hoa Lan Trắng",
    nameEn: "White Orchid Lamp",
    descVi: "Hoa lan trắng thanh khiết, biểu tượng sự sang trọng và tinh tế trong ngày cưới.",
    descEn: "Pure white orchid representing luxury and elegance on your wedding day.",
    price: 1590000,
    originalPrice: undefined,
    tag: "limited",
    gradient: "linear-gradient(135deg, #f5f5f5 0%, #eeeeee 50%, #e0e0e0 100%)",
    stock: 15,
    specs: [
      { labelVi: "Kích thước", labelEn: "Size",     valueVi: "10cm × 32cm", valueEn: "10cm × 32cm" },
      { labelVi: "Nguồn điện", labelEn: "Power",    valueVi: "USB-C 5V",    valueEn: "USB-C 5V"    },
      { labelVi: "Màu sắc",    labelEn: "Light",    valueVi: "Trắng ấm",    valueEn: "Warm white"  },
      { labelVi: "Chất liệu",  labelEn: "Material", valueVi: "Lụa cao cấp", valueEn: "Premium silk" },
    ],
  },
  {
    slug:  "den-hoa-tuy-lip-hong",
    nameVi: "Đèn Hoa Tulip Hồng",
    nameEn: "Pink Tulip Lamp",
    descVi: "Bó tulip hồng ngọt ngào, ánh sáng nhấp nháy nhẹ nhàng tạo không gian mộng mơ.",
    descEn: "Sweet pink tulip bouquet with gentle flickering light creating a dreamy atmosphere.",
    price: 690000,
    originalPrice: undefined,
    tag: undefined,
    gradient: "linear-gradient(135deg, #fce4ec 0%, #f48fb1 50%, #e91e8c 100%)",
    stock: 60,
    specs: [
      { labelVi: "Kích thước", labelEn: "Size",     valueVi: "14cm × 24cm", valueEn: "14cm × 24cm" },
      { labelVi: "Nguồn điện", labelEn: "Power",    valueVi: "Pin AA × 2",  valueEn: "2× AA battery" },
      { labelVi: "Màu sắc",    labelEn: "Light",    valueVi: "Hồng pastel", valueEn: "Pastel pink" },
      { labelVi: "Chất liệu",  labelEn: "Material", valueVi: "Nhựa ABS + vải", valueEn: "ABS + fabric" },
    ],
  },
  {
    slug:  "den-hoa-bup-be",
    nameVi: "Đèn Hoa Búp Bê",
    nameEn: "Baby's Breath Lamp",
    descVi: "Hoa bi trắng tinh khôi kết hợp dải đèn LED màu ấm, trang trí bàn cưới hoàn hảo.",
    descEn: "Pure white baby's breath with warm LED strip, perfect wedding table decoration.",
    price: 590000,
    originalPrice: 720000,
    tag: "sale",
    gradient: "linear-gradient(135deg, #fafafa 0%, #f0f4f8 50%, #e2e8f0 100%)",
    stock: 100,
    specs: [
      { labelVi: "Kích thước", labelEn: "Size",     valueVi: "20cm × 20cm", valueEn: "20cm × 20cm" },
      { labelVi: "Nguồn điện", labelEn: "Power",    valueVi: "USB-A 5V",    valueEn: "USB-A 5V"    },
      { labelVi: "Màu sắc",    labelEn: "Light",    valueVi: "Vàng nhạt",   valueEn: "Soft yellow" },
      { labelVi: "Chất liệu",  labelEn: "Material", valueVi: "Hoa khô tự nhiên", valueEn: "Natural dried flower" },
    ],
  },
  {
    slug:  "den-hoa-mau-don",
    nameVi: "Đèn Hoa Mẫu Đơn",
    nameEn: "Peony Blossom Lamp",
    descVi: "Hoa mẫu đơn rực rỡ, biểu tượng của sự giàu có và hôn nhân viên mãn trong văn hóa Á Đông.",
    descEn: "Vibrant peony symbolizing wealth and happy marriage in East Asian culture.",
    price: 990000,
    originalPrice: undefined,
    tag: "bestseller",
    gradient: "linear-gradient(135deg, #ffd6e0 0%, #ffadc5 50%, #ff85aa 100%)",
    stock: 40,
    specs: [
      { labelVi: "Kích thước", labelEn: "Size",     valueVi: "16cm × 26cm", valueEn: "16cm × 26cm" },
      { labelVi: "Nguồn điện", labelEn: "Power",    valueVi: "USB-C 5V",    valueEn: "USB-C 5V"    },
      { labelVi: "Màu sắc",    labelEn: "Light",    valueVi: "Hồng ấm",     valueEn: "Warm pink"   },
      { labelVi: "Chất liệu",  labelEn: "Material", valueVi: "Lụa + ABS",   valueEn: "Silk + ABS"  },
    ],
  },
  {
    slug:  "den-hoa-huong-duong",
    nameVi: "Đèn Hoa Hướng Dương",
    nameEn: "Sunflower Lamp",
    descVi: "Hướng dương tươi sáng, biểu tượng của tình yêu trung thành và niềm vui trong cuộc sống hôn nhân.",
    descEn: "Bright sunflower symbolizing faithful love and joy in married life.",
    price: 820000,
    originalPrice: 980000,
    tag: "sale",
    gradient: "linear-gradient(135deg, #fffde7 0%, #fff9c4 50%, #f9a825 100%)",
    stock: 35,
    specs: [
      { labelVi: "Kích thước", labelEn: "Size",     valueVi: "20cm × 28cm", valueEn: "20cm × 28cm" },
      { labelVi: "Nguồn điện", labelEn: "Power",    valueVi: "Pin AA × 3",  valueEn: "3× AA battery" },
      { labelVi: "Màu sắc",    labelEn: "Light",    valueVi: "Vàng nắng",   valueEn: "Sunny yellow" },
      { labelVi: "Chất liệu",  labelEn: "Material", valueVi: "Vải + nhựa",  valueEn: "Fabric + plastic" },
    ],
  },
];

// ─── Main seed function ────────────────────────────────────────────────────────

async function seed() {
  console.log("🌸 Hanami seed script starting...\n");

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const Product   = mongoose.models.Product   ?? mongoose.model("Product",   ProductSchema);
  const StaffUser = mongoose.models.StaffUser ?? mongoose.model("StaffUser", StaffSchema);

  // ── Seed products ─────────────────────────────────────────────────────────────
  let created = 0, skipped = 0;
  for (const p of PRODUCTS) {
    const exists = await Product.findOne({ slug: p.slug });
    if (exists) { skipped++; continue; }
    await Product.create({
      slug:          p.slug,
      nameVi:        p.nameVi,
      nameEn:        p.nameEn,
      price:         p.price,
      originalPrice: p.originalPrice,
      tag:           p.tag,
      gradient:      p.gradient,
      stock:         p.stock,
      isActive:      true,
      // Map old {labelEn, valueEn} → {label, value}
      specs: p.specs.map((s) => ({ label: s.labelEn, value: s.valueEn })),
    });
    created++;
  }
  console.log(`🌸 Products: ${created} created, ${skipped} skipped\n`);

  // ── Seed OWNER staff account ─────────────────────────────────────────────────
  const OWNER_EMAIL    = process.env.OWNER_EMAIL ?? "owner@hanami.vn";
  const OWNER_PASSWORD = "Hanami@2026!"; // change after first login

  const OWNER_PERMISSIONS = [
    "orders:read", "orders:update", "orders:refund",
    "products:read", "products:write",
    "customers:read", "customers:manage",
    "staff:manage",
    "coupons:manage",
    "analytics:read",
    "audit:read",
    "settings:manage",
    "consultations:read", "consultations:write",
    "content:write",
  ];

  const ownerExists = await StaffUser.findOne({ email: OWNER_EMAIL });
  if (ownerExists) {
    // Patch missing permissions on existing OWNER (e.g. added after initial seed)
    await StaffUser.updateOne(
      { email: OWNER_EMAIL },
      { $addToSet: { permissions: { $each: OWNER_PERMISSIONS } } }
    );
    console.log(`  ✅ OWNER permissions synced (${OWNER_EMAIL})`);
  } else {
    const hashed = await bcrypt.hash(OWNER_PASSWORD, 12);
    await StaffUser.create({
      email:          OWNER_EMAIL,
      name:           "Hanami Owner",
      hashedPassword: hashed,
      role:           "OWNER",
      permissions: OWNER_PERMISSIONS,
      totpEnabled: false,
      isActive:    true,
    });
    console.log(`\n👑 OWNER account created:`);
    console.log(`   Email:    ${OWNER_EMAIL}`);
    console.log(`   Password: ${OWNER_PASSWORD}`);
    console.log(`   ⚠️  Change password after first login!\n`);
  }

  await mongoose.disconnect();
  console.log("\n🌸 Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err.message);
  process.exit(1);
});
