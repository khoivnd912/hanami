"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useLang } from "@/lib/lang-context";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const pathname                = usePathname();
  const { cartCount, setCartOpen } = useCart();
  const { lang, setLang, t }       = useLang();

  // Scroll detection for background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const isHome     = pathname === "/";
  const forceLight = !isHome;

  const navLinks = [
    { href: "/",         label: t("nav.home"),    exact: true  },
    { href: "/#about",   label: t("nav.about"),   exact: false },
    { href: "/shop",     label: t("nav.shop"),    exact: false },
    { href: "/#gallery", label: t("nav.gallery"), exact: false },
    { href: "/#contact", label: t("nav.contact"), exact: false },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (href.startsWith("/#")) return false;
    return exact ? pathname === href : pathname.startsWith(href);
  };

  const navBg = forceLight || scrolled
    ? "bg-white/95 backdrop-blur-md shadow-[0_1px_20px_rgba(236,72,153,0.08)] border-b border-pink-100"
    : "bg-transparent";

  const linkColor = forceLight || scrolled ? "text-rose-900" : "text-white/85";
  const logoColor = forceLight || scrolled ? "text-rose-800" : "text-white";
  const subColor  = forceLight || scrolled ? "text-pink-400" : "text-pink-200/80";
  const iconColor = forceLight || scrolled ? "text-rose-900" : "text-white";

  // Language toggle colors
  const toggleBorder = forceLight || scrolled ? "border-pink-200" : "border-white/30";
  const toggleDivider = forceLight || scrolled ? "bg-pink-200" : "bg-white/20";

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${navBg}`}>
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-[76px]">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-3 group" aria-label="Hanami home">
          <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9 flex-shrink-0">
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <ellipse
                key={deg}
                cx="18" cy="10" rx="5" ry="9"
                fill={forceLight || scrolled ? "#f9a8d4" : "rgba(249,168,212,0.8)"}
                transform={`rotate(${deg} 18 18)`}
                className="transition-all duration-500"
              />
            ))}
            <circle cx="18" cy="18" r="5"
              fill={forceLight || scrolled ? "#f9a8d4" : "rgba(252,231,243,0.95)"}
              className="transition-all duration-500"
            />
          </svg>
          <div className="flex flex-col leading-none">
            <span className={`font-display text-[22px] font-semibold tracking-wider transition-colors duration-500 ${logoColor}`}>
              Hanami
            </span>
            <span className={`text-[9px] tracking-[0.35em] uppercase transition-colors duration-500 ${subColor}`}>
              花見
            </span>
          </div>
        </Link>

        {/* ── Desktop Links ── */}
        <ul className="hidden md:flex items-center gap-7">
          {navLinks.map(({ href, label, exact }) => {
            const active = isActive(href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`relative text-xs tracking-[0.22em] uppercase font-light transition-colors duration-300
                    after:absolute after:-bottom-0.5 after:left-0 after:h-px after:bg-pink-400 after:transition-all after:duration-300
                    ${active
                      ? "text-pink-500 after:w-full"
                      : `${linkColor} after:w-0 hover:text-pink-400 hover:after:w-full`
                    }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}

          {/* Cart icon */}
          <li>
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
              className={`relative p-2 rounded-full hover:bg-pink-50 transition-colors duration-300 ${iconColor}`}
            >
              <ShoppingCart size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full text-white text-[9px] flex items-center justify-center font-medium leading-none px-1"
                  style={{ background: "var(--hanami-rose)" }}
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          </li>

          {/* EN / VI language toggle */}
          <li>
            <div className={`flex items-center rounded-full border overflow-hidden text-[10px] tracking-[0.18em] uppercase font-light ${toggleBorder}`}>
              <button
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
                className={`px-3 py-1.5 transition-colors duration-200 ${
                  lang === "en"
                    ? "bg-pink-500 text-white"
                    : `${linkColor} hover:text-pink-400`
                }`}
              >
                EN
              </button>
              <div className={`w-px h-4 ${toggleDivider}`} />
              <button
                onClick={() => setLang("vi")}
                aria-pressed={lang === "vi"}
                className={`px-3 py-1.5 transition-colors duration-200 ${
                  lang === "vi"
                    ? "bg-pink-500 text-white"
                    : `${linkColor} hover:text-pink-400`
                }`}
              >
                VI
              </button>
            </div>
          </li>

          {/* Order Now CTA */}
          <li>
            <Link
              href="/#contact"
              className={`px-5 py-2.5 text-[10px] tracking-[0.25em] uppercase font-light rounded-full border transition-all duration-300 ${
                forceLight || scrolled
                  ? "border-pink-400 text-pink-600 hover:bg-pink-500 hover:text-white hover:border-pink-500"
                  : "border-white/50 text-white/90 hover:bg-white hover:text-rose-900 hover:border-white"
              }`}
            >
              {t("nav.orderNow")}
            </Link>
          </li>
        </ul>

        {/* ── Mobile: Cart + Hamburger ── */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setCartOpen(true)}
            className={`relative p-2 ${iconColor}`}
            aria-label="Open cart"
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-[16px] h-[16px] rounded-full text-white text-[8px] flex items-center justify-center font-medium"
                style={{ background: "var(--hanami-rose)" }}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
          <button
            className={`p-2 transition-colors duration-300 ${iconColor}`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-400 ease-in-out ${
          open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/96 backdrop-blur-md px-8 py-7 flex flex-col gap-5 border-t border-pink-100">
          {navLinks.map(({ href, label, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`text-left text-xs tracking-[0.3em] uppercase font-light transition-colors ${
                  active ? "text-pink-500" : "text-rose-900 hover:text-pink-500"
                }`}
              >
                {label}
              </Link>
            );
          })}

          {/* Mobile EN/VI toggle */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] tracking-[0.3em] uppercase text-pink-400/60 font-light">Lang</span>
            <div className="flex items-center rounded-full border border-pink-200 overflow-hidden text-[10px] tracking-[0.18em] uppercase font-light">
              <button
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
                className={`px-3 py-1.5 transition-colors duration-200 ${lang === "en" ? "bg-pink-500 text-white" : "text-rose-900 hover:text-pink-400"}`}
              >
                EN
              </button>
              <div className="w-px h-4 bg-pink-200" />
              <button
                onClick={() => setLang("vi")}
                aria-pressed={lang === "vi"}
                className={`px-3 py-1.5 transition-colors duration-200 ${lang === "vi" ? "bg-pink-500 text-white" : "text-rose-900 hover:text-pink-400"}`}
              >
                VI
              </button>
            </div>
          </div>

          <Link
            href="/#contact"
            className="mt-2 px-6 py-3 text-xs tracking-[0.25em] uppercase font-light border border-pink-400 text-pink-600 rounded-full hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all text-center"
          >
            {t("nav.orderNow")}
          </Link>
        </div>
      </div>
    </header>
  );
}
