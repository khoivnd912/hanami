"use client";

import { useLang } from "@/lib/lang-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FooterContent {
  taglineVi: string;
  taglineEn: string;
  bizName:   string;
  instagram: string;
  facebook:  string;
  threads:   string;
  tiktok:    string;
}

const DEFAULT: FooterContent = {
  taglineVi: "Đèn hoa cưới thủ công — nơi câu chuyện tình yêu của bạn được lưu giữ trong cánh hoa và ánh sáng, mãi mãi.",
  taglineEn: "Handcrafted wedding flower night lamps — where your love story is preserved in petal and light, forever.",
  bizName:   "Hanami Flower Studio",
  instagram: "#",
  facebook:  "#",
  threads:   "#",
  tiktok:    "#",
};

// ─── Social icons ─────────────────────────────────────────────────────────────

const SOCIAL_ICONS = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-[18px] h-[18px]">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  Threads: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.028-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.592 12c.024 3.086.715 5.496 2.053 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.689-2.044 1.566-1.663 1.54-3.746 1.04-5.034-.28-.73-.773-1.335-1.44-1.732-.119 1.996-.628 3.405-1.553 4.302-.974.944-2.267 1.412-3.919 1.428-1.356.013-2.59-.348-3.478-1.018-.999-.745-1.537-1.82-1.51-3.024.025-1.15.577-2.193 1.553-2.934.955-.724 2.275-1.118 3.725-1.115 1.048.003 1.944.157 2.721.453-.15-1.137-.647-2.012-1.5-2.617-.884-.624-2.087-.94-3.577-.94h-.03c-1.01.007-2.878.254-3.876 1.748l-1.69-1.158C7.7 5.688 9.757 4.9 12.206 4.9h.039c4.274.013 6.786 2.432 6.968 6.763.08.02.159.043.237.068 1.298.43 2.287 1.304 2.86 2.533.825 1.785.851 4.495-1.012 6.52-1.623 1.735-3.815 2.63-6.996 2.714L12.186 24z" />
    </svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.82a8.23 8.23 0 004.84 1.55V6.92a4.85 4.85 0 01-1.07-.23z" />
    </svg>
  ),
};

// ─── Section client ───────────────────────────────────────────────────────────

export function FooterSectionClient({ content }: { content: FooterContent | null }) {
  const { lang, t } = useLang();

  const c = content ?? DEFAULT;
  const tagline = lang === "en" ? (c.taglineEn || DEFAULT.taglineEn) : (c.taglineVi || DEFAULT.taglineVi);
  const bizName = c.bizName || DEFAULT.bizName;

  const socials = [
    { label: "Instagram", href: c.instagram || "#", icon: SOCIAL_ICONS.Instagram },
    { label: "Facebook",  href: c.facebook  || "#", icon: SOCIAL_ICONS.Facebook  },
    { label: "Threads",   href: c.threads   || "#", icon: SOCIAL_ICONS.Threads   },
    { label: "TikTok",    href: c.tiktok    || "#", icon: SOCIAL_ICONS.TikTok    },
  ];

  const FOOTER_LINKS = {
    [t("footer.exploreHeading")]: [
      { label: t("footer.home"),    href: "#home" },
      { label: t("footer.about"),   href: "#about" },
      { label: t("footer.gallery"), href: "#gallery" },
      { label: t("footer.shop"),    href: "/shop" },
      { label: t("footer.contact"), href: "#contact" },
    ],
  };

  return (
    <footer
      className="relative pt-16 pb-8 lg:pt-24 lg:pb-10 px-6 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #FAE8EE 0%, #F6DCE4 100%)" }}
    >
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "#E7C6D0" }} />

      {/* Decorative petal — top right */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle, #f4b6c2 0%, transparent 70%)" }}
      />
      {/* Decorative petal — bottom left */}
      <div
        className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #e8859a 0%, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14 mb-16">

          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10 flex-shrink-0">
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <ellipse key={deg} cx="20" cy="11" rx="5.5" ry="10" fill="#f4b6c2"
                    transform={`rotate(${deg} 20 20)`} />
                ))}
                <circle cx="20" cy="20" r="5.5" fill="#d96b82" />
                <circle cx="20" cy="20" r="2.5" fill="#fce4ed" />
              </svg>
              <div className="flex flex-col leading-none gap-1">
                <span className="font-display text-[24px] font-semibold tracking-wider" style={{ color: "#1a1a1a" }}>
                  Hanami
                </span>
                <span className="text-[9px] tracking-[0.38em] uppercase font-semibold" style={{ color: "#9C4A64" }}>
                  花見 · Flower Studio
                </span>
              </div>
            </div>

            {/* Tagline */}
            <p
              className="text-[14px] leading-[1.9] font-normal max-w-[300px] mb-8"
              style={{ color: "#555555" }}
            >
              {tagline}
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socials.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href || "#"}
                  aria-label={label}
                  target={href && href !== "#" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: "#F4B6C2", color: "#ffffff" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#e8859a";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#F4B6C2";
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p
                className="text-[11px] tracking-[0.22em] uppercase mb-5"
                style={{ color: "#9C4A64", fontWeight: 700 }}
              >
                {heading}
              </p>
              <ul className="space-y-3.5">
                {links.map(({ label, href }) => (
                  <li key={href + label}>
                    <a
                      href={href}
                      className="text-[14px] font-normal leading-none transition-colors duration-200 inline-block"
                      style={{ color: "#333333" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color = "#E8859A";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color = "#333333";
                      }}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid #E7C6D0" }}
        >
          <p className="text-[12px] font-normal tracking-wide" style={{ color: "#777777" }}>
            © {new Date().getFullYear()} {bizName}. {t("footer.allRightsReserved")}
          </p>
          <div className="flex items-center gap-6">
            {[t("footer.privacy"), t("footer.terms")].map((item) => (
              <span
                key={item}
                className="text-[12px] font-normal tracking-wide cursor-pointer transition-colors duration-200"
                style={{ color: "#777777" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.color = "#E8859A"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.color = "#777777"; }}
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
