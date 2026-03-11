"use client";

import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/lang-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GalleryItem {
  nameVi:    string;
  nameEn:    string;
  tagKey:    string;
  gradient:  string;
  imageUrl?: string;
}

const DEFAULT_ITEMS: GalleryItem[] = [
  {
    nameVi: "Hoa Anh Đào", nameEn: "Cherry Blossom Set", tagKey: "tagSeasonal",
    gradient: "linear-gradient(160deg, #fff6f8 0%, #fce4ed 35%, #f9a8d4 70%, #d96b82 100%)",
  },
  {
    nameVi: "Hoa Hồng Đêm", nameEn: "Night Rose Lamp", tagKey: "tagSignature",
    gradient: "radial-gradient(ellipse at 50% 38%, #fff5f7 0%, #fce4ed 18%, #f19cad 42%, #c05070 68%, #5c1a30 100%)",
  },
  {
    nameVi: "Mẫu Đơn", nameEn: "Peony Glow", tagKey: "tagPopular",
    gradient: "radial-gradient(ellipse at 40% 35%, #fffdf5 0%, #fae8ee 28%, #e8859a 62%, #8a3050 100%)",
  },
  {
    nameVi: "Mộc Lan", nameEn: "Magnolia Dream", tagKey: "tagClassic",
    gradient: "linear-gradient(145deg, #fffdf5 0%, #fae8ee 38%, #f4b6c2 72%, #f19cad 100%)",
  },
  {
    nameVi: "Thược Dược", nameEn: "Dahlia Evening", tagKey: "tagExclusive",
    gradient: "radial-gradient(circle at 48% 42%, #f9d5e2 0%, #d96b82 38%, #8a3050 68%, #380d1c 100%)",
  },
  {
    nameVi: "Bộ Sưu Tập Cưới", nameEn: "Wedding Collection", tagKey: "tagBespoke",
    gradient: "linear-gradient(155deg, #fae8ee 0%, #f4b6c2 22%, #f19cad 48%, #c05070 68%, #8a3050 85%, #2e120e 100%)",
  },
];

// ─── Flower overlay SVG ───────────────────────────────────────────────────────

function FlowerOverlay() {
  const positions = [
    { x: 20, y: 25, s: 24, o: 0.18, r: 15 },
    { x: 75, y: 15, s: 18, o: 0.14, r: -20 },
    { x: 55, y: 70, s: 28, o: 0.20, r: 30 },
    { x: 10, y: 65, s: 16, o: 0.12, r: 45 },
    { x: 85, y: 55, s: 22, o: 0.16, r: -10 },
    { x: 40, y: 85, s: 14, o: 0.10, r: 60 },
    { x: 30, y: 40, s: 20, o: 0.13, r: -35 },
    { x: 65, y: 35, s: 26, o: 0.15, r: 25 },
    { x: 90, y: 80, s: 12, o: 0.10, r: 50 },
  ];

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none">
      {positions.map(({ x, y, s, o, r }, i) => (
        <g key={i} transform={`translate(${x},${y}) rotate(${r}) scale(${s / 40})`} opacity={o}>
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse key={angle} cx="0" cy="-12" rx="5" ry="12" fill="white" transform={`rotate(${angle})`} />
          ))}
          <circle cx="0" cy="0" r="4" fill="rgba(255,240,245,0.9)" />
        </g>
      ))}
    </svg>
  );
}

// ─── Single card ──────────────────────────────────────────────────────────────

function GalleryCard({
  item, name, secondaryName, tag, isCenter,
}: {
  item: GalleryItem;
  name: string;
  secondaryName: string;
  tag: string;
  isCenter: boolean;
}) {
  return (
    <div
      className={`group relative w-full h-full overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-1 ${isCenter ? "rounded-3xl" : "rounded-2xl"}`}
      style={{
        boxShadow: isCenter
          ? "0 24px 64px rgba(80,10,40,0.20), 0 4px 20px rgba(0,0,0,0.08)"
          : "0 6px 24px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      {/* Background */}
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt={item.nameVi}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ background: item.gradient }} />
      )}
      {!item.imageUrl && <FlowerOverlay />}

      {/* Badge */}
      <div className="absolute top-3 left-3 z-10">
        <Badge className="text-[10px] tracking-[0.1em] uppercase font-normal bg-white/20 text-white border-white/25 backdrop-blur-sm" variant="outline">
          {tag}
        </Badge>
      </div>

      {/* Center: always-visible name */}
      {isCenter && (
        <div className="absolute bottom-0 inset-x-0 px-6 py-7 z-10"
          style={{ background: "linear-gradient(to top, rgba(50,8,25,0.85) 0%, rgba(50,8,25,0.35) 55%, transparent 100%)" }}>
          <p className="font-display text-3xl text-white font-semibold leading-tight mb-1.5">{name}</p>
          <p className="text-[11px] tracking-[0.18em] uppercase text-white/65 font-normal">{secondaryName}</p>
        </div>
      )}

      {/* Side cards: hover-reveal name */}
      {!isCenter && (
        <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(to top, rgba(60,10,30,0.80) 0%, rgba(60,10,30,0.15) 50%, transparent 100%)" }} />
          <div className="absolute bottom-0 inset-x-0 p-4 translate-y-1.5 group-hover:translate-y-0 transition-transform duration-300">
            <p className="font-display text-[17px] text-white leading-snug mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ transitionDelay: "40ms" }}>
              {name}
            </p>
            <p className="text-[10px] tracking-[0.14em] uppercase text-white/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ transitionDelay: "80ms" }}>
              {secondaryName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section client ───────────────────────────────────────────────────────────

export function GallerySectionClient({ items }: { items: GalleryItem[] | null }) {
  const { lang, t } = useLang();
  const resolved = DEFAULT_ITEMS.map((d, i) => items?.[i] ?? d);

  function names(item: GalleryItem) {
    return {
      primary:   lang === "en" ? item.nameEn : item.nameVi,
      secondary: lang === "en" ? item.nameVi : item.nameEn,
    };
  }

  return (
    <section id="gallery" className="py-24 lg:py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-pink-300" />
            <span className="text-[11px] tracking-[0.18em] uppercase font-medium" style={{ color: "#d96b82" }}>
              {t("gallery.label")}
            </span>
            <div className="h-px w-10 bg-pink-300" />
          </div>
          <h2 className="font-display font-semibold leading-tight mb-5"
            style={{ fontSize: "clamp(36px, 5vw, 60px)", color: "#1a1a1a" }}>
            {t("gallery.heading")}{" "}
            <em className="italic" style={{ color: "var(--hanami-rose)" }}>{t("gallery.headingEm")}</em>
          </h2>
          <p className="text-sm font-normal leading-7 max-w-[420px]" style={{ color: "#555" }}>
            {t("gallery.desc")}
          </p>
        </div>

        {/* ── Mobile layout ──
              [0]   [2]       ← 2 col portrait
              [1 CENTER]      ← full width, tall hero
              [3]   [4]       ← 2 col portrait
              [5 wide]        ← full width landscape
        ── */}
        <div className="lg:hidden space-y-3">

          {/* Row 1: idx 0 + idx 2 */}
          <div className="grid grid-cols-2 gap-3">
            {[resolved[0], resolved[2]].map((item, i) => {
              const { primary, secondary } = names(item);
              return (
                <div key={i} className="aspect-[3/4]">
                  <GalleryCard item={item} name={primary} secondaryName={secondary}
                    tag={t(`gallery.${item.tagKey}`)} isCenter={false} />
                </div>
              );
            })}
          </div>

          {/* Row 2: idx 1 CENTER — full width hero */}
          <div className="aspect-[3/4] sm:aspect-[4/3]">
            <GalleryCard item={resolved[1]}
              name={names(resolved[1]).primary}
              secondaryName={names(resolved[1]).secondary}
              tag={t(`gallery.${resolved[1].tagKey}`)}
              isCenter={true} />
          </div>

          {/* Row 3: idx 3 + idx 4 */}
          <div className="grid grid-cols-2 gap-3">
            {[resolved[3], resolved[4]].map((item, i) => {
              const { primary, secondary } = names(item);
              return (
                <div key={i} className="aspect-[3/4]">
                  <GalleryCard item={item} name={primary} secondaryName={secondary}
                    tag={t(`gallery.${item.tagKey}`)} isCenter={false} />
                </div>
              );
            })}
          </div>

          {/* Row 4: idx 5 — wide strip */}
          <div className="aspect-[16/7]">
            <GalleryCard item={resolved[5]}
              name={names(resolved[5]).primary}
              secondaryName={names(resolved[5]).secondary}
              tag={t(`gallery.${resolved[5].tagKey}`)}
              isCenter={false} />
          </div>

        </div>

        {/* ── Desktop: flex 3-column layout ── */}
        <div className="hidden lg:flex gap-5 h-[680px]">

          {/* Left column: 2 portrait cards stacked */}
          <div className="flex flex-col gap-5 flex-1">
            {[resolved[0], resolved[3]].map((item, i) => {
              const { primary, secondary } = names(item);
              return (
                <div key={i} className="flex-1 min-h-0">
                  <GalleryCard item={item} name={primary} secondaryName={secondary}
                    tag={t(`gallery.${item.tagKey}`)} isCenter={false} />
                </div>
              );
            })}
          </div>

          {/* Center column: 1 large portrait */}
          <div className="flex-none w-[34%]">
            <GalleryCard item={resolved[1]}
              name={names(resolved[1]).primary}
              secondaryName={names(resolved[1]).secondary}
              tag={t(`gallery.${resolved[1].tagKey}`)}
              isCenter={true} />
          </div>

          {/* Right column: 2 portrait cards stacked */}
          <div className="flex flex-col gap-5 flex-1">
            {[resolved[2], resolved[4]].map((item, i) => {
              const { primary, secondary } = names(item);
              return (
                <div key={i} className="flex-1 min-h-0">
                  <GalleryCard item={item} name={primary} secondaryName={secondary}
                    tag={t(`gallery.${item.tagKey}`)} isCenter={false} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop: 6th image — bottom strip */}
        <div className="hidden lg:block mt-5 h-[180px]">
          <GalleryCard item={resolved[5]}
            name={names(resolved[5]).primary}
            secondaryName={names(resolved[5]).secondary}
            tag={t(`gallery.${resolved[5].tagKey}`)}
            isCenter={false} />
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-12">
          <a href="#contact"
            className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full border border-[#f4b6c2] text-[#d96b82] text-xs tracking-[0.12em] uppercase font-semibold hover:bg-[#f4b6c2] hover:text-[#333] transition-all duration-300">
            {t("gallery.cta")}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:translate-x-1 transition-transform duration-300">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
}
