"use client";

import { Sparkles, Flower2, Heart } from "lucide-react";
import { useLang } from "@/lib/lang-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeatureItem {
  titleVi: string;
  titleEn: string;
  descVi:  string;
  descEn:  string;
}

// ─── Fixed per-position config (icon + accent — not editable) ─────────────────

const FIXED = [
  { icon: Sparkles, accent: "#f4b6c2" },
  { icon: Flower2,  accent: "#d96b82" },
  { icon: Heart,    accent: "#8a3050" },
];

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    titleVi: "Thủ Công Tinh Tế",
    titleEn: "Handcrafted with Care",
    descVi:  "Mỗi chiếc đèn được lắp ráp thủ công bởi các nghệ nhân, đảm bảo mỗi tác phẩm mang vẻ hoàn hảo riêng của mình.",
    descEn:  "Every lamp is individually hand-assembled by our artisans, ensuring each piece carries its own quiet perfection.",
  },
  {
    titleVi: "Thiết Kế Hoa Tùy Chỉnh",
    titleEn: "Custom Floral Design",
    descVi:  "Chọn hoa, màu sắc và độ ấm ánh sáng theo ý bạn. Chúng tôi cộng tác với bạn để phản ánh tinh thần đám cưới.",
    descEn:  "Choose your flowers, colors, and light warmth. We collaborate with you to reflect the spirit of your wedding.",
  },
  {
    titleVi: "Kỷ Niệm Vĩnh Cửu",
    titleEn: "Timeless Keepsake",
    descVi:  "Được bảo quản để tồn tại mãi mãi, đèn của chúng tôi không chỉ là vật trang trí — mà là ký ức rạng ngời bạn giữ mãi.",
    descEn:  "Preserved to last a lifetime, our lamps are more than decor — they are luminous memories you keep forever.",
  },
];

// ─── Section client ───────────────────────────────────────────────────────────

export function FeaturesSectionClient({ features }: { features: FeatureItem[] | null }) {
  const { lang, t } = useLang();

  const items = FIXED.map((fixed, i) => {
    const data = features?.[i] ?? DEFAULT_FEATURES[i];
    return {
      ...fixed,
      title: lang === "en" ? data.titleEn : data.titleVi,
      desc:  lang === "en" ? data.descEn  : data.descVi,
    };
  });

  return (
    <section className="relative py-20 px-6" style={{ background: "var(--hanami-pale)" }}>
      {/* Subtle grain */}
      <div
        className="absolute inset-0 opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Section label */}
        <div className="flex items-center justify-center gap-3 mb-14">
          <div className="h-px w-10 bg-pink-300" />
          <span className="text-[11px] tracking-[0.18em] uppercase font-medium" style={{ color: "#d96b82" }}>
            {t("features.label")}
          </span>
          <div className="h-px w-10 bg-pink-300" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-pink-200/40 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(244,182,194,0.07)]">
          {items.map(({ icon: Icon, title, desc, accent }) => (
            <div
              key={title}
              className="group relative bg-white/70 backdrop-blur-sm px-7 py-9 md:px-10 md:py-12 flex flex-col items-center text-center hover:bg-white transition-colors duration-300"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `radial-gradient(circle, ${accent}18 0%, ${accent}08 100%)`,
                  border: `1px solid ${accent}28`,
                }}
              >
                <Icon size={22} style={{ color: accent }} strokeWidth={1.5} />
              </div>

              <h3 className="font-display text-2xl font-semibold mb-3 leading-snug" style={{ color: "#1a1a1a" }}>
                {title}
              </h3>
              <p className="text-sm leading-7 font-normal max-w-[260px]" style={{ color: "#555" }}>
                {desc}
              </p>

              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-16 transition-all duration-500 rounded-full"
                style={{ background: accent }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
