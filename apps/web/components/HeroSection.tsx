"use client";

import { ChevronDown } from "lucide-react";
import { useLang } from "@/lib/lang-context";

/* Fixed petal positions — avoids SSR/hydration mismatch */
const PETALS = [
  { left: "4%",  size: 11, dur: 11, delay: 0   },
  { left: "12%", size:  8, dur: 14, delay: 2.5  },
  { left: "22%", size: 15, dur: 10, delay: 1    },
  { left: "33%", size:  9, dur: 12, delay: 3.5  },
  { left: "42%", size: 13, dur:  9, delay: 0.5  },
  { left: "53%", size:  7, dur: 13, delay: 4    },
  { left: "61%", size: 16, dur: 11, delay: 1.5  },
  { left: "70%", size: 10, dur: 10, delay: 2    },
  { left: "79%", size: 12, dur: 12, delay: 0    },
  { left: "88%", size:  8, dur: 14, delay: 3    },
  { left: "94%", size: 14, dur:  9, delay: 5    },
  { left: "7%",  size:  9, dur: 15, delay: 6    },
];

export function HeroSection() {
  const { t } = useLang();

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "var(--hanami-dark)" }}
    >
      {/* ── Atmospheric Glow Orbs ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute glow-orb rounded-full"
          style={{
            top: "5%", left: "-5%",
            width: "55vw", height: "55vw",
            maxWidth: 700, maxHeight: 700,
            background: "radial-gradient(circle, rgba(190,24,93,0.32) 0%, rgba(190,24,93,0.08) 45%, transparent 70%)",
            animationDuration: "5s",
          }}
        />
        <div
          className="absolute glow-orb rounded-full"
          style={{
            bottom: "-5%", right: "-5%",
            width: "45vw", height: "45vw",
            maxWidth: 560, maxHeight: 560,
            background: "radial-gradient(circle, rgba(236,72,153,0.22) 0%, rgba(249,168,212,0.15) 45%, transparent 70%)",
            animationDuration: "7s",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60vw", height: "60vw",
            maxWidth: 750, maxHeight: 750,
            background: "radial-gradient(circle, rgba(249,168,212,0.06) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px",
          }}
        />
      </div>

      {/* ── Floating Petals ── */}
      {PETALS.map((p, i) => (
        <div
          key={i}
          className="petal"
          style={{
            left: p.left,
            bottom: "-12px",
            width: p.size,
            height: p.size,
            background: `rgba(249,168,212,${0.35 + (i % 4) * 0.12})`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${i * 31}deg)`,
          }}
        />
      ))}

      {/* ── Large Background Floral SVG ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          viewBox="0 0 500 500"
          className="w-[80vw] h-[80vw] max-w-[700px] max-h-[700px] opacity-[0.04] spin-slow"
          fill="none"
        >
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
            <ellipse
              key={angle}
              cx="250"
              cy="140"
              rx="38"
              ry="105"
              fill="rgba(249,168,212,1)"
              transform={`rotate(${angle} 250 250)`}
            />
          ))}
          <circle cx="250" cy="250" r="36" fill="rgba(252,231,243,1)" />
        </svg>
      </div>

      {/* ── Hero Content ── */}
      <div className="relative z-10 text-center px-6 max-w-[1000px] mx-auto">
        {/* Eyebrow */}
        <p className="animate-fade-up text-[11px] tracking-[0.2em] uppercase text-pink-200/90 mb-7 font-normal">
          {t("hero.eyebrow")}
        </p>

        {/* Japanese title — outlined ghost text */}
        <div className="overflow-hidden mb-1">
          <h1
            className="animate-fade-up-1 font-display leading-none tracking-tight select-none"
            style={{
              fontSize: "clamp(72px, 18vw, 200px)",
              WebkitTextStroke: "1px rgba(249,168,212,0.70)",
              color: "transparent",
              letterSpacing: "-0.01em",
            }}
          >
            花見
          </h1>
        </div>

        {/* English brand name */}
        <div className="overflow-hidden mb-6">
          <h2
            className="animate-fade-up-1 font-display font-light text-white leading-none"
            style={{
              fontSize: "clamp(42px, 9vw, 108px)",
              letterSpacing: "0.12em",
            }}
          >
            Hanami
          </h2>
        </div>

        {/* Ornamental divider */}
        <div className="animate-fade-up-2 flex items-center justify-center gap-4 mb-7">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-pink-500/60" />
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-pink-400 opacity-80">
            <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" fill="currentColor" />
          </svg>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-pink-500/60" />
        </div>

        {/* Tagline */}
        <p
          className="animate-fade-up-2 text-white/90 font-normal mb-2"
          style={{ fontSize: "clamp(15px, 2.5vw, 22px)", letterSpacing: "0.04em" }}
        >
          {t("hero.tagline")}
        </p>
        <p
          className="animate-fade-up-2 text-white/70 font-normal mb-12 tracking-[0.12em] uppercase"
          style={{ fontSize: "clamp(11px, 1.4vw, 13px)" }}
        >
          {t("hero.subtitle")}
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-up-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#gallery"
            className="group relative overflow-hidden px-10 py-4 rounded-full text-xs tracking-[0.12em] uppercase font-medium text-white transition-all duration-300 shadow-[0_4px_30px_rgba(249,168,212,0.50)]"
            style={{
              background: "linear-gradient(135deg, #f9a8d4 0%, #db2777 100%)",
            }}
          >
            <span className="relative z-10">{t("hero.viewCollection")}</span>
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "linear-gradient(135deg, #f472b6 0%, #e11d48 100%)" }}
            />
          </a>
          <a
            href="#about"
            className="px-10 py-4 rounded-full text-xs tracking-[0.12em] uppercase font-medium border border-white/30 text-white/85 hover:border-pink-300/70 hover:text-pink-200 transition-all duration-300"
          >
            {t("hero.ourStory")}
          </a>
        </div>
      </div>

      {/* ── Scroll Indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 animate-fade-up-4">
        <span className="text-[10px] tracking-[0.15em] uppercase">{t("hero.scroll")}</span>
        <ChevronDown size={14} className="animate-bounce" />
      </div>
    </section>
  );
}
