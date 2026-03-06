"use client";

import { X, ShoppingCart, Plus, Minus, Trash2, Package, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useLang } from "@/lib/lang-context";
import { formatVND } from "@/lib/products";

// ─── Flower overlay (shared visual) ─────────────────────────────────────────

function FlowerThumb({ gradient, imageUrl, petals }: { gradient?: string; imageUrl?: string; petals: number }) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt="" className="w-20 h-24 rounded-xl object-cover flex-shrink-0" />
    );
  }

  const pts = [
    { x: 18, y: 20, s: 26, r: 15 }, { x: 72, y: 12, s: 18, r: -20 },
    { x: 50, y: 60, s: 30, r: 30 }, { x:  8, y: 60, s: 16, r: 45 },
    { x: 82, y: 52, s: 22, r: -10 },
  ].slice(0, Math.min(petals, 5));

  return (
    <div className="relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0"
      style={{ background: gradient ?? "linear-gradient(135deg,#fce4ec,#f9a8d4)" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full pointer-events-none">
        {pts.map(({ x, y, s, r }, i) => (
          <g key={i} transform={`translate(${x},${y}) rotate(${r}) scale(${s / 40})`} opacity={0.18}>
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse key={a} cx="0" cy="-11" rx="4.5" ry="11" fill="white" transform={`rotate(${a})`} />
            ))}
            <circle cx="0" cy="0" r="4" fill="rgba(255,240,245,0.9)" />
          </g>
        ))}
      </svg>
      {/* glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 65%, rgba(255,235,240,0.4) 0%, transparent 55%)" }}
      />
    </div>
  );
}

// ─── CartDrawer ──────────────────────────────────────────────────────────────

export function CartDrawer() {
  const { items, cartOpen, setCartOpen, updateQty, removeFromCart, cartTotal } = useCart();
  const { lang, t } = useLang();
  const count = items.reduce((s, i) => s + i.qty, 0);

  const itemCountLabel = count !== 1 && lang === "en"
    ? `${count} ${t("cart.items")}`
    : `${count} ${t("cart.item")}`;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 transition-opacity duration-400 ${
          cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(22,7,18,0.5)", backdropFilter: "blur(3px)" }}
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("cart.title")}
        className={`fixed top-0 right-0 bottom-0 z-50 flex flex-col w-full max-w-[400px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "var(--hanami-ivory)", boxShadow: "-8px 0 60px rgba(249,168,212,0.25)" }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 inset-x-0 h-[2px]"
          style={{ background: "linear-gradient(to right, transparent, var(--hanami-pink), var(--hanami-rose), transparent)" }}
        />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(249,168,212,0.35)" }}
            >
              <ShoppingCart size={14} style={{ color: "var(--hanami-rose)" }} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-display text-xl font-medium" style={{ color: "var(--hanami-deep)" }}>
                {t("cart.title")}
              </h2>
              {count > 0 && (
                <p className="text-[10px] tracking-wide text-pink-400/60 font-light">
                  {itemCountLabel}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-pink-300 hover:bg-pink-100 hover:text-rose-700 transition-colors duration-200"
            aria-label={t("cart.close")}
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Items ── */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              {/* Empty flower */}
              <svg viewBox="0 0 80 80" className="w-20 h-20 mb-6 opacity-[0.18]" fill="none">
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <ellipse key={a} cx="40" cy="18" rx="6" ry="18" fill="var(--hanami-rose)" transform={`rotate(${a} 40 40)`} />
                ))}
                <circle cx="40" cy="40" r="8" fill="var(--hanami-blush)" />
              </svg>
              <p className="font-display text-2xl font-light mb-2" style={{ color: "rgba(61,11,34,0.35)" }}>
                {t("cart.emptyTitle")}
              </p>
              <p className="text-xs text-pink-400/50 font-light mb-8 leading-6 max-w-[200px]">
                {t("cart.emptyDesc")}
              </p>
              <Link
                href="/shop"
                onClick={() => setCartOpen(false)}
                className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase font-light text-pink-500 hover:text-rose-700 transition-colors duration-300"
              >
                {t("cart.browse")}
                <ChevronRight size={12} />
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map(({ product, qty }) => {
                const displayName    = lang === "en" ? product.nameEn : product.nameVi;
                const secondaryName  = lang === "en" ? product.nameVi : product.nameEn;

                return (
                  <li
                    key={product.id}
                    className="flex gap-4 p-4 rounded-2xl border border-pink-100/80 bg-white/80 hover:border-pink-200 transition-colors duration-200"
                  >
                    <FlowerThumb gradient={product.gradient} imageUrl={product.imageUrl} petals={product.petals} />

                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] tracking-[0.2em] uppercase text-pink-400/50 font-light mb-0.5">
                        {secondaryName}
                      </p>
                      <p className="font-display text-base leading-tight mb-1 truncate" style={{ color: "var(--hanami-deep)" }}>
                        {displayName}
                      </p>
                      <p className="text-sm font-medium mb-3" style={{ color: "var(--hanami-rose)" }}>
                        {formatVND(product.price)}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Qty controls */}
                        <div
                          className="flex items-center rounded-full border border-pink-200 overflow-hidden"
                          style={{ background: "var(--hanami-pale)" }}
                        >
                          <button
                            onClick={() => updateQty(product.id, qty - 1)}
                            className="w-7 h-7 flex items-center justify-center text-pink-400 hover:bg-pink-100 transition-colors duration-200"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-8 text-center font-display text-base font-medium" style={{ color: "var(--hanami-deep)" }}>
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQty(product.id, qty + 1)}
                            className="w-7 h-7 flex items-center justify-center text-pink-400 hover:bg-pink-100 transition-colors duration-200"
                            aria-label="Increase quantity"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-pink-200 hover:text-rose-500 hover:bg-rose-50 transition-colors duration-200"
                          aria-label={`Remove ${displayName}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div className="px-7 py-6 border-t border-pink-100">
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-light text-rose-900/55">{t("cart.subtotal")}</span>
              <span className="font-display text-2xl font-semibold" style={{ color: "var(--hanami-rose)" }}>
                {formatVND(cartTotal)}
              </span>
            </div>
            <p className="text-[10px] text-pink-400/45 font-light mb-5 leading-5">
              {t("cart.freeDelivery")}
            </p>

            {/* Request to order */}
            <Link
              href="/checkout"
              onClick={() => setCartOpen(false)}
              className="w-full h-[52px] rounded-full text-[11px] tracking-[0.28em] uppercase font-light text-white flex items-center justify-center gap-3 mb-3 hover:opacity-90 transition-opacity duration-300"
              style={{
                background: "linear-gradient(135deg, #f9a8d4 0%, #db2777 100%)",
                boxShadow: "0 4px 24px rgba(249,168,212,0.50)",
              }}
            >
              <Package size={14} />
              {t("cart.requestToOrder")}
            </Link>

            <button
              onClick={() => setCartOpen(false)}
              className="w-full text-center text-[10px] tracking-[0.25em] uppercase font-light text-pink-400 hover:text-rose-700 transition-colors duration-300 py-2"
            >
              {t("cart.continueShopping")}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
