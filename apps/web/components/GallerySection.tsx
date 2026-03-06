"use client";

import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/lang-context";

const GALLERY_ITEMS = [
  {
    nameVi: "Hoa Hồng Đêm",
    nameEn: "Night Rose Lamp",
    tagKey: "tagSignature",
    span: "lg:col-span-2 lg:row-span-2",
    height: "h-[420px] lg:h-full",
    gradient: "radial-gradient(ellipse at 50% 35%, #fff5f8 0%, #fce4ec 20%, #f48fb1 45%, #c2185b 70%, #4a0d28 100%)",
    petals: 8,
  },
  {
    nameVi: "Hoa Anh Đào",
    nameEn: "Cherry Blossom Set",
    tagKey: "tagSeasonal",
    span: "",
    height: "h-[200px]",
    gradient: "linear-gradient(135deg, #fff9fb 0%, #fce4ec 40%, #f48fb1 75%, #e91e8c 100%)",
    petals: 5,
  },
  {
    nameVi: "Mẫu Đơn",
    nameEn: "Peony Glow",
    tagKey: "tagPopular",
    span: "",
    height: "h-[200px]",
    gradient: "radial-gradient(ellipse at 35% 35%, #fffde7 0%, #fce4ec 30%, #f06292 65%, #ad1457 100%)",
    petals: 6,
  },
  {
    nameVi: "Mộc Lan",
    nameEn: "Magnolia Dream",
    tagKey: "tagClassic",
    span: "",
    height: "h-[210px]",
    gradient: "linear-gradient(to bottom right, #fffde7 0%, #fce4ec 40%, #f9a8d4 75%, #f9a8d4 100%)",
    petals: 4,
  },
  {
    nameVi: "Thược Dược",
    nameEn: "Dahlia Evening",
    tagKey: "tagExclusive",
    span: "",
    height: "h-[210px]",
    gradient: "radial-gradient(circle at 50% 45%, #fbcfe8 0%, #e91e8c 40%, #880e4f 70%, #1c0914 100%)",
    petals: 7,
  },
  {
    nameVi: "Bộ Sưu Tập Cưới",
    nameEn: "Wedding Collection",
    tagKey: "tagBespoke",
    span: "lg:col-span-2",
    height: "h-[210px]",
    gradient: "linear-gradient(120deg, #fce4ec 0%, #f9a8d4 20%, #f9a8d4 45%, #c2185b 65%, #831843 82%, #3d0b22 100%)",
    petals: 9,
  },
];

/* Mini inline petal SVGs for the gradient cards */
function FlowerOverlay({ count }: { count: number }) {
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
  ].slice(0, count);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      {positions.map(({ x, y, s, o, r }, i) => (
        <g key={i} transform={`translate(${x},${y}) rotate(${r}) scale(${s / 40})`} opacity={o}>
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse
              key={angle}
              cx="0"
              cy="-12"
              rx="5"
              ry="12"
              fill="white"
              transform={`rotate(${angle})`}
            />
          ))}
          <circle cx="0" cy="0" r="4" fill="rgba(255,240,245,0.9)" />
        </g>
      ))}
    </svg>
  );
}

export function GallerySection() {
  const { lang, t } = useLang();

  return (
    <section id="gallery" className="py-24 lg:py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-pink-300" />
            <span className="text-[11px] tracking-[0.18em] uppercase text-pink-500 font-normal">{t("gallery.label")}</span>
            <div className="h-px w-10 bg-pink-300" />
          </div>
          <h2
            className="font-display font-light leading-tight mb-5"
            style={{ fontSize: "clamp(36px, 5vw, 60px)", color: "var(--hanami-deep)" }}
          >
            {t("gallery.heading")}{" "}
            <em className="italic" style={{ color: "var(--hanami-rose)" }}>
              {t("gallery.headingEm")}
            </em>
          </h2>
          <p className="text-sm font-normal leading-7 text-pink-900/70 max-w-[420px]">
            {t("gallery.desc")}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[200px_200px_210px] gap-4">
          {GALLERY_ITEMS.map(({ nameVi, nameEn, tagKey, span, height, gradient, petals }) => {
            const primaryName   = lang === "en" ? nameEn : nameVi;
            const secondaryName = lang === "en" ? nameVi : nameEn;
            const displayTag    = t(`gallery.${tagKey}`);

            return (
              <div
                key={nameVi}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer ${span} ${height}`}
                style={{ minHeight: height.replace("h-[", "").replace("]", "") }}
              >
                {/* Gradient background */}
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ background: gradient }}
                />

                {/* Floral SVG overlay */}
                <FlowerOverlay count={petals} />

                {/* Inner glow */}
                <div
                  className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-70"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 65%, rgba(255,235,240,0.45) 0%, transparent 55%)",
                  }}
                />

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(74,13,40,0.75) 0%, rgba(74,13,40,0.2) 50%, transparent 100%)",
                  }}
                />

                {/* Badge — top left */}
                <div className="absolute top-4 left-4">
                  <Badge
                    className="text-[10px] tracking-[0.1em] uppercase font-normal bg-white/20 text-white border-white/30 backdrop-blur-sm"
                    variant="outline"
                  >
                    {displayTag}
                  </Badge>
                </div>

                {/* Text — bottom */}
                <div className="absolute bottom-0 inset-x-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                  <p
                    className="font-display text-xl text-white leading-none mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ transitionDelay: "50ms" }}
                  >
                    {primaryName}
                  </p>
                  <p
                    className="text-[10px] tracking-[0.12em] uppercase text-white/85 font-normal opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ transitionDelay: "100ms" }}
                  >
                    {secondaryName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-12">
          <a
            href="#contact"
            className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full border border-pink-300 text-pink-600 text-xs tracking-[0.12em] uppercase font-medium hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all duration-300"
          >
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
