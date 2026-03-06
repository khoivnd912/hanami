"use client";

import { Sparkles, Flower2, Heart } from "lucide-react";
import { useLang } from "@/lib/lang-context";

export function FeaturesSection() {
  const { t } = useLang();

  const FEATURES = [
    {
      icon:   Sparkles,
      title:  t("features.feature1Title"),
      desc:   t("features.feature1Desc"),
      accent: "#f9a8d4",
    },
    {
      icon:   Flower2,
      title:  t("features.feature2Title"),
      desc:   t("features.feature2Desc"),
      accent: "#db2777",
    },
    {
      icon:   Heart,
      title:  t("features.feature3Title"),
      desc:   t("features.feature3Desc"),
      accent: "#831843",
    },
  ];

  return (
    <section
      className="relative py-20 px-6"
      style={{ background: "var(--hanami-pale)" }}
    >
      {/* Subtle grain */}
      <div
        className="absolute inset-0 opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Section label */}
        <div className="flex items-center justify-center gap-3 mb-14">
          <div className="h-px w-10 bg-pink-300" />
          <span className="text-[11px] tracking-[0.18em] uppercase text-pink-500 font-normal">
            {t("features.label")}
          </span>
          <div className="h-px w-10 bg-pink-300" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-pink-200/40 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(236,72,153,0.07)]">
          {FEATURES.map(({ icon: Icon, title, desc, accent }) => (
            <div
              key={title}
              className="group relative bg-white/70 backdrop-blur-sm px-10 py-12 flex flex-col items-center text-center hover:bg-white transition-colors duration-300"
            >
              {/* Icon ring */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `radial-gradient(circle, ${accent}18 0%, ${accent}08 100%)`,
                  border: `1px solid ${accent}28`,
                }}
              >
                <Icon size={22} style={{ color: accent }} strokeWidth={1.5} />
              </div>

              <h3
                className="font-display text-2xl font-medium mb-3 leading-snug"
                style={{ color: "var(--hanami-deep)" }}
              >
                {title}
              </h3>
              <p className="text-sm leading-7 text-pink-900/70 font-normal max-w-[260px]">
                {desc}
              </p>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-16 transition-all duration-500 rounded-full"
                style={{ background: accent }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
