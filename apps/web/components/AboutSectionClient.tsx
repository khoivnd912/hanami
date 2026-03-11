"use client";

import { useLang } from "@/lib/lang-context";

export interface ShowcaseItem {
  nameVi:    string;
  nameEn:    string;
  gradient:  string;
  imageUrl?: string;
}

// ─── Content shape returned by API ───────────────────────────────────────────

export interface AboutLang {
  heading:      string;
  headingEm:    string;
  p1:           string;
  p2:           string;
  p3:           string;
  stat1num:     string;
  stat1label:   string;
  stat2num:     string;
  stat2label:   string;
  stat3num:     string;
  stat3label:   string;
  founderTitle: string;
}

export interface AboutContent {
  vi:               AboutLang;
  en:               AboutLang;
  founderName:      string;
  foundedYear:      string;
  founderImageUrl?: string;
}

// ─── Client component ─────────────────────────────────────────────────────────

export function AboutSectionClient({
  content,
  showcase = [],
}: {
  content:   AboutContent | null;
  showcase?: ShowcaseItem[];
}) {
  const { lang, t } = useLang();

  // If API content exists, use it; otherwise fall back to translation strings
  const c = content ? content[lang] : null;

  const heading      = c?.heading      || t("about.heading");
  const headingEm    = c?.headingEm    || t("about.headingEm");
  const p1           = c?.p1           || t("about.p1");
  const p2           = c?.p2           || t("about.p2");
  const p3           = c?.p3           || t("about.p3");
  const stat1num     = c?.stat1num     || t("about.stat1num");
  const stat1label   = c?.stat1label   || t("about.stat1label");
  const stat2num     = c?.stat2num     || t("about.stat2num");
  const stat2label   = c?.stat2label   || t("about.stat2label");
  const stat3num     = c?.stat3num     || t("about.stat3num");
  const stat3label   = c?.stat3label   || t("about.stat3label");
  const founderTitle = c?.founderTitle || t("about.founderTitle");
  const founderName       = content?.founderName      || "Misaki Nguyen";
  const founderImageUrl   = content?.founderImageUrl  || "";
  const main   = showcase[0];
  const small  = showcase[1];
  const third  = showcase[2];

  return (
    <section
      id="about"
      className="relative py-24 lg:py-32 px-6 overflow-hidden"
      style={{ background: "var(--hanami-cream)" }}
    >
      {/* Background decorative circle */}
      <div
        className="absolute -right-32 top-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: "radial-gradient(circle, #f4b6c2 0%, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* ── Left: Decorative Lamp Composition ── */}
          <div className="relative order-2 lg:order-1 flex items-center justify-center py-10 lg:py-0">

            {/* Outer ring — hidden on small mobile */}
            <div
              className="absolute hidden sm:block rounded-full border border-pink-200/50"
              style={{ width: "min(370px, 80vw)", height: "min(370px, 80vw)", borderStyle: "dashed" }}
            />
            {/* Middle ring — hidden on small mobile */}
            <div
              className="absolute hidden sm:block rounded-full border border-pink-300/30"
              style={{ width: "min(290px, 63vw)", height: "min(290px, 63vw)" }}
            />

            {/* Main lamp frame */}
            <div
              className="relative w-[200px] h-[260px] sm:w-[240px] sm:h-[310px] rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgba(192,80,112,0.22)] float-gentle"
              style={!main?.imageUrl ? {
                background: main?.gradient ?? "radial-gradient(ellipse at 50% 30%, #fff5f7 0%, #fae8ee 35%, #f19cad 65%, #c05070 85%, #5c1a30 100%)",
              } : undefined}
            >
              {main?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={main.imageUrl}
                  alt={main.nameVi}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <>
                  <div
                    className="absolute inset-0"
                    style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(255,235,240,0.6) 0%, transparent 55%)" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 120 120" className="w-36 h-36 opacity-30" fill="none">
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                        <ellipse key={angle} cx="60" cy="32" rx="12" ry="28"
                          fill="rgba(255,255,255,0.9)" transform={`rotate(${angle} 60 60)`} />
                      ))}
                      <circle cx="60" cy="60" r="10" fill="rgba(255,240,245,1)" />
                    </svg>
                  </div>
                </>
              )}
              <div
                className="absolute bottom-0 inset-x-0 px-5 py-4"
                style={{ background: "linear-gradient(to top, rgba(74,13,40,0.7), transparent)" }}
              >
                <p className="text-white text-[11px] tracking-[0.15em] uppercase text-center font-normal opacity-90">
                  {main ? (lang === "en" ? main.nameEn : main.nameVi) : t("about.signaturePiece")}
                </p>
              </div>
            </div>

            {/* Small floating card — top right */}
            <div
              className="absolute -top-4 right-4 lg:-right-8 w-[88px] h-[106px] sm:w-[110px] sm:h-[130px] rounded-2xl overflow-hidden shadow-lg border border-pink-100"
              style={!small?.imageUrl ? {
                background: small?.gradient ?? "linear-gradient(135deg, #fae8ee 0%, #f4b6c2 50%, #f19cad 100%)",
              } : undefined}
            >
              {small?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={small.imageUrl}
                  alt={small.nameVi}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 60 60" className="w-14 h-14 opacity-40" fill="none">
                    {[0, 60, 120, 180, 240, 300].map((angle) => (
                      <ellipse key={angle} cx="30" cy="14" rx="7" ry="14"
                        fill="white" transform={`rotate(${angle} 30 30)`} />
                    ))}
                    <circle cx="30" cy="30" r="6" fill="rgba(255,240,245,1)" />
                  </svg>
                </div>
              )}
            </div>

            {/* Small floating card — bottom left */}
            <div
              className="absolute -bottom-4 left-4 lg:-left-8 w-[95px] h-[80px] sm:w-[120px] sm:h-[100px] rounded-2xl overflow-hidden shadow-lg border border-pink-100"
              style={!third?.imageUrl ? {
                background: third?.gradient ?? "linear-gradient(135deg, #fff9f9 0%, #fae8ee 60%, #f4b6c2 100%)",
              } : undefined}
            >
              {third?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={third.imageUrl}
                  alt={third.nameVi}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 60 60" className="w-12 h-12 opacity-35" fill="none">
                    {[0, 60, 120, 180, 240, 300].map((angle) => (
                      <ellipse key={angle} cx="30" cy="14" rx="7" ry="14"
                        fill="white" transform={`rotate(${angle} 30 30)`} />
                    ))}
                    <circle cx="30" cy="30" r="6" fill="rgba(255,240,245,1)" />
                  </svg>
                </div>
              )}
            </div>

            {/* Gold accent line */}
            <div
              className="absolute -left-6 top-8 w-1 h-24 rounded-full"
              style={{ background: "linear-gradient(to bottom, transparent, var(--hanami-gold), transparent)" }}
            />
          </div>

          {/* ── Right: Story Text ── */}
          <div className="order-1 lg:order-2 max-w-[520px]">
            {/* Section label */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8 bg-pink-400" />
              <span className="text-[11px] tracking-[0.18em] uppercase font-medium" style={{ color: "#d96b82" }}>{t("about.label")}</span>
            </div>

            <h2
              className="font-display font-semibold leading-[1.1] mb-8"
              style={{
                fontSize: "clamp(38px, 5vw, 62px)",
                color: "#1a1a1a",
              }}
            >
              {heading}{" "}
              <em className="italic" style={{ color: "var(--hanami-rose)" }}>
                {headingEm}
              </em>
            </h2>

            <div className="space-y-5 text-[15px] leading-8 font-normal" style={{ color: "#555" }}>
              <p>{p1}</p>
              <p>{p2}</p>
              <p>{p3}</p>
            </div>

            {/* Stats row */}
            <div className="flex gap-10 mt-10 mb-10">
              {[
                { num: stat1num, label: stat1label },
                { num: stat2num, label: stat2label },
                { num: stat3num, label: stat3label },
              ].map(({ num, label }) => (
                <div key={label}>
                  <p
                    className="font-display text-4xl font-semibold leading-none mb-1"
                    style={{ color: "var(--hanami-rose)" }}
                  >
                    {num}
                  </p>
                  <p className="text-[10px] tracking-[0.15em] uppercase font-medium" style={{ color: "#999" }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Signature */}
            <div className="flex items-center gap-4 pt-6 border-t border-pink-200/60">
              {founderImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={founderImageUrl}
                  alt={founderName}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  style={{ border: "2px solid var(--hanami-rose)" }}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-display font-semibold flex-shrink-0"
                  style={{ background: "var(--hanami-rose)" }}
                >
                  {founderName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-display italic text-xl" style={{ color: "var(--hanami-deep)" }}>
                  {founderName}
                </p>
                <p className="text-[10px] tracking-[0.15em] uppercase font-medium" style={{ color: "#999" }}>
                  {founderTitle}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
