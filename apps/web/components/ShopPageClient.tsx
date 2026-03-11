"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { formatVND, TAG_STYLES, type ApiProduct } from "@/lib/products";
import { useLang } from "@/lib/lang-context";

const PAGE_SIZE = 8;

/** Normalise tag casing so "bestseller" → "Bestseller" for TAG_STYLES lookup */
function normalizeTag(tag?: string): string | undefined {
  if (!tag) return undefined;
  return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
}

// ─── SVG flower overlay ──────────────────────────────────────────────────────

function FlowerOverlay() {
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

// ─── Product card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: ApiProduct;
  batchIndex: number;
  isNew: boolean;
}

function ProductCard({ product, batchIndex, isNew }: ProductCardProps) {
  const { lang, t } = useLang();
  const primaryName   = lang === "en" ? product.nameEn : product.nameVi;
  const secondaryName = lang === "en" ? product.nameVi : product.nameEn;
  const tag           = normalizeTag(product.tag);

  return (
    <Link
      href={`/shop/${product.slug}`}
      style={
        isNew
          ? {
              animation: "card-appear 0.55s cubic-bezier(0.22,1,0.36,1) both",
              animationDelay: `${batchIndex * 70}ms`,
            }
          : undefined
      }
      className="group flex flex-col rounded-2xl overflow-hidden border border-pink-100 bg-white shadow-sm hover:shadow-[0_8px_40px_rgba(244,182,194,0.15)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {product.imageUrl ? (
          /* Real photo */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.nameVi}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          /* CSS gradient fallback */
          <div
            className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ background: product.gradient ?? "linear-gradient(135deg,#fae8ee,#f4b6c2)" }}
          />
        )}
        {!product.imageUrl && <FlowerOverlay />}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 65%, rgba(255,235,240,0.38) 0%, transparent 55%)" }} />
        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center"
          style={{ background: "rgba(22,7,18,0.4)" }}>
          <span className="text-white text-[10px] tracking-[0.15em] uppercase font-normal border border-white/50 px-5 py-2.5 rounded-full">
            {t("shopPage.viewDetails")}
          </span>
        </div>
        {/* Tag */}
        {tag && TAG_STYLES[tag] && (
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] tracking-[0.1em] uppercase font-normal px-2.5 py-1 rounded-full border ${TAG_STYLES[tag]}`}>
              {t(`tags.${tag}`)}
            </span>
          </div>
        )}
        {product.originalPrice && (
          <div className="absolute top-3 right-3 bg-rose-500 text-white text-[9px] tracking-wide px-2 py-1 rounded-full font-medium">
            {t("shopPage.sale")}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-1">
        <p className="text-[10px] tracking-[0.12em] uppercase font-normal" style={{ color: "#aaa" }}>{secondaryName}</p>
        <h2 className="font-display text-xl font-semibold leading-tight" style={{ color: "#1a1a1a" }}>
          {primaryName}
        </h2>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-semibold" style={{ color: "var(--hanami-rose)" }}>
            {formatVND(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through font-normal">
              {formatVND(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Load More button ─────────────────────────────────────────────────────────

function LoadMoreButton({
  onClick, isLoading, shown, total,
}: {
  onClick: () => void; isLoading: boolean; shown: number; total: number;
}) {
  const { t } = useLang();
  const remaining = total - shown;
  const n = Math.min(remaining, PAGE_SIZE);
  const loadLabel = t("shopPage.loadNMore").replace("%n", String(n));
  const leftLabel = t("shopPage.nLeft").replace("%n", String(remaining));

  return (
    <div className="flex flex-col items-center gap-4 mt-14">
      <div className="flex items-center gap-3">
        <div className="h-px w-16 bg-pink-200" />
        <span className="text-xs font-normal text-gray-400 tabular-nums">{shown} / {total}</span>
        <div className="h-px w-16 bg-pink-200" />
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1 rounded-full bg-pink-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${(shown / total) * 100}%`,
            background: "linear-gradient(90deg, #f4b6c2, #d96b82)",
          }}
        />
      </div>

      <button
        onClick={onClick}
        disabled={isLoading}
        className="relative mt-2 flex items-center gap-3 px-10 py-4 rounded-full text-sm font-semibold text-white tracking-[0.08em] uppercase transition-all duration-300 disabled:cursor-not-allowed hover:shadow-[0_8px_36px_rgba(244,182,194,0.40)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
        style={{
          background: "#f4b6c2", color: "#333333",
          boxShadow: "0 4px 20px rgba(244,182,194,0.35)",
          opacity: isLoading ? 0.85 : 1,
        }}
        aria-label={loadLabel}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>{t("shopPage.loadingMore")}</span>
          </>
        ) : (
          <>
            <span>{loadLabel}</span>
            <span className="text-white/60 font-normal normal-case tracking-normal text-[11px]">
              {leftLabel}
            </span>
          </>
        )}
      </button>
    </div>
  );
}

// ─── Page content ─────────────────────────────────────────────────────────────

interface Props {
  initialProducts: ApiProduct[];
  initialTotal:    number;
}

export function ShopPageClient({ initialProducts, initialTotal }: Props) {
  const { t } = useLang();

  const [products,      setProducts]      = useState<ApiProduct[]>(initialProducts);
  const [total,         setTotal]         = useState(initialTotal);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [isLoading,     setIsLoading]     = useState(false);
  const [newBatchStart, setNewBatchStart] = useState(initialProducts.length); // nothing "new" on first render

  const hasMore = products.length < total;

  const loadMore = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const nextPage = currentPage + 1;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
      const res = await fetch(`${apiUrl}/products?page=${nextPage}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      const { items, total: newTotal } = json.data as { items: ApiProduct[]; total: number };

      setNewBatchStart(products.length);   // mark where new cards start
      setProducts((prev) => [...prev, ...items]);
      setTotal(newTotal);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error("Load more failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Hero header ── */}
      <div className="relative pt-36 pb-20 px-6 overflow-hidden" style={{ background: "var(--hanami-dark)" }}>
        <div className="absolute -top-10 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(244,182,194,0.50) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(244,182,194,0.38) 0%, transparent 65%)" }} />
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(244,182,194,0.5), transparent)" }} />

        <div className="relative max-w-7xl mx-auto text-center">
          <nav className="flex items-center justify-center gap-2 text-[10px] tracking-[0.15em] uppercase font-normal text-white/60 mb-8">
            <Link href="/" className="hover:text-pink-300 transition-colors duration-200">{t("shopPage.home")}</Link>
            <span>/</span>
            <span style={{ color: "var(--hanami-soft)" }}>{t("shopPage.shop")}</span>
          </nav>

          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-pink-500/50" />
            <span className="text-[11px] tracking-[0.18em] uppercase font-medium" style={{ color: "rgba(244,182,194,0.9)" }}>{t("shopPage.collections")}</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-pink-500/50" />
          </div>

          <h1
            className="font-display font-semibold text-white mb-4"
            style={{ fontSize: "clamp(42px, 7vw, 80px)", lineHeight: 1.15 }}
          >
            {t("shopPage.heading")}{" "}
            <em className="italic" style={{ color: "var(--hanami-soft)" }}>{t("shopPage.headingEm")}</em>
          </h1>
          <p className="text-sm font-normal text-white/75 max-w-[440px] mx-auto leading-7">
            {t("shopPage.desc")}
          </p>
        </div>
      </div>

      {/* ── Product grid ── */}
      <main className="py-16 lg:py-24 px-6" style={{ background: "var(--hanami-ivory)" }}>
        <div className="max-w-7xl mx-auto">

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-10">
            <p className="text-[11px] tracking-[0.12em] uppercase font-medium" style={{ color: "#888" }}>
              {hasMore
                ? `${t("shopPage.showing")} ${products.length} / ${total}`
                : `${total} ${t("shopPage.productsCount")}`}
            </p>
            <div className="flex items-center gap-2 text-[10px] font-medium" style={{ color: "#aaa" }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 0L6.12 3.88H10L6.94 6.29L7.94 10.16L5 7.85L2.06 10.16L3.06 6.29L0 3.88H3.88L5 0Z" fill="currentColor" />
              </svg>
              {t("shopPage.handcraftedIn")}
            </div>
          </div>

          {/* No products fallback */}
          {products.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-sm">{t("shopPage.noProducts")}</p>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((p, index) => (
              <ProductCard
                key={p._id}
                product={p}
                isNew={index >= newBatchStart}
                batchIndex={index - newBatchStart}
              />
            ))}
          </div>

          {/* Load More / end-of-list */}
          {hasMore ? (
            <LoadMoreButton
              onClick={loadMore}
              isLoading={isLoading}
              shown={products.length}
              total={total}
            />
          ) : products.length > 0 ? (
            <div className="flex flex-col items-center gap-3 mt-14">
              <div className="flex items-center gap-3">
                <div className="h-px w-16 bg-pink-200" />
                <svg width="14" height="14" viewBox="0 0 16 16" className="text-pink-300">
                  <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" fill="currentColor" />
                </svg>
                <div className="h-px w-16 bg-pink-200" />
              </div>
              <p className="text-xs font-normal text-gray-400 tracking-[0.1em]">
                {t("shopPage.allDisplayed").replace("%n", String(total))}
              </p>
            </div>
          ) : null}

          {/* Bottom CTA */}
          <div
            className="mt-16 rounded-3xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-pink-200"
            style={{ background: "linear-gradient(135deg, rgba(252,231,243,0.6) 0%, rgba(253,245,240,0.8) 100%)" }}
          >
            <div>
              <p className="font-display text-2xl font-semibold mb-1" style={{ color: "#1a1a1a" }}>
                {t("shopPage.cantFind")}
              </p>
              <p className="text-sm font-normal" style={{ color: "#666" }}>{t("shopPage.customVision")}</p>
            </div>
            <Link
              href="/#contact"
              className="flex items-center gap-2.5 px-8 py-4 rounded-full text-xs tracking-[0.12em] uppercase font-semibold whitespace-nowrap border border-[#f4b6c2] text-[#d96b82] hover:bg-[#f4b6c2] hover:text-[#333] hover:border-[#f4b6c2] transition-all duration-300"
            >
              {t("shopPage.bookConsultation")}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
