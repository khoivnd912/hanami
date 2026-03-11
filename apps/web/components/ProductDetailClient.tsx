"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus, Minus, ShoppingCart,
  Check, CalendarHeart, Sparkles, ChevronRight,
} from "lucide-react";
import {
  type ApiProductDetail, type ApiProduct, type CartProduct,
  formatVND, TAG_STYLES,
} from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { useLang } from "@/lib/lang-context";

/** Normalise legacy lowercase tags from old seeded records. */
function normalizeTag(tag?: string): string | undefined {
  if (!tag) return undefined;
  if (TAG_STYLES[tag]) return tag;
  const titled = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
  return TAG_STYLES[titled] ? titled : undefined;
}

// ─── Shared SVG helpers ──────────────────────────────────────────────────────

function FlowerOverlay({ opacity = 0.18 }: { opacity?: number }) {
  const pts = [
    { x: 18, y: 20, s: 26, r: 15 }, { x: 72, y: 12, s: 18, r: -20 },
    { x: 50, y: 60, s: 30, r: 30 }, { x:  8, y: 60, s: 16, r: 45 },
    { x: 82, y: 52, s: 22, r: -10 }, { x: 38, y: 82, s: 14, r: 60 },
    { x: 28, y: 38, s: 20, r: -35 }, { x: 62, y: 30, s: 24, r: 25 },
    { x: 88, y: 78, s: 12, r: 50 }, { x: 55, y: 18, s: 16, r: -15 },
    { x: 15, y: 74, s: 18, r: 40 }, { x: 75, y: 74, s: 14, r: 20 },
  ];

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none">
      {pts.map(({ x, y, s, r }, i) => (
        <g key={i} transform={`translate(${x},${y}) rotate(${r}) scale(${s / 40})`} opacity={opacity}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="0" cy="-11" rx="4.5" ry="11" fill="white" transform={`rotate(${a})`} />
          ))}
          <circle cx="0" cy="0" r="4" fill="rgba(255,240,245,0.9)" />
        </g>
      ))}
    </svg>
  );
}

// ─── Related product card ────────────────────────────────────────────────────

function RelatedCard({ product }: { product: ApiProduct }) {
  const { lang, t } = useLang();
  const primaryName   = lang === "en" ? product.nameEn : product.nameVi;
  const secondaryName = lang === "en" ? product.nameVi : product.nameEn;
  const tag           = normalizeTag(product.tag);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-pink-100 bg-white hover:shadow-[0_8px_32px_rgba(244,182,194,0.15)] hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.nameVi}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-700"
            style={{ background: product.gradient ?? "linear-gradient(135deg,#fae8ee,#f4b6c2)" }} />
        )}
        {!product.imageUrl && <FlowerOverlay />}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 65%, rgba(255,235,240,0.35) 0%, transparent 55%)" }} />
        {tag && (
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] tracking-[0.1em] uppercase font-normal px-2.5 py-1 rounded-full border ${TAG_STYLES[tag]}`}>
              {t(`tags.${tag}`)}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[10px] tracking-[0.1em] uppercase font-normal mb-1" style={{ color: "#aaa" }}>{secondaryName}</p>
        <p className="font-display text-lg font-semibold leading-tight mb-2" style={{ color: "#1a1a1a" }}>{primaryName}</p>
        <p className="text-sm font-semibold" style={{ color: "var(--hanami-rose)" }}>{formatVND(product.price)}</p>
      </div>
    </Link>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface Props {
  product: ApiProductDetail;
  related: ApiProduct[];
}

export function ProductDetailClient({ product, related }: Props) {
  const [qty,   setQty]   = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart, setCartOpen, cartCount } = useCart();
  const { lang, t } = useLang();

  const primaryName   = lang === "en" ? product.nameEn : product.nameVi;
  const secondaryName = lang === "en" ? product.nameVi : product.nameEn;
  const description   = (lang === "en" ? product.descriptionEn : product.descriptionVi) ?? [];
  const tag           = normalizeTag(product.tag);

  const cartProduct: CartProduct = {
    id:       product._id,
    nameVi:   product.nameVi,
    nameEn:   product.nameEn,
    price:    product.price,
    gradient: product.gradient,
    imageUrl: product.imageUrl,
  };

  const handleAdd = () => {
    addToCart(cartProduct, qty);
    setAdded(true);
    setCartOpen(true);
    setTimeout(() => setAdded(false), 2400);
  };

  const specs     = product.specs ?? [];
  const specPills = specs.slice(3, 5).filter((s) => s?.value);

  return (
    <div className="min-h-screen" style={{ background: "var(--hanami-ivory)" }}>

      {/* ── Page header strip ── */}
      <div
        className="relative pt-28 pb-6 px-6 border-b"
        style={{ background: "white", borderColor: "var(--hanami-blush)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-normal text-gray-400 min-w-0">
            <Link href="/" className="hover:text-pink-500 transition-colors duration-200 shrink-0">
              {t("productDetail.home")}
            </Link>
            <ChevronRight size={12} className="text-gray-300 shrink-0" />
            <Link href="/shop" className="hover:text-pink-500 transition-colors duration-200 shrink-0">
              {t("productDetail.shop")}
            </Link>
            <ChevronRight size={12} className="text-gray-300 shrink-0" />
            <span className="font-medium text-gray-700 truncate">{primaryName}</span>
          </nav>

          {/* Cart badge */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full border border-pink-200 text-gray-700 text-xs font-medium hover:bg-pink-50 hover:border-pink-300 transition-all duration-200 shrink-0"
            style={{ background: "white" }}
          >
            <ShoppingCart size={14} className="text-pink-500" />
            {t("productDetail.cart")}
            {cartCount > 0 && (
              <span
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-[9px] flex items-center justify-center font-semibold"
                style={{ background: "var(--hanami-rose)" }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Detail layout ── */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* ── Left: Product Image ── */}
          <div className="relative lg:sticky lg:top-28">
            {/* Outer frame for premium depth */}
            <div className="relative p-3 rounded-[28px] bg-white shadow-[0_32px_80px_rgba(107,33,71,0.18)]">
              <div
                className="relative w-full rounded-2xl overflow-hidden"
                style={{ aspectRatio: "4/5" }}
              >
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.nameVi}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0"
                    style={{ background: product.gradient ?? "linear-gradient(135deg,#fae8ee,#f4b6c2)" }} />
                )}
                {!product.imageUrl && <FlowerOverlay opacity={0.22} />}
                {/* Ambient glow */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(255,235,240,0.55) 0%, transparent 58%)" }} />

                {/* Bottom name overlay */}
                <div
                  className="absolute bottom-0 inset-x-0 px-8 py-8"
                  style={{ background: "linear-gradient(to top, rgba(22,7,18,0.78) 0%, rgba(22,7,18,0.25) 60%, transparent 100%)" }}
                >
                  <p className="text-[10px] tracking-[0.15em] uppercase text-white/60 font-normal mb-1.5">
                    {secondaryName}
                  </p>
                  <p className="font-display text-3xl text-white font-light leading-tight">
                    {primaryName}
                  </p>
                </div>

                {/* Tag */}
                {tag && (
                  <div className="absolute top-5 left-5">
                    <span className={`text-[10px] tracking-[0.1em] uppercase font-semibold px-3 py-1.5 rounded-full border ${TAG_STYLES[tag]}`}>
                      {t(`tags.${tag}`)}
                    </span>
                  </div>
                )}

                {/* Height chip */}
                {specs[0]?.value && (
                  <div className="absolute top-5 right-5">
                    <div
                      className="px-3 py-1.5 rounded-xl text-[11px] font-medium text-white backdrop-blur-md"
                      style={{ background: "rgba(22,7,18,0.50)", border: "1px solid rgba(255,255,255,0.18)" }}
                    >
                      {specs[0].value} {t("productDetail.tall")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Spec pills row */}
            {specPills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {specPills.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium text-pink-700 border border-pink-200 bg-white shadow-sm"
                  >
                    <Sparkles size={10} className="text-pink-400" />
                    {s.value}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info ── */}
          <div className="flex flex-col">

            {/* ─ 1. Name & Price block ─ */}
            <div className="mb-8 pb-8 border-b border-pink-100">
              <p className="text-xs tracking-[0.12em] uppercase text-gray-400 font-normal mb-3">
                {secondaryName}
              </p>
              <h1
                className="font-display font-semibold leading-[1.15] mb-6"
                style={{ fontSize: "clamp(34px, 4.5vw, 56px)", color: "#1a1a1a" }}
              >
                {primaryName}
              </h1>

              {/* Price row */}
              <div className="flex items-baseline gap-4">
                <span
                  className="font-display font-semibold leading-none"
                  style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "var(--hanami-rose)" }}
                >
                  {formatVND(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through font-normal">
                      {formatVND(product.originalPrice)}
                    </span>
                    <span className="text-xs font-semibold text-white px-2.5 py-1 rounded-full"
                      style={{ background: "var(--hanami-rose)" }}>
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* ─ 2. Description ─ */}
            {description.length > 0 && (
              <div className="mb-8 rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 rounded-full" style={{ background: "var(--hanami-rose)" }} />
                  <span className="text-[10px] tracking-[0.14em] uppercase text-gray-500 font-semibold">
                    {t("productDetail.aboutThisPiece")}
                  </span>
                </div>
                <div className="space-y-3.5">
                  {description.map((para, i) => (
                    <p key={i} className="text-sm leading-[1.85] font-normal text-gray-600">{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* ─ 3. Specs table ─ */}
            {specs.length > 0 && (
              <div className="mb-8 rounded-2xl border border-pink-100 bg-white overflow-hidden shadow-sm">
                {specs.filter((s) => s?.label).map(({ label, value }, i) => (
                  <div
                    key={label}
                    className={`grid grid-cols-[120px_1fr] gap-4 px-6 py-3.5 ${
                      i < specs.length - 1 ? "border-b border-gray-50" : ""
                    } ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                  >
                    <span className="text-[11px] tracking-[0.08em] uppercase text-gray-400 font-semibold self-center">
                      {t(`specs.${label}`)}
                    </span>
                    <span className="text-sm font-normal text-gray-800 leading-5 self-center">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ─ 4. Quantity ─ */}
            <div className="flex items-center gap-5 mb-7">
              <span className="text-xs tracking-[0.1em] uppercase text-gray-500 font-semibold">
                {t("productDetail.quantity")}
              </span>
              <div className="flex items-center rounded-full overflow-hidden border border-pink-200 bg-white shadow-sm">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-display text-xl font-medium select-none"
                  style={{ color: "var(--hanami-deep)" }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty(Math.min(10, qty + 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
              {qty > 1 && (
                <span className="text-sm font-semibold" style={{ color: "var(--hanami-rose)" }}>
                  = {formatVND(product.price * qty)}
                </span>
              )}
            </div>

            {/* ─ 5. CTA Buttons ─ */}
            <div className="flex flex-col gap-3 mb-7">
              <button
                onClick={handleAdd}
                className="relative w-full h-14 rounded-full text-sm tracking-[0.1em] uppercase font-semibold flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-[0_8px_36px_rgba(244,182,194,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                style={{
                  background: added ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "#f4b6c2",
                  color:      added ? "#fff" : "#333333",
                  boxShadow:  added ? "0 4px 24px rgba(34,197,94,0.40)" : "0 4px 24px rgba(244,182,194,0.38)",
                }}
              >
                {added ? (
                  <><Check size={16} strokeWidth={2.5} />{t("productDetail.added")}</>
                ) : (
                  <><ShoppingCart size={15} />{t("productDetail.addToCart")}</>
                )}
              </button>

              <Link
                href="/#contact"
                className="w-full h-14 rounded-full text-sm tracking-[0.1em] uppercase font-semibold flex items-center justify-center gap-3 border-2 transition-all duration-300 hover:bg-[#8a3050] hover:text-white hover:border-[#8a3050] group"
                style={{ borderColor: "var(--hanami-rose)", color: "var(--hanami-rose)" }}
              >
                <CalendarHeart size={15} className="group-hover:scale-110 transition-transform duration-300" />
                {t("productDetail.bookArrangement")}
              </Link>
            </div>

            {/* ─ 6. Assurance badges ─ */}
            <div className="flex items-center justify-center gap-6 pt-6 border-t border-pink-100">
              {[
                t("productDetail.handcrafted"),
                t("productDetail.freeGiftBox"),
                t("productDetail.freeDelivery"),
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-xs font-normal text-gray-500">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(244,182,194,0.25)" }}>
                    <Check size={9} className="text-pink-500" strokeWidth={2.5} />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div className="mt-20 lg:mt-28">
            {/* Section header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-px w-8 bg-pink-300" />
                  <span className="text-[11px] tracking-[0.15em] uppercase font-medium" style={{ color: "#d96b82" }}>
                    {t("productDetail.youMayAlsoLove")}
                  </span>
                </div>
                <h2 className="font-display text-3xl font-semibold" style={{ color: "#1a1a1a" }}>
                  {t("productDetail.related")}{" "}
                  <em className="italic" style={{ color: "var(--hanami-rose)" }}>
                    {t("productDetail.relatedEm")}
                  </em>
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden sm:flex items-center gap-2 text-xs tracking-[0.1em] uppercase font-semibold transition-all duration-200 border border-[#f4b6c2] px-5 py-2.5 rounded-full hover:bg-[#f4b6c2] hover:text-[#333]"
                style={{ color: "#d96b82" }}
              >
                {t("productDetail.viewAll")}
                <ChevronRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {related.map((p) => <RelatedCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
