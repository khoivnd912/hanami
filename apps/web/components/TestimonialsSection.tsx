"use client";

import { useLang } from "@/lib/lang-context";

const TESTIMONIALS = [
  {
    quote:
      "The Hanami lamp sat on our sweetheart table all evening, glowing like a dream. Every guest asked about it. We still have it lit every anniversary.",
    name: "Linh & Minh",
    location: "Hà Nội, 2023",
    floral: "Rose & Lily Collection",
  },
  {
    quote:
      "We wanted something that would outlast the wedding day. Five years later, our Hanami lamp is the first thing we see when we walk into our bedroom.",
    name: "Sophie & James",
    location: "Đà Nẵng, 2021",
    floral: "Cherry Blossom Set",
  },
  {
    quote:
      "Hana listened to every detail — the colour of my dress, the season, even the mood of the venue. The result was beyond anything I could have imagined.",
    name: "Mai Anh & Tuấn",
    location: "TP. Hồ Chí Minh, 2024",
    floral: "Bespoke Peony Lamp",
  },
];

function StarRow() {
  return (
    <div className="flex gap-1 mb-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 0.5L7.55 4.35H11.5L8.4 6.7L9.45 10.75L6 8.5L2.55 10.75L3.6 6.7L0.5 4.35H4.45L6 0.5Z"
            fill="var(--hanami-gold)"
          />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const { t } = useLang();

  return (
    <section
      className="relative py-24 lg:py-32 px-6 overflow-hidden"
      style={{ background: "var(--hanami-dark)" }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(190,24,93,0.18) 0%, rgba(249,168,212,0.10) 50%, transparent 70%)",
        }}
      />

      {/* Large quote mark */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 font-display text-[200px] leading-none pointer-events-none select-none opacity-[0.04]"
        style={{ color: "var(--hanami-pink)" }}
      >
        &ldquo;
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-pink-700" />
            <span className="text-[11px] tracking-[0.18em] uppercase text-pink-500/90 font-normal">
              {t("testimonials.label")}
            </span>
            <div className="h-px w-8 bg-pink-700" />
          </div>
          <h2
            className="font-display font-light leading-tight"
            style={{ fontSize: "clamp(34px, 4.5vw, 56px)", color: "rgba(255,255,255,0.92)" }}
          >
            {t("testimonials.heading")}{" "}
            <em className="italic" style={{ color: "var(--hanami-soft)" }}>
              {t("testimonials.headingEm")}
            </em>
          </h2>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, name, location, floral }) => (
            <div
              key={name}
              className="group relative rounded-2xl px-8 py-9 flex flex-col border transition-all duration-400 hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(236,72,153,0.14)",
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 0%, rgba(236,72,153,0.08) 0%, transparent 65%)",
                }}
              />

              <StarRow />

              <p className="text-[14.5px] leading-8 text-white/80 font-normal flex-1 mb-7 italic">
                &ldquo;{quote}&rdquo;
              </p>

              {/* Divider */}
              <div
                className="h-px mb-6"
                style={{ background: "linear-gradient(to right, rgba(249,168,212,0.50), transparent)" }}
              />

              {/* Attribution */}
              <div>
                <p
                  className="font-display text-lg leading-none mb-1"
                  style={{ color: "var(--hanami-soft)" }}
                >
                  {name}
                </p>
                <p className="text-[10px] tracking-[0.12em] uppercase text-white/60 font-normal mb-2">
                  {location}
                </p>
                <p
                  className="text-[10px] tracking-[0.1em] uppercase font-normal"
                  style={{ color: "var(--hanami-gold)" }}
                >
                  {floral}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
