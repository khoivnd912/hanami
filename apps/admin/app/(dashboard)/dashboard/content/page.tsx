"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FileText, Save, CheckCircle, RefreshCw, Image, Quote, Plus, Trash2, Sparkles, Phone, Link, LayoutTemplate } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AboutLang {
  heading: string; headingEm: string;
  p1: string; p2: string; p3: string;
  stat1num: string; stat1label: string;
  stat2num: string; stat2label: string;
  stat3num: string; stat3label: string;
  founderTitle: string;
}

interface AboutContent {
  vi: AboutLang; en: AboutLang;
  founderName: string; foundedYear: string;
  founderImageUrl: string;
}

interface FooterContent {
  taglineVi: string; taglineEn: string; bizName: string;
  instagram: string; facebook: string; threads: string; tiktok: string;
}

interface ContactInfo {
  address: string; phone: string; email: string; facebook: string;
  hoursMF: string; hoursSat: string; hoursSun: string;
}

interface FeatureItem {
  titleVi: string; titleEn: string;
  descVi:  string; descEn:  string;
}

interface TestimonialItem {
  quote: string; name: string; location: string; floral: string;
  imageUrl?: string; avatarUrl?: string;
}

interface GalleryItem {
  nameVi: string; nameEn: string;
  tagKey: string; gradient: string;
  imageUrl?: string;
}

const EMPTY_LANG: AboutLang = {
  heading: "", headingEm: "", p1: "", p2: "", p3: "",
  stat1num: "", stat1label: "", stat2num: "", stat2label: "",
  stat3num: "", stat3label: "", founderTitle: "",
};

const DEFAULT_ABOUT: AboutContent = {
  vi: {
    heading: "Tạo Nên Vẻ Đẹp,", headingEm: "Lưu Giữ Khoảnh Khắc",
    p1: "Hanami được sinh ra từ một niềm tin: rằng những bông hoa đẹp nhất trong ngày cưới của bạn xứng đáng tồn tại mãi mãi — không phải trong ảnh chụp, mà trong ánh sáng sống động.",
    p2: "Mỗi chiếc đèn bắt đầu từ những bông hoa thật, được bảo quản trân trọng ở đỉnh cao vẻ đẹp. Các nghệ nhân của chúng tôi sắp xếp chúng trong bình thủy tinh thổi tay, tạo nên tác phẩm trung tâm ấm áp, tỏa sáng mang lại sức sống cho mọi căn phòng.",
    p3: "Từ những buổi lễ vườn thân mật đến các đại sảnh tiệc cưới, đèn Hanami đã thắp sáng hơn 3.000 đám cưới khắp Việt Nam — mỗi đám cưới đều độc nhất của riêng bạn.",
    stat1num: "3.000+", stat1label: "Đám cưới",
    stat2num: "100%",   stat2label: "Thủ công",
    stat3num: "6 năm",  stat3label: "Kinh nghiệm",
    founderTitle: "Nhà Sáng Lập & Nghệ Nhân Chính",
  },
  en: {
    heading: "Crafting Beauty,", headingEm: "Preserving Moments",
    p1: "Hanami was born from a single belief: that the most beautiful flowers of your wedding day deserve to last forever — not in a photograph, but in living light.",
    p2: "Each lamp begins with real flowers, lovingly preserved at the height of their bloom. Our artisans then arrange them within hand-blown glass, creating a warm, glowing centerpiece that breathes life into any room, any evening.",
    p3: "From intimate garden ceremonies to grand ballrooms, Hanami lamps have illuminated over 3,000 weddings across Vietnam — each one uniquely yours.",
    stat1num: "3,000+", stat1label: "Weddings",
    stat2num: "100%",   stat2label: "Handcrafted",
    stat3num: "6 yrs",  stat3label: "Experience",
    founderTitle: "Founder & Lead Artisan",
  },
  founderName: "Misaki Nguyen",
  foundedYear: "2018",
  founderImageUrl: "",
};

const DEFAULT_GALLERY: GalleryItem[] = [
  { nameVi: "Hoa Hồng Đêm",       nameEn: "Night Rose Lamp",      tagKey: "tagSignature",
    gradient: "radial-gradient(ellipse at 50% 35%, #fff5f7 0%, #fae8ee 20%, #f19cad 45%, #c05070 70%, #380d1c 100%)", imageUrl: "" },
  { nameVi: "Hoa Anh Đào",        nameEn: "Cherry Blossom Set",   tagKey: "tagSeasonal",
    gradient: "linear-gradient(135deg, #fffde7 0%, #fae8ee 40%, #f19cad 75%, #d96b82 100%)", imageUrl: "" },
  { nameVi: "Mẫu Đơn",            nameEn: "Peony Glow",           tagKey: "tagPopular",
    gradient: "radial-gradient(ellipse at 35% 35%, #fffde7 0%, #fae8ee 30%, #e8859a 65%, #8a3050 100%)", imageUrl: "" },
  { nameVi: "Mộc Lan",            nameEn: "Magnolia Dream",        tagKey: "tagClassic",
    gradient: "linear-gradient(to bottom right, #fffde7 0%, #fae8ee 40%, #f4b6c2 75%, #f19cad 100%)", imageUrl: "" },
  { nameVi: "Thược Dược",         nameEn: "Dahlia Evening",       tagKey: "tagExclusive",
    gradient: "radial-gradient(circle at 50% 45%, #f9d5e2 0%, #d96b82 40%, #8a3050 70%, #380d1c 100%)", imageUrl: "" },
  { nameVi: "Bộ Sưu Tập Cưới",   nameEn: "Wedding Collection",   tagKey: "tagBespoke",
    gradient: "linear-gradient(120deg, #fae8ee 0%, #f4b6c2 20%, #f19cad 45%, #c05070 65%, #8a3050 82%, #380d1c 100%)", imageUrl: "" },
];

const DEFAULT_FOOTER: FooterContent = {
  taglineVi: "Đèn hoa cưới thủ công — nơi câu chuyện tình yêu của bạn được lưu giữ trong cánh hoa và ánh sáng, mãi mãi.",
  taglineEn: "Handcrafted wedding flower night lamps — where your love story is preserved in petal and light, forever.",
  bizName:   "Hanami Flower Studio",
  instagram: "", facebook: "", threads: "", tiktok: "",
};

const DEFAULT_CONTACT: ContactInfo = {
  address:   "12 Hoa Hồng Lane, Tây Hồ District, Hà Nội",
  phone:     "+84 90 123 4567",
  email:     "hello@hanamiflower.vn",
  facebook:  "Hanami Flower",
  hoursMF:   "9:00 – 18:00",
  hoursSat:  "9:00 – 16:00",
  hoursSun:  "",
};

const FEATURE_ICONS = ["✦ Sparkles", "✿ Flower", "♥ Heart"];

const DEFAULT_FEATURES: FeatureItem[] = [
  { titleVi: "Thủ Công Tinh Tế",        titleEn: "Handcrafted with Care",
    descVi:  "Mỗi chiếc đèn được lắp ráp thủ công bởi các nghệ nhân, đảm bảo mỗi tác phẩm mang vẻ hoàn hảo riêng của mình.",
    descEn:  "Every lamp is individually hand-assembled by our artisans, ensuring each piece carries its own quiet perfection." },
  { titleVi: "Thiết Kế Hoa Tùy Chỉnh",  titleEn: "Custom Floral Design",
    descVi:  "Chọn hoa, màu sắc và độ ấm ánh sáng theo ý bạn. Chúng tôi cộng tác với bạn để phản ánh tinh thần đám cưới.",
    descEn:  "Choose your flowers, colors, and light warmth. We collaborate with you to reflect the spirit of your wedding." },
  { titleVi: "Kỷ Niệm Vĩnh Cửu",        titleEn: "Timeless Keepsake",
    descVi:  "Được bảo quản để tồn tại mãi mãi, đèn của chúng tôi không chỉ là vật trang trí — mà là ký ức rạng ngời bạn giữ mãi.",
    descEn:  "Preserved to last a lifetime, our lamps are more than decor — they are luminous memories you keep forever." },
];

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  { quote: "Em nhận được hoa rồi ạ. Siêu xinh luôn, đóng gói cẩn thận, hoa tươi rất lâu. Lần sau chị vẫn sẽ quay lại ạ :))", name: "Bánh Bao", location: "Nghệ An", floral: "Rose & Lily Collection", imageUrl: "" },
  { quote: "Shop giao hàng đúng giờ, hoa đẹp hơn cả ảnh. Bạn ấy nhà mình thích lắm, cảm ơn shop nhiều nha!", name: "Linh & Minh", location: "Hà Nội", floral: "Cherry Blossom Set", imageUrl: "" },
  { quote: "Đặt đèn hoa làm quà kỷ niệm, shop tư vấn rất nhiệt tình. Sản phẩm giữ được lâu, ánh sáng lung linh, nhìn là thích ngay.", name: "Mai Anh & Tuấn", location: "TP. Hồ Chí Minh", floral: "Bespoke Peony Lamp", imageUrl: "" },
];

const TAG_OPTIONS = [
  { value: "tagSignature", label: "Đặc Trưng / Signature" },
  { value: "tagSeasonal",  label: "Theo Mùa / Seasonal" },
  { value: "tagPopular",   label: "Phổ Biến / Popular" },
  { value: "tagClassic",   label: "Cổ Điển / Classic" },
  { value: "tagExclusive", label: "Độc Quyền / Exclusive" },
  { value: "tagBespoke",   label: "Đặt Riêng / Bespoke" },
];

const POSITION_LABEL = ["Ảnh lớn (vị trí 1)", "Ảnh nhỏ 2", "Ảnh nhỏ 3", "Ảnh nhỏ 4", "Ảnh nhỏ 5", "Ảnh rộng (vị trí 6)"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function apiUrl() { return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"; }
function token()  { return typeof window !== "undefined" ? (localStorage.getItem("admin_token") ?? "") : ""; }

// ─── UI primitives ────────────────────────────────────────────────────────────

function Field({ label, value, onChange, multiline = false }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean;
}) {
  const cls = "w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-pink-400 resize-none";
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      {multiline
        ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />}
    </div>
  );
}

// ─── About tab ────────────────────────────────────────────────────────────────

function AboutTab({ content, setContent }: {
  content: AboutContent;
  setContent: React.Dispatch<React.SetStateAction<AboutContent>>;
}) {
  const [langTab, setLangTab] = useState<"vi" | "en">("vi");

  function setLang(lang: "vi" | "en", field: keyof AboutLang, val: string) {
    setContent((p) => ({ ...p, [lang]: { ...p[lang], [field]: val } }));
  }
  function setCommon(field: "founderName" | "foundedYear" | "founderImageUrl", val: string) {
    setContent((p) => ({ ...p, [field]: val }));
  }

  const L = content[langTab];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div className="xl:col-span-2 rounded-2xl border p-5 space-y-4"
        style={{ borderColor: "rgba(244,182,194,0.25)", background: "rgba(255,255,255,0.02)" }}>
        <div className="flex gap-2">
          {(["vi", "en"] as const).map((l) => (
            <button key={l} onClick={() => setLangTab(l)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${langTab === l ? "text-white" : "text-gray-400 hover:text-gray-600 border border-gray-200"}`}
              style={langTab === l ? { background: "rgba(244,182,194,0.9)" } : {}}>
              {l === "vi" ? "Tiếng Việt" : "English"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Tiêu đề (phần thường)" value={L.heading}   onChange={(v) => setLang(langTab, "heading",   v)} />
          <Field label="Tiêu đề (phần nghiêng)" value={L.headingEm} onChange={(v) => setLang(langTab, "headingEm", v)} />
        </div>
        <Field label="Đoạn văn 1" value={L.p1} onChange={(v) => setLang(langTab, "p1", v)} multiline />
        <Field label="Đoạn văn 2" value={L.p2} onChange={(v) => setLang(langTab, "p2", v)} multiline />
        <Field label="Đoạn văn 3" value={L.p3} onChange={(v) => setLang(langTab, "p3", v)} multiline />
        <div className="grid grid-cols-3 gap-3">
          <Field label="Số liệu 1" value={L.stat1num}   onChange={(v) => setLang(langTab, "stat1num",   v)} />
          <Field label="Nhãn 1"    value={L.stat1label} onChange={(v) => setLang(langTab, "stat1label", v)} />
          <div />
          <Field label="Số liệu 2" value={L.stat2num}   onChange={(v) => setLang(langTab, "stat2num",   v)} />
          <Field label="Nhãn 2"    value={L.stat2label} onChange={(v) => setLang(langTab, "stat2label", v)} />
          <div />
          <Field label="Số liệu 3" value={L.stat3num}   onChange={(v) => setLang(langTab, "stat3num",   v)} />
          <Field label="Nhãn 3"    value={L.stat3label} onChange={(v) => setLang(langTab, "stat3label", v)} />
          <div />
        </div>
        <Field label="Chức danh người sáng lập" value={L.founderTitle} onChange={(v) => setLang(langTab, "founderTitle", v)} />
      </div>

      <div className="rounded-2xl border p-5 space-y-4"
        style={{ borderColor: "rgba(244,182,194,0.25)", background: "rgba(255,255,255,0.02)" }}>
        <h2 className="text-sm font-medium text-gray-700 mb-2">Thông tin chung</h2>
        <Field label="Tên người sáng lập" value={content.founderName} onChange={(v) => setCommon("founderName", v)} />
        <Field label="Năm thành lập"      value={content.foundedYear} onChange={(v) => setCommon("foundedYear", v)} />
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block font-medium">Ảnh avatar người sáng lập</label>
          <ImageUpload
            value={content.founderImageUrl}
            onChange={(url) => setCommon("founderImageUrl", url)}
          />
          <p className="text-[11px] text-gray-400 mt-1.5 leading-4">
            Hiển thị trong chữ ký cuối section câu chuyện. Để trống → dùng chữ cái đầu tên.
          </p>
        </div>
        <div className="pt-4 border-t border-dashed" style={{ borderColor: "rgba(244,182,194,0.3)" }}>
          <p className="text-xs text-gray-400 leading-5">
            Hiển thị trong phần <strong className="text-gray-600">Câu Chuyện Của Chúng Tôi</strong> trên trang chủ.
            Nếu để trống, dùng nội dung mặc định theo ngôn ngữ.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Hero tab ─────────────────────────────────────────────────────────────────

function HeroTab({ imageUrl, setImageUrl }: {
  imageUrl: string;
  setImageUrl: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div className="rounded-2xl border p-5 space-y-4"
        style={{ borderColor: "rgba(244,182,194,0.25)", background: "rgba(255,255,255,0.02)" }}>
        <h2 className="text-sm font-medium text-gray-700">Ảnh nền Hero</h2>
        <p className="text-xs text-gray-400 leading-5">
          Ảnh sẽ hiển thị phía sau phần tiêu đề trang chủ với độ mờ nhẹ, giữ nguyên hiệu ứng ánh sáng và cánh hoa.
          Để trống → dùng nền tối mặc định.
        </p>
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
      </div>

      {/* Live preview hint */}
      <div className="rounded-2xl border p-5 flex flex-col items-center justify-center gap-3 text-center"
        style={{ borderColor: "rgba(244,182,194,0.25)", background: "rgba(255,255,255,0.02)" }}>
        <div className="w-full rounded-xl overflow-hidden relative"
          style={{ height: 180, background: "#0a0308" }}>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.28 }} />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <p className="text-[10px] tracking-[0.2em] uppercase text-pink-200/70">Hanami Flower Studio</p>
            <p className="font-display text-2xl text-white/30 tracking-widest">花見</p>
            <p className="font-display text-xl text-white/60 tracking-[0.12em]">Hanami</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">Xem trước (ảnh thu nhỏ)</p>
      </div>
    </div>
  );
}

// ─── Gallery tab ──────────────────────────────────────────────────────────────

function GalleryTab({ items, setItems }: {
  items: GalleryItem[];
  setItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
}) {
  function setItem(idx: number, field: keyof GalleryItem, val: string | number) {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">
        Bộ sưu tập gồm 6 ô cố định theo lưới. Vị trí 1 là ô lớn nhất, vị trí 6 là ô rộng cuối.
        Tải ảnh lên để thay thế gradient mặc định.
      </p>
      {items.map((item, idx) => (
        <div key={idx} className="rounded-2xl border p-4"
          style={{ borderColor: "rgba(244,182,194,0.25)", background: "rgba(255,255,255,0.02)" }}>
          <p className="text-sm font-medium text-gray-700 mb-4">{POSITION_LABEL[idx]}</p>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
            {/* Left: image upload */}
            <ImageUpload
              value={item.imageUrl ?? ""}
              onChange={(url) => setItem(idx, "imageUrl", url)}
            />

            {/* Right: metadata fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Tên (Tiếng Việt)" value={item.nameVi} onChange={(v) => setItem(idx, "nameVi", v)} />
                <Field label="Tên (English)"     value={item.nameEn} onChange={(v) => setItem(idx, "nameEn", v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nhãn</label>
                  <select value={item.tagKey} onChange={(e) => setItem(idx, "tagKey", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-pink-400">
                    {TAG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              {/* Gradient — shown only when no image */}
              {!item.imageUrl && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">CSS Gradient (dự phòng khi chưa có ảnh)</label>
                  <input value={item.gradient} onChange={(e) => setItem(idx, "gradient", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-pink-400 font-mono"
                    placeholder="radial-gradient(…) hoặc linear-gradient(…)" />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Footer tab ──────────────────────────────────────────────────────────────

function FooterTab({ info, setInfo }: {
  info: FooterContent;
  setInfo: React.Dispatch<React.SetStateAction<FooterContent>>;
}) {
  function set(field: keyof FooterContent, val: string) {
    setInfo((p) => ({ ...p, [field]: val }));
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {/* Brand & tagline */}
      <div className="rounded-2xl border p-5 space-y-4"
        style={{ borderColor: "rgba(244,182,194,0.25)", background: "rgba(255,255,255,0.02)" }}>
        <h2 className="text-sm font-medium text-gray-700">Thương hiệu</h2>
        <Field label="Tên thương hiệu (bản quyền)" value={info.bizName} onChange={(v) => set("bizName", v)} />
        <Field label="Tagline (Tiếng Việt)" value={info.taglineVi} onChange={(v) => set("taglineVi", v)} multiline />
        <Field label="Tagline (English)"    value={info.taglineEn} onChange={(v) => set("taglineEn", v)} multiline />
      </div>

      {/* Social links */}
      <div className="rounded-2xl border p-5 space-y-4"
        style={{ borderColor: "rgba(244,182,194,0.25)", background: "rgba(255,255,255,0.02)" }}>
        <h2 className="text-sm font-medium text-gray-700">Mạng xã hội</h2>
        <Field label="Instagram URL" value={info.instagram} onChange={(v) => set("instagram", v)} />
        <Field label="Facebook URL"  value={info.facebook}  onChange={(v) => set("facebook",  v)} />
        <Field label="Threads URL" value={info.threads} onChange={(v) => set("threads", v)} />
        <Field label="TikTok URL"    value={info.tiktok}    onChange={(v) => set("tiktok",    v)} />
        <p className="text-xs text-gray-400">
          Để trống → icon vẫn hiện với href="#". Nhập URL đầy đủ (https://…) để link đúng.
        </p>
      </div>
    </div>
  );
}

// ─── Contact tab ─────────────────────────────────────────────────────────────

function ContactTab({ info, setInfo }: {
  info: ContactInfo;
  setInfo: React.Dispatch<React.SetStateAction<ContactInfo>>;
}) {
  function set(field: keyof ContactInfo, val: string) {
    setInfo((p) => ({ ...p, [field]: val }));
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {/* Contact details */}
      <div className="rounded-2xl border p-5 space-y-4"
        style={{ borderColor: "rgba(244,182,194,0.25)", background: "rgba(255,255,255,0.02)" }}>
        <h2 className="text-sm font-medium text-gray-700">Thông tin liên hệ</h2>
        <Field label="Địa chỉ"  value={info.address}   onChange={(v) => set("address",   v)} />
        <Field label="Điện thoại / Zalo" value={info.phone}  onChange={(v) => set("phone",     v)} />
        <Field label="Email"           value={info.email}     onChange={(v) => set("email",     v)} />
        <Field label="Facebook"        value={info.facebook}  onChange={(v) => set("facebook",  v)} />
      </div>

      {/* Studio hours */}
      <div className="rounded-2xl border p-5 space-y-4"
        style={{ borderColor: "rgba(244,182,194,0.25)", background: "rgba(255,255,255,0.02)" }}>
        <h2 className="text-sm font-medium text-gray-700">Giờ làm việc</h2>
        <Field label="Thứ 2 – Thứ 6"  value={info.hoursMF}  onChange={(v) => set("hoursMF",  v)} />
        <Field label="Thứ 7"          value={info.hoursSat} onChange={(v) => set("hoursSat", v)} />
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Chủ Nhật</label>
          <input value={info.hoursSun} onChange={(e) => set("hoursSun", e.target.value)}
            placeholder="Theo lịch hẹn (để trống = dùng text mặc định)"
            className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-pink-400 placeholder-gray-300" />
        </div>
        <p className="text-xs text-gray-400">
          Chủ Nhật để trống → hiển thị "Theo lịch hẹn" (theo ngôn ngữ người dùng).
        </p>
      </div>
    </div>
  );
}

// ─── Features tab ────────────────────────────────────────────────────────────

function FeaturesTab({ items, setItems }: {
  items: FeatureItem[];
  setItems: React.Dispatch<React.SetStateAction<FeatureItem[]>>;
}) {
  function setItem(idx: number, field: keyof FeatureItem, val: string) {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">3 cam kết cố định theo thứ tự. Icon và màu sắc giữ nguyên theo vị trí.</p>
      {items.map((item, idx) => (
        <div key={idx} className="rounded-2xl border p-4 space-y-3"
          style={{ borderColor: "rgba(244,182,194,0.25)", background: "rgba(255,255,255,0.02)" }}>
          <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span className="text-pink-400 text-base">{FEATURE_ICONS[idx]}</span>
            Cam kết #{idx + 1}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Tiêu đề (Tiếng Việt)" value={item.titleVi} onChange={(v) => setItem(idx, "titleVi", v)} />
            <Field label="Tiêu đề (English)"     value={item.titleEn} onChange={(v) => setItem(idx, "titleEn", v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Mô tả (Tiếng Việt)" value={item.descVi} onChange={(v) => setItem(idx, "descVi", v)} multiline />
            <Field label="Mô tả (English)"     value={item.descEn} onChange={(v) => setItem(idx, "descEn", v)} multiline />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Testimonials tab ─────────────────────────────────────────────────────────

function TestimonialsTab({ items, setItems }: {
  items: TestimonialItem[];
  setItems: React.Dispatch<React.SetStateAction<TestimonialItem[]>>;
}) {
  const [expanded, setExpanded] = useState<number | null>(0);

  function setItem(idx: number, field: keyof TestimonialItem, val: string) {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  }
  function addItem() {
    const next = items.length;
    setItems((prev) => [...prev, { quote: "", name: "", location: "", floral: "", imageUrl: "", avatarUrl: "" }]);
    setExpanded(next);
  }
  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setExpanded(null);
  }
  function moveItem(idx: number, dir: -1 | 1) {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
    setExpanded(target);
  }

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Phản hồi khách hàng</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Trang chủ hiển thị 3 phản hồi / trang, phân trang tự động. Hiện có <strong className="text-gray-600">{items.length}</strong> phản hồi.
          </p>
        </div>
        <button onClick={addItem}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#f4b6c2", color: "#7A2E3F" }}>
          <Plus size={13} /> Thêm phản hồi
        </button>
      </div>

      {/* Cards */}
      {items.map((item, idx) => {
        const isOpen = expanded === idx;
        const hasImage = !!item.imageUrl;
        return (
          <div key={idx}
            className="rounded-2xl border overflow-hidden transition-all duration-200"
            style={{ borderColor: isOpen ? "rgba(244,182,194,0.6)" : "rgba(244,182,194,0.25)", background: "white" }}>

            {/* ── Card header (always visible) ── */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
              style={{ background: isOpen ? "rgba(244,182,194,0.08)" : "white" }}
              onClick={() => setExpanded(isOpen ? null : idx)}
            >
              {/* Photo thumbnail */}
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border"
                style={{ borderColor: "rgba(244,182,194,0.3)", background: "linear-gradient(135deg,#fce4ed,#f9a8d4)" }}>
                {hasImage
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-[16px]">🌸</div>
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {item.name || <span className="text-gray-400 font-normal italic">Chưa có tên</span>}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {item.location && <span className="mr-2">📍 {item.location}</span>}
                  {item.floral   && <span style={{ color: "#B76E79" }}>✿ {item.floral}</span>}
                </p>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {hasImage && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ background: "rgba(244,182,194,0.2)", color: "#9C4A64" }}>
                    Có ảnh
                  </span>
                )}
                {!!item.avatarUrl && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ background: "rgba(232,133,154,0.15)", color: "#7A2E3F" }}>
                    Có avatar
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
                  #{idx + 1}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* ── Expanded editor ── */}
            {isOpen && (
              <div className="px-4 pb-5 pt-1 space-y-4 border-t" style={{ borderColor: "rgba(244,182,194,0.2)" }}>

                {/* Layout: image upload + fields */}
                <div className="grid grid-cols-1 lg:grid-cols-[210px_1fr] gap-4 pt-3 min-w-0">

                  {/* Left: photo uploads */}
                  <div className="space-y-3 min-w-0 overflow-hidden">
                    <ImageUpload
                      label="Ảnh sản phẩm / gửi"
                      value={item.imageUrl ?? ""}
                      onChange={(url) => setItem(idx, "imageUrl", url)}
                    />
                    <ImageUpload
                      label="Avatar khách hàng"
                      variant="avatar"
                      value={item.avatarUrl ?? ""}
                      onChange={(url) => setItem(idx, "avatarUrl", url)}
                    />
                  </div>

                  {/* Right: text fields */}
                  <div className="space-y-3 min-w-0">
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block font-medium">Nội dung phản hồi *</label>
                      <textarea
                        rows={4}
                        value={item.quote}
                        onChange={(e) => setItem(idx, "quote", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-pink-400 resize-none"
                        placeholder="Lời nhận xét của khách hàng… ví dụ: Em nhận được hoa rồi ạ. Siêu xinh luôn :))"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block font-medium">Tên khách hàng *</label>
                        <input
                          value={item.name}
                          onChange={(e) => setItem(idx, "name", e.target.value)}
                          placeholder="Bánh Bao"
                          className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-pink-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block font-medium">Địa điểm</label>
                        <input
                          value={item.location}
                          onChange={(e) => setItem(idx, "location", e.target.value)}
                          placeholder="Nghệ An"
                          className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-pink-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block font-medium">Sản phẩm</label>
                        <input
                          value={item.floral}
                          onChange={(e) => setItem(idx, "floral", e.target.value)}
                          placeholder="Rose & Lily Collection"
                          className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-pink-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Preview card (mini) ── */}
                {(item.quote || item.name) && (
                  <div className="rounded-xl border overflow-hidden"
                    style={{ borderColor: "rgba(244,182,194,0.3)", background: "#fdf9fb" }}>
                    <p className="text-[10px] tracking-[0.12em] uppercase font-semibold px-3 pt-2.5 pb-2"
                      style={{ color: "#B76E79", borderBottom: "1px solid rgba(244,182,194,0.2)" }}>
                      Xem trước card
                    </p>
                    <div className="flex gap-0 overflow-hidden rounded-b-xl" style={{ height: 90 }}>
                      {/* Thumbnail */}
                      <div className="w-[80px] flex-shrink-0 relative overflow-hidden"
                        style={{ background: "linear-gradient(145deg,#fce4ed,#f9a8d4,#e879a8)" }}>
                        {hasImage
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          : (
                            <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-40">🌸</div>
                          )
                        }
                        {item.floral && (
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full text-[8px] font-semibold"
                            style={{ background: "#F4B6C2", color: "#7A2E3F" }}>
                            {item.floral.length > 12 ? item.floral.slice(0, 12) + "…" : item.floral}
                          </div>
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex-1 px-3 py-2 flex flex-col justify-between overflow-hidden">
                        <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2 italic">
                          <span style={{ color: "#E8859A" }}>&ldquo;</span>
                          {item.quote || "…"}
                          <span style={{ color: "#E8859A" }}>&rdquo;</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {item.avatarUrl
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={item.avatarUrl} alt="" className="w-5 h-5 rounded-full flex-shrink-0 object-cover" style={{ border: "1px solid #f4b6c2" }} />
                            : <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
                                style={{ background: "linear-gradient(135deg,#f4b6c2,#e8859a)" }}>
                                {item.name?.[0]?.toUpperCase() ?? "?"}
                              </div>
                          }
                          <div>
                            <p className="text-[10px] font-semibold text-gray-800 leading-none">{item.name || "—"}</p>
                            {item.location && <p className="text-[9px] text-gray-400 leading-none mt-0.5">{item.location}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Actions ── */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      title="Lên trên"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === items.length - 1}
                      title="Xuống dưới"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <span className="text-[11px] text-gray-400 ml-1">Thứ tự hiển thị</span>
                  </div>
                  <button onClick={() => removeItem(idx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} /> Xoá phản hồi này
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm border-2 rounded-2xl border-dashed cursor-pointer hover:border-pink-300 transition-colors"
          style={{ borderColor: "rgba(244,182,194,0.3)" }}
          onClick={addItem}>
          <div className="text-3xl mb-2">🌸</div>
          <p>Chưa có phản hồi nào.</p>
          <p className="text-xs mt-1" style={{ color: "#d96b82" }}>Nhấn để thêm phản hồi đầu tiên</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Section = "hero" | "about" | "gallery" | "features" | "testimonials" | "contact" | "footer";

export default function ContentPage() {
  const [section,      setSection]      = useState<Section>("about");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [about,        setAbout]        = useState<AboutContent>(DEFAULT_ABOUT);
  const [gallery,      setGallery]      = useState<GalleryItem[]>(DEFAULT_GALLERY);
  const [footer,       setFooter]       = useState<FooterContent>(DEFAULT_FOOTER);
  const [contact,      setContact]      = useState<ContactInfo>(DEFAULT_CONTACT);
  const [features,     setFeatures]     = useState<FeatureItem[]>(DEFAULT_FEATURES);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [saveState,    setSaveState]    = useState<"idle" | "ok" | "error">("idle");
  const [saveError,    setSaveError]    = useState("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [heroRes, aboutRes, galleryRes, featuresRes, testimonialsRes, contactRes, footerRes] = await Promise.all([
        fetch(`${apiUrl()}/admin/site-content/hero`,         { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${apiUrl()}/admin/site-content/about`,        { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${apiUrl()}/admin/site-content/gallery`,      { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${apiUrl()}/admin/site-content/features`,     { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${apiUrl()}/admin/site-content/testimonials`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${apiUrl()}/admin/site-content/contact`,      { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${apiUrl()}/admin/site-content/footer`,       { headers: { Authorization: `Bearer ${token()}` } }),
      ]);

      const heroJson         = await heroRes.json();
      const aboutJson        = await aboutRes.json();
      const galleryJson      = await galleryRes.json();
      const featuresJson     = await featuresRes.json();
      const testimonialsJson = await testimonialsRes.json();
      const contactJson      = await contactRes.json();
      const footerJson       = await footerRes.json();

      if (heroJson.success && heroJson.data?.heroImageUrl) {
        setHeroImageUrl(heroJson.data.heroImageUrl);
      }

      if (aboutJson.success && aboutJson.data) {
        setAbout({
          vi:               { ...EMPTY_LANG, ...aboutJson.data.vi },
          en:               { ...EMPTY_LANG, ...aboutJson.data.en },
          founderName:      aboutJson.data.founderName      ?? DEFAULT_ABOUT.founderName,
          foundedYear:      aboutJson.data.foundedYear      ?? DEFAULT_ABOUT.foundedYear,
          founderImageUrl:  aboutJson.data.founderImageUrl  ?? "",
        });
      }

      if (galleryJson.success && galleryJson.data?.items?.length) {
        setGallery(galleryJson.data.items.map((it: Partial<GalleryItem>, i: number) => ({
          ...DEFAULT_GALLERY[i],
          ...it,
          imageUrl: it.imageUrl ?? "",
        })));
      }

      if (featuresJson.success && featuresJson.data?.features?.length === 3) {
        setFeatures(featuresJson.data.features.map((it: Partial<FeatureItem>, i: number) => ({
          ...DEFAULT_FEATURES[i], ...it,
        })));
      }

      if (testimonialsJson.success && testimonialsJson.data?.testimonials?.length) {
        setTestimonials(testimonialsJson.data.testimonials);
      }

      if (contactJson.success && contactJson.data?.contact) {
        setContact({ ...DEFAULT_CONTACT, ...contactJson.data.contact });
      }

      if (footerJson.success && footerJson.data?.footer) {
        setFooter({ ...DEFAULT_FOOTER, ...footerJson.data.footer });
      }
    } catch {/* keep defaults */}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Save ──────────────────────────────────────────────────────────────────

  async function save() {
    setSaving(true);
    try {
      const body =
        section === "hero"         ? { heroImageUrl } :
        section === "about"        ? about :
        section === "gallery"      ? { items: gallery } :
        section === "features"     ? { features } :
        section === "testimonials" ? { testimonials } :
        section === "contact"      ? { contact } :
                                     { footer };

      const res  = await fetch(`${apiUrl()}/admin/site-content/${section}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body:    JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `Lỗi ${res.status}`);
      setSaveState("ok");
      setSaveError("");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveState("idle"), 2500);
    } catch (err) {
      setSaveState("error");
      setSaveError(err instanceof Error ? err.message : "Lưu thất bại");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveState("idle"), 4000);
    } finally {
      setSaving(false);
    }
  }

  const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: "hero",         label: "Hero",         icon: <LayoutTemplate size={14} /> },
    { id: "about",        label: "Câu Chuyện",  icon: <FileText size={14} /> },
    { id: "gallery",      label: "Bộ Sưu Tập",  icon: <Image size={14} /> },
    { id: "features",     label: "Cam Kết",      icon: <Sparkles size={14} /> },
    { id: "testimonials", label: "Phản Hồi",     icon: <Quote size={14} /> },
    { id: "contact",      label: "Liên Hệ",     icon: <Phone size={14} /> },
    { id: "footer",       label: "Footer",      icon: <Link size={14} /> },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#f4b6c2", color: "#333333" }}>
            <FileText size={17} className="text-[#555]" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Nội dung trang</h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
          <div className="flex flex-col items-end gap-1">
            <button onClick={save} disabled={saving || loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60 whitespace-nowrap"
              style={{ background: saveState === "error" ? "#ef4444" : "#f4b6c2", color: saveState === "error" ? "#fff" : "#333" }}>
              {saveState === "ok"    ? <><CheckCircle size={14} /> Đã lưu</> :
               saveState === "error" ? <><span>✕</span> Lỗi</> :
               <><Save size={14} /> {saving ? "Đang lưu…" : "Lưu"}</>}
            </button>
            {saveState === "error" && saveError && (
              <p className="text-xs text-red-500 max-w-[160px] text-right leading-tight">{saveError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section tabs — scrollable on mobile */}
      <div className="flex gap-1 p-1 rounded-xl border overflow-x-auto scrollbar-none"
        style={{ borderColor: "rgba(244,182,194,0.25)", background: "rgba(255,255,255,0.02)" }}>
        {SECTIONS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setSection(id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              section === id ? "text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
            style={section === id ? { background: "#f4b6c2", color: "#333333" } : {}}>
            {icon} {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Đang tải…</div>
      ) : section === "hero" ? (
        <HeroTab imageUrl={heroImageUrl} setImageUrl={setHeroImageUrl} />
      ) : section === "about" ? (
        <AboutTab content={about} setContent={setAbout} />
      ) : section === "gallery" ? (
        <GalleryTab items={gallery} setItems={setGallery} />
      ) : section === "features" ? (
        <FeaturesTab items={features} setItems={setFeatures} />
      ) : section === "testimonials" ? (
        <TestimonialsTab items={testimonials} setItems={setTestimonials} />
      ) : section === "contact" ? (
        <ContactTab info={contact} setInfo={setContact} />
      ) : (
        <FooterTab info={footer} setInfo={setFooter} />
      )}
    </div>
  );
}
