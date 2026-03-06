"use client";

import Link from "next/link";
import { CalendarHeart, ChevronRight } from "lucide-react";
import { PRODUCTS, formatVND, TAG_STYLES } from "@/lib/products";
import { useLang } from "@/lib/lang-context";

// ─── SVG flower overlay ──────────────────────────────────────────────────────

function FlowerOverlay({ count }: { count: number }) {
  const pts = [
    { x: 18, y: 20, s: 26, r: 15 }, { x: 72, y: 12, s: 18, r: -20 },
    { x: 50, y: 60, s: 30, r: 30 }, { x:  8, y: 60, s: 16, r: 45 },
    { x: 82, y: 52, s: 22, r: -10 }, { x: 38, y: 82, s: 14, r: 60 },
    { x: 28, y: 38, s: 20, r: -35 }, { x: 62, y: 30, s: 24, r: 25 },
  ].slice(0, count);

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

function ProductCard({ product }: { product: (typeof PRODUCTS)[number] }) {
  const { lang, t } = useLang();
  const primaryName   = lang === "en" ? product.nameEn : product.nameVi;
  const secondaryName = lang === "en" ? product.nameVi : product.nameEn;

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-pink-100 bg-white shadow-sm hover:shadow-[0_8px_40px_rgba(236,72,153,0.14)] hover:-translate-y-1 transition-all duration-400"
    >
      {/* Gradient art image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ background: product.gradient }}
        />
        <FlowerOverlay count={product.petals} />
        {/* Lamp glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 65%, rgba(255,235,240,0.38) 0%, transparent 55%)" }} />
        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center"
          style={{ background: "rgba(22,7,18,0.4)" }}>
          <span className="flex items-center gap-1.5 text-white text-[10px] tracking-[0.3em] uppercase font-light border border-white/50 px-5 py-2.5 rounded-full">
            {t("shop.viewDetails")} <ChevronRight size={11} />
          </span>
        </div>
        {/* Tag badge */}
        {product.tag && (
          <div className="absolute top-3 left-3">
            <span className={`text-[9px] tracking-[0.2em] uppercase font-light px-2.5 py-1 rounded-full border ${TAG_STYLES[product.tag]}`}>
              {t(`tags.${product.tag}`)}
            </span>
          </div>
        )}
        {product.originalPrice && (
          <div className="absolute top-3 right-3 bg-rose-500 text-white text-[9px] tracking-wide px-2 py-1 rounded-full font-light">
            Sale
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-1.5">
        <p className="text-[9px] tracking-[0.35em] uppercase text-pink-400/55 font-light">{secondaryName}</p>
        <h3 className="font-display text-xl leading-tight" style={{ color: "var(--hanami-deep)" }}>
          {primaryName}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-medium" style={{ color: "var(--hanami-rose)" }}>
            {formatVND(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-pink-300 line-through font-light">
              {formatVND(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function ShopSection() {
  const { t } = useLang();
  const featured = PRODUCTS.slice(0, 4);

  return (
    <section id="shop" className="relative py-24 lg:py-32 px-6 overflow-hidden"
      style={{ background: "var(--hanami-ivory)" }}>
      {/* Background accents */}
      <div className="absolute -top-24 right-0 w-[480px] h-[480px] rounded-full pointer-events-none opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #f9a8d4 0%, transparent 70%)" }} />
      <div className="absolute -bottom-16 -left-16 w-[380px] h-[380px] rounded-full pointer-events-none opacity-[0.03]"
        style={{ background: "radial-gradient(circle, #db2777 0%, transparent 70%)" }} />

      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-pink-300" />
              <span className="text-[10px] tracking-[0.4em] uppercase text-pink-400 font-light">{t("shop.label")}</span>
            </div>
            <h2
              className="font-display font-light leading-tight"
              style={{ fontSize: "clamp(32px, 4.5vw, 54px)", color: "var(--hanami-deep)" }}
            >
              {t("shop.featured")}{" "}
              <em className="italic" style={{ color: "var(--hanami-rose)" }}>{t("shop.lanterns")}</em>
            </h2>
          </div>

          <Link
            href="/shop"
            className="self-start sm:self-auto flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase font-light text-pink-500 hover:text-rose-700 transition-colors duration-300"
          >
            {t("shop.viewAll")}
            <ChevronRight size={13} />
          </Link>
        </div>

        {/* Product grid — 4 featured items */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div
          className="mt-14 rounded-3xl px-8 py-9 flex flex-col md:flex-row items-center justify-between gap-6 border border-pink-200"
          style={{ background: "linear-gradient(135deg, rgba(252,231,243,0.6) 0%, rgba(253,245,240,0.8) 100%)" }}
        >
          <div>
            <p className="font-display text-2xl font-light mb-1" style={{ color: "var(--hanami-deep)" }}>
              {t("shop.cantFind")}
            </p>
            <p className="text-sm font-light text-rose-900/50">
              {t("shop.customVision")}
            </p>
          </div>
          <a
            href="#contact"
            className="flex items-center gap-2.5 px-8 py-4 rounded-full text-[11px] tracking-[0.28em] uppercase font-light whitespace-nowrap border border-rose-700 text-rose-800 hover:bg-rose-900 hover:text-white hover:border-rose-900 transition-all duration-300"
          >
            <CalendarHeart size={14} />
            {t("shop.bookConsultation")}
          </a>
        </div>
      </div>
    </section>
  );
}
