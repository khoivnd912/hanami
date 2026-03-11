"use client";

import Link from "next/link";
import { CalendarHeart, ChevronRight } from "lucide-react";
import { formatVND, TAG_STYLES, type ApiProduct } from "@/lib/products";
import { useLang } from "@/lib/lang-context";

// ─── SVG flower overlay ──────────────────────────────────────────────────────

function FlowerOverlay() {
  const pts = [
    { x: 18, y: 20, s: 26, r: 15 }, { x: 72, y: 12, s: 18, r: -20 },
    { x: 50, y: 60, s: 30, r: 30 }, { x:  8, y: 60, s: 16, r: 45 },
    { x: 82, y: 52, s: 22, r: -10 }, { x: 38, y: 82, s: 14, r: 60 },
    { x: 28, y: 38, s: 20, r: -35 }, { x: 62, y: 30, s: 24, r: 25 },
    { x: 88, y: 78, s: 12, r: 50  }, { x: 55, y: 18, s: 16, r: -15 },
    { x: 15, y: 74, s: 18, r: 40  }, { x: 75, y: 74, s: 14, r: 20  },
  ];

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none">
      {pts.map(({ x, y, s, r }, i) => (
        <g key={i} transform={`translate(${x},${y}) rotate(${r}) scale(${s / 40})`} opacity={0.17}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="0" cy="-11" rx="4.5" ry="11" fill="white" transform={`rotate(${a})`} />
          ))}
          <circle cx="0" cy="0" r="4" fill="rgba(255,240,245,0.9)" />
        </g>
      ))}
    </svg>
  );
}

// ─── Product card ────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: ApiProduct }) {
  const { lang, t } = useLang();
  const primaryName   = lang === "en" ? product.nameEn : product.nameVi;
  const secondaryName = lang === "en" ? product.nameVi : product.nameEn;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-pink-100 bg-white shadow-sm hover:shadow-[0_8px_40px_rgba(244,182,194,0.15)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image / Gradient art */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.nameVi}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ background: product.gradient ?? "linear-gradient(135deg,#fae8ee,#f4b6c2)" }}
          />
        )}
        {!product.imageUrl && <FlowerOverlay />}
        {/* Lamp glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 65%, rgba(255,235,240,0.38) 0%, transparent 55%)" }} />
        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          style={{ background: "rgba(22,7,18,0.4)" }}>
          <span className="text-white text-[10px] tracking-[0.15em] uppercase font-normal border border-white/50 px-5 py-2.5 rounded-full">
            {t("shop.viewDetails")}
          </span>
        </div>
        {/* Tag badge */}
        {product.tag && TAG_STYLES[product.tag] && (
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] tracking-[0.1em] uppercase font-normal px-2.5 py-1 rounded-full border ${TAG_STYLES[product.tag]}`}>
              {t(`tags.${product.tag}`)}
            </span>
          </div>
        )}
        {product.originalPrice && (
          <div className="absolute top-3 right-3 bg-rose-500 text-white text-[9px] tracking-wide px-2 py-1 rounded-full font-medium">
            Sale
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-1">
        <p className="text-[10px] tracking-[0.12em] uppercase font-normal" style={{ color: "#aaa" }}>{secondaryName}</p>
        <h3 className="font-display text-xl font-semibold leading-tight" style={{ color: "#1a1a1a" }}>
          {primaryName}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-semibold" style={{ color: "var(--hanami-rose)" }}>
            {formatVND(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs line-through font-normal text-gray-400">
              {formatVND(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Section client ───────────────────────────────────────────────────────────

export function ShopSectionClient({ products }: { products: ApiProduct[] }) {
  const { t } = useLang();

  return (
    <section id="shop" className="relative py-24 lg:py-32 px-6 overflow-hidden"
      style={{ background: "var(--hanami-ivory)" }}>
      {/* Background accents */}
      <div className="absolute -top-24 right-0 w-[480px] h-[480px] rounded-full pointer-events-none opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #f4b6c2 0%, transparent 70%)" }} />
      <div className="absolute -bottom-16 -left-16 w-[380px] h-[380px] rounded-full pointer-events-none opacity-[0.03]"
        style={{ background: "radial-gradient(circle, #d96b82 0%, transparent 70%)" }} />

      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-pink-300" />
              <span className="text-[10px] tracking-[0.4em] uppercase font-medium" style={{ color: "#d96b82" }}>{t("shop.label")}</span>
            </div>
            <h2
              className="font-display font-semibold leading-tight"
              style={{ fontSize: "clamp(32px, 4.5vw, 54px)", color: "#1a1a1a" }}
            >
              {t("shop.featured")}{" "}
              <em className="italic" style={{ color: "var(--hanami-rose)" }}>{t("shop.lanterns")}</em>
            </h2>
          </div>

          <Link
            href="/shop"
            className="self-start sm:self-auto flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase font-semibold hover:opacity-70 transition-opacity duration-300"
            style={{ color: "#d96b82" }}
          >
            {t("shop.viewAll")}
            <ChevronRight size={13} />
          </Link>
        </div>

        {/* Product grid — 4 featured items */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div
          className="mt-14 rounded-3xl px-5 py-6 sm:px-8 sm:py-9 flex flex-col md:flex-row items-center justify-between gap-6 border border-pink-200 text-center md:text-left"
          style={{ background: "linear-gradient(135deg, rgba(252,231,243,0.6) 0%, rgba(253,245,240,0.8) 100%)" }}
        >
          <div>
            <p className="font-display text-2xl font-semibold mb-1" style={{ color: "#1a1a1a" }}>
              {t("shop.cantFind")}
            </p>
            <p className="text-sm font-normal" style={{ color: "#666" }}>
              {t("shop.customVision")}
            </p>
          </div>
          <a
            href="#contact"
            className="flex items-center gap-2.5 px-8 py-4 rounded-full text-[11px] tracking-[0.28em] uppercase font-semibold whitespace-nowrap border border-[#f4b6c2] text-[#d96b82] hover:bg-[#f4b6c2] hover:text-[#333] hover:border-[#f4b6c2] transition-all duration-300"
          >
            <CalendarHeart size={14} />
            {t("shop.bookConsultation")}
          </a>
        </div>
      </div>
    </section>
  );
}
