"use client";

import { useLang } from "@/lib/lang-context";

export function AboutSection() {
  const { t } = useLang();

  return (
    <section
      id="about"
      className="relative py-24 lg:py-32 px-6 overflow-hidden"
      style={{ background: "var(--hanami-cream)" }}
    >
      {/* Background decorative circle */}
      <div
        className="absolute -right-32 top-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: "radial-gradient(circle, #f9a8d4 0%, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* ── Left: Decorative Lamp Composition ── */}
          <div className="relative order-2 lg:order-1 flex items-center justify-center">

            {/* Outer ring */}
            <div
              className="absolute w-[370px] h-[370px] rounded-full border border-pink-200/50"
              style={{ borderStyle: "dashed" }}
            />
            {/* Middle ring */}
            <div className="absolute w-[290px] h-[290px] rounded-full border border-pink-300/30" />

            {/* Main lamp frame */}
            <div
              className="relative w-[240px] h-[310px] rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgba(190,24,93,0.22)] float-gentle"
              style={{
                background: "radial-gradient(ellipse at 50% 30%, #fff5f8 0%, #fce4ec 35%, #f48fb1 65%, #c2185b 85%, #4a0d28 100%)",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(ellipse at 50% 60%, rgba(255,235,240,0.6) 0%, transparent 55%)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-36 h-36 opacity-30" fill="none">
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                    <ellipse
                      key={angle}
                      cx="60"
                      cy="32"
                      rx="12"
                      ry="28"
                      fill="rgba(255,255,255,0.9)"
                      transform={`rotate(${angle} 60 60)`}
                    />
                  ))}
                  <circle cx="60" cy="60" r="10" fill="rgba(255,240,245,1)" />
                </svg>
              </div>
              <div
                className="absolute bottom-0 inset-x-0 px-5 py-4"
                style={{ background: "linear-gradient(to top, rgba(74,13,40,0.7), transparent)" }}
              >
                <p className="text-white text-[11px] tracking-[0.15em] uppercase text-center font-normal opacity-90">
                  {t("about.signaturePiece")}
                </p>
              </div>
            </div>

            {/* Small floating card — top right */}
            <div
              className="absolute -top-4 right-4 lg:-right-8 w-[110px] h-[130px] rounded-2xl overflow-hidden shadow-lg border border-pink-100"
              style={{
                background: "linear-gradient(135deg, #fce4ec 0%, #f9a8d4 50%, #f9a8d4 100%)",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 60 60" className="w-14 h-14 opacity-40" fill="none">
                  {[0, 60, 120, 180, 240, 300].map((angle) => (
                    <ellipse
                      key={angle}
                      cx="30"
                      cy="14"
                      rx="7"
                      ry="14"
                      fill="white"
                      transform={`rotate(${angle} 30 30)`}
                    />
                  ))}
                  <circle cx="30" cy="30" r="6" fill="rgba(255,240,245,1)" />
                </svg>
              </div>
            </div>

            {/* Small floating card — bottom left */}
            <div
              className="absolute -bottom-4 left-4 lg:-left-8 w-[120px] h-[100px] rounded-2xl overflow-hidden shadow-lg border border-pink-100"
              style={{
                background: "linear-gradient(135deg, #fdf5f0 0%, #fce4ec 60%, #f9a8d4 100%)",
              }}
            >
              <div className="p-4">
                <p className="text-[10px] tracking-[0.15em] uppercase text-rose-500 mb-1 font-normal">{t("about.since")}</p>
                <p className="font-display text-3xl font-semibold" style={{ color: "var(--hanami-rich)" }}>
                  2018
                </p>
                <p className="text-[10px] text-rose-400/80 font-normal mt-0.5">{t("about.craftingLight")}</p>
              </div>
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
              <span className="text-[11px] tracking-[0.18em] uppercase text-pink-500 font-normal">{t("about.label")}</span>
            </div>

            <h2
              className="font-display font-light leading-[1.1] mb-8"
              style={{
                fontSize: "clamp(38px, 5vw, 62px)",
                color: "var(--hanami-deep)",
              }}
            >
              {t("about.heading")}{" "}
              <em className="italic" style={{ color: "var(--hanami-rose)" }}>
                {t("about.headingEm")}
              </em>
            </h2>

            <div className="space-y-5 text-[15px] leading-8 font-normal" style={{ color: "var(--hanami-rich)" }}>
              <p className="opacity-85">{t("about.p1")}</p>
              <p className="opacity-80">{t("about.p2")}</p>
              <p className="opacity-75">{t("about.p3")}</p>
            </div>

            {/* Stats row */}
            <div className="flex gap-10 mt-10 mb-10">
              {[
                { num: t("about.stat1num"), label: t("about.stat1label") },
                { num: t("about.stat2num"), label: t("about.stat2label") },
                { num: t("about.stat3num"), label: t("about.stat3label") },
              ].map(({ num, label }) => (
                <div key={label}>
                  <p
                    className="font-display text-4xl font-semibold leading-none mb-1"
                    style={{ color: "var(--hanami-rose)" }}
                  >
                    {num}
                  </p>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-pink-500/80 font-normal">{label}</p>
                </div>
              ))}
            </div>

            {/* Signature */}
            <div className="flex items-center gap-4 pt-6 border-t border-pink-200/60">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-display font-semibold"
                style={{ background: "var(--hanami-rose)" }}
              >
                H
              </div>
              <div>
                <p className="font-display italic text-xl" style={{ color: "var(--hanami-deep)" }}>
                  Hana Nguyen
                </p>
                <p className="text-[10px] tracking-[0.15em] uppercase text-pink-500/80 font-normal">
                  {t("about.founderTitle")}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
