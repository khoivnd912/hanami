"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useLang } from "@/lib/lang-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TestimonialItem {
  quote:      string;
  name:       string;
  location:   string;
  floral:     string;
  imageUrl?:  string;
  avatarUrl?: string;
}

// ─── Photo placeholder (gradient art) ────────────────────────────────────────

const PHOTO_GRADIENTS = [
  "linear-gradient(160deg, #fce4ed 0%, #f9a8d4 60%, #e879a8 100%)",
  "linear-gradient(160deg, #fdf2f8 0%, #fbcfe8 55%, #f9a8d4 100%)",
  "linear-gradient(160deg, #fff1f5 0%, #fecdd3 55%, #fda4af 100%)",
];

function PhotoBlock({ idx, imageUrl }: { idx: number; imageUrl?: string }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <div className="w-full h-full relative" style={{ background: PHOTO_GRADIENTS[idx % PHOTO_GRADIENTS.length] }}>
      <svg viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full">
        {[
          { cx: 28, cy: 45, s: 20, r: 10 },
          { cx: 70, cy: 78, s: 16, r: -25 },
          { cx: 50, cy: 115, s: 12, r: 30 },
          { cx: 15, cy: 100, s:  9, r: 50 },
          { cx: 82, cy: 28,  s: 11, r: -15 },
        ].map(({ cx, cy, s, r }, i) => (
          <g key={i} transform={`translate(${cx},${cy}) rotate(${r}) scale(${s / 40})`} opacity={0.22}>
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse key={a} cx="0" cy="-11" rx="4.5" ry="11"
                fill="white" transform={`rotate(${a})`} />
            ))}
            <circle cx="0" cy="0" r="4" fill="rgba(255,240,248,0.95)" />
          </g>
        ))}
        <ellipse cx="50" cy="70" rx="22" ry="30" fill="rgba(255,255,255,0.09)" />
      </svg>
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(255,220,235,0.18) 0%, rgba(0,0,0,0.06) 100%)" }} />
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initials = name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={name}
        className="w-11 h-11 rounded-full object-cover flex-shrink-0"
        style={{ border: "2px solid #f4b6c2" }} />
    );
  }

  return (
    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-semibold"
      style={{ background: "linear-gradient(135deg, #f4b6c2 0%, #e8859a 100%)", color: "#fff" }}>
      {initials}
    </div>
  );
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    quote:    "Em nhận được hoa rồi ạ. Siêu xinh luôn, đóng gói cẩn thận, hoa tươi rất lâu. Lần sau chị vẫn sẽ quay lại ạ :))",
    name:     "Bánh Bao",
    location: "Nghệ An",
    floral:   "Rose & Lily Collection",
  },
  {
    quote:    "Shop giao hàng đúng giờ, hoa đẹp hơn cả ảnh. Bạn ấy nhà mình thích lắm, cảm ơn shop nhiều nha!",
    name:     "Linh & Minh",
    location: "Hà Nội",
    floral:   "Cherry Blossom Set",
  },
  {
    quote:    "Đặt đèn hoa làm quà kỷ niệm, shop tư vấn rất nhiệt tình. Sản phẩm giữ được lâu, ánh sáng lung linh, nhìn là thích ngay.",
    name:     "Mai Anh & Tuấn",
    location: "TP. Hồ Chí Minh",
    floral:   "Bespoke Peony Lamp",
  },
  {
    quote:    "Mình mua tặng mẹ nhân ngày 8/3. Mẹ xúc động lắm, cứ khen hoài. Cảm ơn Hanami đã gói quà đẹp và chu đáo nhé.",
    name:     "Hương Trà",
    location: "Đà Nẵng",
    floral:   "Peony Collection",
  },
  {
    quote:    "Hoa đẹp lắm chị ơi, mình chụp ảnh ra rất thơ. Ai hỏi mình đều giới thiệu shop liền. Keep up the good work!",
    name:     "Khánh Linh",
    location: "Hải Phòng",
    floral:   "Cherry Blossom Set",
  },
  {
    quote:    "Đặt đèn hoa cho đám cưới, cả nhà ai cũng trầm trồ. Nhìn thật sự rất sang và lãng mạn. Cảm ơn team Hanami nhiều lắm!",
    name:     "Thảo & Hùng",
    location: "Cần Thơ",
    floral:   "Rose & Lily Collection",
  },
];

const PAGE_SIZE = 3;

// ─── Section client ───────────────────────────────────────────────────────────

export function TestimonialsSectionClient({ testimonials }: { testimonials: TestimonialItem[] | null }) {
  const { t } = useLang();
  const [page,    setPage]    = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const items      = (testimonials && testimonials.length > 0) ? testimonials : DEFAULT_TESTIMONIALS;
  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const current    = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handleNext = () => {
    setPage((p) => (p + 1) % totalPages);
    setAnimKey((k) => k + 1);
  };

  return (
    <section
      className="relative py-16 lg:py-32 px-6 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #FAE8EE 0%, #F6DCE4 100%)" }}
    >
      {/* Decorative orbs */}
      <div className="absolute -top-20 -right-20 w-[380px] h-[380px] rounded-full pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle, #f4b6c2 0%, transparent 70%)" }} />
      <div className="absolute -bottom-16 -left-16 w-[300px] h-[300px] rounded-full pointer-events-none opacity-25"
        style={{ background: "radial-gradient(circle, #e8859a 0%, transparent 70%)" }} />

      <div className="relative max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col items-center text-center mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-pink-300" />
            <span className="text-[11px] tracking-[0.18em] uppercase font-medium"
              style={{ color: "#B76E79" }}>
              {t("testimonials.label")}
            </span>
            <div className="h-px w-10 bg-pink-300" />
          </div>
          <h2 className="font-display leading-tight"
            style={{ fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 700 }}>
            <span style={{ color: "#1A1A1A" }}>{t("testimonials.heading")}</span>{" "}
            <em className="italic" style={{ color: "#C05A74" }}>
              {t("testimonials.headingEm")}
            </em>
          </h2>
        </div>

        {/* ── Cards ── */}
        <div key={animKey} className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-cards-in">
          {current.map(({ quote, name, location, floral, imageUrl, avatarUrl }, i) => {
            const absIdx = page * PAGE_SIZE + i;
            return (
              <div
                key={absIdx}
                className="flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.32)]"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(244,182,194,0.18)",
                }}
              >
                {/* ── Top: product photo ── */}
                <div className="relative w-full h-[280px] flex-shrink-0 overflow-hidden">
                  <PhotoBlock idx={absIdx} imageUrl={imageUrl} />
                  {/* Floral tag */}
                  <div
                    className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase font-semibold"
                    style={{
                      background: "#F4B6C2",
                      color: "#7A2E3F",
                    }}
                  >
                    {floral}
                  </div>
                </div>

                {/* ── Bottom: feedback content ── */}
                <div className="flex flex-col flex-1 px-6 py-5 justify-between gap-4">

                  {/* Quote */}
                  <p className="text-[15px] font-normal" style={{ color: "#444444", lineHeight: 1.75 }}>
                    <span className="font-display text-[26px] leading-none mr-1 align-top"
                      style={{ color: "#E8859A" }}>
                      &ldquo;
                    </span>
                    {quote}
                    <span className="font-display text-[26px] leading-none ml-1 align-bottom"
                      style={{ color: "#E8859A" }}>
                      &rdquo;
                    </span>
                  </p>

                  {/* Attribution */}
                  <div className="flex items-center gap-3">
                    <Avatar name={name} avatarUrl={avatarUrl} />
                    <div className="leading-none">
                      <p className="text-[14px] mb-1" style={{ color: "#222222", fontWeight: 600 }}>
                        {name}
                      </p>
                      <p className="text-[11px] tracking-[0.1em] uppercase font-medium" style={{ color: "#777777" }}>
                        {location}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* ── Navigation ── */}
        <div className="flex justify-center mt-10">
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-[12px] tracking-[0.12em] uppercase font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              background: "#f4b6c2",
              color: "#8C3A50",
              boxShadow: "0 4px 16px rgba(244,182,194,0.45)",
            }}
          >
            {t("testimonials.showMore")}
            <ChevronRight size={14} />
          </button>
        </div>

      </div>
    </section>
  );
}
