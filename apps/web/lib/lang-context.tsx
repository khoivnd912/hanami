"use client";

import {
  createContext, useContext, useState, useEffect, startTransition,
  type ReactNode,
} from "react";
import { translations, type Lang } from "./translations";

// ─── Types ─────────────────────────────────────────────────────────────────

interface LangCtx {
  lang:    Lang;
  setLang: (l: Lang) => void;
  t:       (key: string) => string;
}

// ─── Context ────────────────────────────────────────────────────────────────

const LangContext = createContext<LangCtx | null>(null);

const STORAGE_KEY  = "hanami-lang";
const DEFAULT_LANG: Lang = "vi";
const VALID_LANGS  = new Set(Object.keys(translations));

// ─── Provider ───────────────────────────────────────────────────────────────

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && VALID_LANGS.has(stored)) startTransition(() => setLangState(stored as Lang));
    } catch {/* ignore */}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {/* ignore */}
  };

  // Dotted-path lookup: "hero.tagline" → translations[lang].hero.tagline
  const t = (key: string): string => {
    const parts = key.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: any = translations[lang];
    for (const p of parts) {
      if (obj && typeof obj === "object" && p in obj) {
        obj = obj[p];
      } else {
        return key; // fallback to raw key
      }
    }
    return typeof obj === "string" ? obj : key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useLang(): LangCtx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
