"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Facebook, Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useLang } from "@/lib/lang-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContactInfo {
  address:  string;
  phone:    string;
  email:    string;
  facebook: string;
  hoursMF:  string;
  hoursSat:  string;
  hoursSun:  string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT: ContactInfo = {
  address:   "12 Hoa Hồng Lane, Tây Hồ District, Hà Nội",
  phone:     "+84 90 123 4567",
  email:     "hello@hanamiflower.vn",
  facebook:  "Hanami Flower",
  hoursMF:   "9:00 – 18:00",
  hoursSat:  "9:00 – 16:00",
  hoursSun:  "",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

// ─── Section client ───────────────────────────────────────────────────────────

export function ContactSectionClient({ info, facebookUrl = "" }: { info: ContactInfo | null; facebookUrl?: string }) {
  const { t } = useLang();

  const c = info ?? DEFAULT;

  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [form, setForm] = useState({ name: "", email: "", deliveryDate: "", message: "" });

  const CONTACT_DETAILS = [
    { icon: MapPin,   labelKey: "contact.studioLabel",       value: c.address,  href: undefined },
    { icon: Phone,    labelKey: "contact.phoneLabel",        value: c.phone,    href: `tel:${c.phone.replace(/\s/g, "")}` },
    { icon: Mail,     labelKey: "contact.emailContactLabel", value: c.email,    href: `mailto:${c.email}` },
    { icon: Facebook, labelKey: "contact.facebookLabel",     value: c.facebook, href: facebookUrl || (c.facebook.startsWith("http") ? c.facebook : "") },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/consultations`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:         form.name,
          email:        form.email,
          deliveryDate: form.deliveryDate || undefined,
          message:      form.message,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? t("contact.sendError"));
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("contact.sendError"));
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "h-11 bg-white border-pink-200 shadow-sm text-gray-800 placeholder:text-gray-400 " +
    "focus-visible:border-pink-400 focus-visible:ring-2 focus-visible:ring-pink-300/50 " +
    "hover:border-pink-300 transition-colors duration-200";

  return (
    <section
      id="contact"
      className="relative py-16 lg:py-32 px-6 overflow-hidden"
      style={{ background: "var(--hanami-pale)" }}
    >
      <div className="absolute -left-24 bottom-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-[0.07]"
        style={{ background: "radial-gradient(circle, #f4b6c2 0%, transparent 70%)" }} />
      <div className="absolute -right-16 top-0 w-[320px] h-[320px] rounded-full pointer-events-none opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #d96b82 0%, transparent 70%)" }} />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-pink-300" />
            <span className="text-[11px] tracking-[0.18em] uppercase text-pink-500 font-medium">{t("contact.label")}</span>
            <div className="h-px w-10 bg-pink-300" />
          </div>
          <h2 className="font-display font-semibold leading-tight mb-4"
            style={{ fontSize: "clamp(36px, 5vw, 58px)", color: "#1a1a1a" }}>
            {t("contact.heading")}{" "}
            <em className="italic" style={{ color: "var(--hanami-rose)" }}>{t("contact.headingEm")}</em>
          </h2>
          <p className="text-sm font-normal leading-7 text-gray-500 max-w-[380px]">{t("contact.desc")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">

          {/* ── Form ── */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-pink-100 shadow-sm" style={{ background: "white" }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                  style={{ background: "linear-gradient(135deg, #fae8ee 0%, #f9d5e2 100%)" }}>
                  <CheckCircle2 size={30} className="text-pink-500" strokeWidth={1.8} />
                </div>
                <h3 className="font-display text-3xl font-semibold mb-3" style={{ color: "#1a1a1a" }}>
                  {t("contact.thankYouTitle")}
                </h3>
                <p className="text-sm font-normal text-gray-500 max-w-[300px] leading-7">{t("contact.thankYouDesc")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-pink-100 p-5 sm:p-8 lg:p-10 shadow-[0_2px_24px_rgba(244,182,194,0.08)]" style={{ background: "white" }}>
                <div className="mb-8 pb-6 border-b border-pink-100">
                  <h3 className="font-display text-xl font-semibold mb-1" style={{ color: "#1a1a1a" }}>{t("contact.formTitle")}</h3>
                  <p className="text-xs text-gray-400 font-normal tracking-wide">{t("contact.formSubtitle")}</p>
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                    <AlertCircle size={15} className="flex-shrink-0" />{error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs tracking-[0.08em] uppercase text-gray-600 font-semibold block">
                      {t("contact.nameLabel")}<span className="text-pink-400 ml-1">*</span>
                    </label>
                    <Input required placeholder="Nguyễn Văn A" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs tracking-[0.08em] uppercase text-gray-600 font-semibold block">
                      {t("contact.emailLabel")}<span className="text-pink-400 ml-1">*</span>
                    </label>
                    <Input required type="email" placeholder="you@example.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <label className="text-xs tracking-[0.08em] uppercase text-gray-600 font-semibold block">
                    {t("contact.dateLabel")}
                    <span className="text-gray-400 text-[10px] normal-case ml-2 font-normal tracking-normal">{t("contact.dateOptional")}</span>
                  </label>
                  <Input type="date" value={form.deliveryDate}
                    onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} className={inputCls} />
                </div>

                <div className="space-y-2 mb-8">
                  <label className="text-xs tracking-[0.08em] uppercase text-gray-600 font-semibold block">
                    {t("contact.messageLabel")}<span className="text-pink-400 ml-1">*</span>
                  </label>
                  <Textarea required rows={5} placeholder={t("contact.messagePlaceholder")} value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="bg-white border-pink-200 shadow-sm text-gray-800 placeholder:text-gray-400 focus-visible:border-pink-400 focus-visible:ring-2 focus-visible:ring-pink-300/50 hover:border-pink-300 transition-colors duration-200 resize-none" />
                </div>

                <Button type="submit" disabled={submitting}
                  className="w-full h-12 text-xs tracking-[0.14em] uppercase font-semibold rounded-full text-white transition-all duration-300 hover:shadow-[0_6px_32px_rgba(244,182,194,0.45)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
                  style={{ background: "#f4b6c2", color: "#333333", boxShadow: "0 4px 20px rgba(244,182,194,0.35)" }}>
                  {submitting
                    ? <><Loader2 size={14} className="mr-2.5 animate-spin" />Đang gửi…</>
                    : <><Send size={14} className="mr-2.5" />{t("contact.sendButton")}</>}
                </Button>

                <p className="text-center text-[11px] text-gray-400 font-normal mt-5 tracking-wide">
                  {t("contact.responseNote")}
                </p>
              </form>
            )}
          </div>

          {/* ── Contact Info ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Embedded Google Maps */}
            <div className="rounded-2xl overflow-hidden border border-pink-100 shadow-sm">
              <iframe
                title="Hanami location"
                src={`https://www.google.com/maps?q=${encodeURIComponent(c.address)}&output=embed`}
                width="100%"
                height="220"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 text-[11px] tracking-[0.15em] uppercase font-medium transition-colors duration-200 bg-white hover:bg-pink-50"
                style={{ color: "var(--hanami-rose)" }}
              >
                <MapPin size={11} />
                {t("contact.visitStudio")}
              </a>
            </div>

            {/* Contact details */}
            <div className="space-y-5">
              {CONTACT_DETAILS.map(({ icon: Icon, labelKey, value, href }) => (
                <div key={labelKey} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(244,182,194,0.18)", border: "1px solid rgba(244,182,194,0.45)" }}>
                    <Icon size={15} style={{ color: "var(--hanami-rose)" }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.12em] uppercase text-gray-400 font-semibold mb-1">{t(labelKey)}</p>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-normal leading-6 transition-colors duration-200 hover:underline"
                        style={{ color: "var(--hanami-rose)" }}>
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-700 font-normal leading-6">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Hours */}
            <div className="rounded-xl px-6 py-5 border border-pink-100 shadow-sm" style={{ background: "white" }}>
              <p className="text-[10px] tracking-[0.14em] uppercase text-gray-500 font-semibold mb-4">
                {t("contact.studioHours")}
              </p>
              {[
                { label: t("contact.monFri"),    hours: c.hoursMF  || "9:00 – 18:00" },
                { label: t("contact.saturday"),  hours: c.hoursSat || "9:00 – 16:00" },
                { label: t("contact.sunday"),    hours: c.hoursSun || t("contact.byAppointment") },
              ].map(({ label, hours }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-pink-50 last:border-0">
                  <span className="text-xs font-normal text-gray-600">{label}</span>
                  <span className="text-xs font-semibold" style={{ color: "var(--hanami-rose)" }}>{hours}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
