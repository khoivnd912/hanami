"use client";

import { useLang } from "@/lib/lang-context";

const SOCIAL = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Pinterest",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.82a8.23 8.23 0 004.84 1.55V6.92a4.85 4.85 0 01-1.07-.23z" />
      </svg>
    ),
  },
];

export function FooterSection() {
  const { t } = useLang();

  const FOOTER_LINKS = {
    [t("footer.exploreHeading")]: [
      { label: t("footer.home"),         href: "#home" },
      { label: t("footer.about"),        href: "#about" },
      { label: t("footer.gallery"),      href: "#gallery" },
      { label: t("footer.testimonials"), href: "#testimonials" },
      { label: t("footer.contact"),      href: "#contact" },
    ],
    [t("footer.collectionsHeading")]: [
      { label: t("footer.roseLamps"),       href: "#gallery" },
      { label: t("footer.cherryBlossom"),   href: "#gallery" },
      { label: t("footer.peonyCollection"), href: "#gallery" },
      { label: t("footer.bespokeDesign"),   href: "#contact" },
    ],
  };

  return (
    <footer
      className="relative pt-20 pb-10 px-6 overflow-hidden"
      style={{ background: "var(--hanami-dark)" }}
    >
      {/* Top glow */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(236,72,153,0.4) 30%, rgba(190,24,93,0.5) 50%, rgba(236,72,153,0.4) 70%, transparent 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9">
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <ellipse
                    key={deg}
                    cx="18"
                    cy="10"
                    rx="5"
                    ry="9"
                    fill="rgba(249,168,212,0.7)"
                    transform={`rotate(${deg} 18 18)`}
                  />
                ))}
                <circle cx="18" cy="18" r="5" fill="rgba(252,231,243,0.9)" />
              </svg>
              <div className="flex flex-col leading-none">
                <span className="font-display text-[22px] font-semibold tracking-wider text-white">
                  Hanami
                </span>
                <span className="text-[9px] tracking-[0.35em] uppercase text-pink-400/60">花見</span>
              </div>
            </div>

            <p className="text-[14px] leading-8 text-white/45 font-light max-w-[320px] mb-8">
              {t("footer.tagline")}
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIAL.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-pink-300 transition-all duration-300 hover:bg-white/06"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-[9px] tracking-[0.35em] uppercase text-pink-500/60 font-light mb-5">
                {heading}
              </p>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={href + label}>
                    <a
                      href={href}
                      className="text-[13px] font-light text-white/40 hover:text-pink-300 transition-colors duration-300"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[11px] font-light text-white/25 tracking-wide">
            © {new Date().getFullYear()} Hanami Flower Studio. {t("footer.allRightsReserved")}
          </p>
          <div className="flex items-center gap-6">
            {[t("footer.privacy"), t("footer.terms")].map((item) => (
              <span
                key={item}
                className="text-[11px] font-light text-white/25 tracking-wide"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
