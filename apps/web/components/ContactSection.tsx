"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Instagram, Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useLang } from "@/lib/lang-context";

const UI_STRINGS = {
  en: {
    formTitle:    "Flower Consultation",
    formSubtitle: "All fields help us prepare a personalised proposal for you.",
    dateOptional: "(optional)",
  },
  vi: {
    formTitle:    "Yêu Cầu Tư Vấn Hoa",
    formSubtitle: "Mỗi thông tin giúp chúng tôi chuẩn bị bản đề xuất cá nhân hoá cho bạn.",
    dateOptional: "(không bắt buộc)",
  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export function ContactSection() {
  const { lang, t } = useLang();
  const ui = UI_STRINGS[lang];
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name:         "",
    email:        "",
    deliveryDate: "",
    message:      "",
  });

  const CONTACT_DETAILS = [
    { icon: MapPin,    labelKey: "contact.studioLabel",       value: "12 Hoa Hồng Lane, Tây Hồ District, Hà Nội" },
    { icon: Phone,     labelKey: "contact.phoneLabel",        value: "+84 90 123 4567" },
    { icon: Mail,      labelKey: "contact.emailContactLabel", value: "hello@hanamiflower.vn" },
    { icon: Instagram, labelKey: "contact.instagramLabel",    value: "@hanamiflower.vn" },
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
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Gửi thất bại, vui lòng thử lại.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  /* Shared input className */
  const inputCls =
    "h-11 bg-white border-pink-200 shadow-sm text-gray-800 placeholder:text-gray-400 " +
    "focus-visible:border-pink-400 focus-visible:ring-2 focus-visible:ring-pink-300/50 " +
    "hover:border-pink-300 transition-colors duration-200";

  return (
    <section
      id="contact"
      className="relative py-24 lg:py-32 px-6 overflow-hidden"
      style={{ background: "var(--hanami-pale)" }}
    >
      {/* Background floral */}
      <div
        className="absolute -left-24 bottom-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-[0.07]"
        style={{ background: "radial-gradient(circle, #f9a8d4 0%, transparent 70%)" }}
      />
      <div
        className="absolute -right-16 top-0 w-[320px] h-[320px] rounded-full pointer-events-none opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #db2777 0%, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-pink-300" />
            <span className="text-[11px] tracking-[0.18em] uppercase text-pink-500 font-medium">
              {t("contact.label")}
            </span>
            <div className="h-px w-10 bg-pink-300" />
          </div>
          <h2
            className="font-display font-light leading-tight mb-4"
            style={{ fontSize: "clamp(36px, 5vw, 58px)", color: "var(--hanami-deep)" }}
          >
            {t("contact.heading")}{" "}
            <em className="italic" style={{ color: "var(--hanami-rose)" }}>
              {t("contact.headingEm")}
            </em>
          </h2>
          <p className="text-sm font-normal leading-7 text-gray-500 max-w-[380px]">
            {t("contact.desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">

          {/* ── Form ── */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div
                className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-pink-100 shadow-sm"
                style={{ background: "white" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                  style={{ background: "linear-gradient(135deg, #fce4ec 0%, #fbcfe8 100%)" }}
                >
                  <CheckCircle2 size={30} className="text-pink-500" strokeWidth={1.8} />
                </div>
                <h3
                  className="font-display text-3xl font-light mb-3"
                  style={{ color: "var(--hanami-deep)" }}
                >
                  {t("contact.thankYouTitle")}
                </h3>
                <p className="text-sm font-normal text-gray-500 max-w-[300px] leading-7">
                  {t("contact.thankYouDesc")}
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-pink-100 p-8 lg:p-10 shadow-[0_2px_24px_rgba(236,72,153,0.08)]"
                style={{ background: "white" }}
              >
                {/* Form heading */}
                <div className="mb-8 pb-6 border-b border-pink-100">
                  <h3
                    className="font-display text-xl font-light mb-1"
                    style={{ color: "var(--hanami-deep)" }}
                  >
                    {ui.formTitle}
                  </h3>
                  <p className="text-xs text-gray-400 font-normal tracking-wide">
                    {ui.formSubtitle}
                  </p>
                </div>

                {/* Error banner */}
                {error && (
                  <div className="flex items-center gap-2.5 mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                    <AlertCircle size={15} className="flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs tracking-[0.08em] uppercase text-gray-600 font-semibold block">
                      {t("contact.nameLabel")}
                      <span className="text-pink-400 ml-1">*</span>
                    </label>
                    <Input
                      required
                      placeholder="Nguyễn Mai Anh"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs tracking-[0.08em] uppercase text-gray-600 font-semibold block">
                      {t("contact.emailLabel")}
                      <span className="text-pink-400 ml-1">*</span>
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Delivery date */}
                <div className="space-y-2 mb-6">
                  <label className="text-xs tracking-[0.08em] uppercase text-gray-600 font-semibold block">
                    {t("contact.dateLabel")}
                    <span className="text-gray-400 text-[10px] normal-case ml-2 font-normal tracking-normal">
                      {ui.dateOptional}
                    </span>
                  </label>
                  <Input
                    type="date"
                    value={form.deliveryDate}
                    onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                    className={inputCls}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2 mb-8">
                  <label className="text-xs tracking-[0.08em] uppercase text-gray-600 font-semibold block">
                    {t("contact.messageLabel")}
                    <span className="text-pink-400 ml-1">*</span>
                  </label>
                  <Textarea
                    required
                    rows={5}
                    placeholder={t("contact.messagePlaceholder")}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={
                      "bg-white border-pink-200 shadow-sm text-gray-800 placeholder:text-gray-400 " +
                      "focus-visible:border-pink-400 focus-visible:ring-2 focus-visible:ring-pink-300/50 " +
                      "hover:border-pink-300 transition-colors duration-200 resize-none"
                    }
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 text-xs tracking-[0.14em] uppercase font-semibold rounded-full text-white transition-all duration-300 hover:shadow-[0_6px_32px_rgba(219,39,119,0.45)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
                  style={{
                    background: "linear-gradient(135deg, #f472b6 0%, #db2777 55%, #be185d 100%)",
                    boxShadow: "0 4px 20px rgba(219,39,119,0.35)",
                  }}
                >
                  {submitting ? (
                    <><Loader2 size={14} className="mr-2.5 animate-spin" />Đang gửi…</>
                  ) : (
                    <><Send size={14} className="mr-2.5" />{t("contact.sendButton")}</>
                  )}
                </Button>

                <p className="text-center text-[11px] text-gray-400 font-normal mt-5 tracking-wide">
                  {t("contact.responseNote")}
                </p>
              </form>
            )}
          </div>

          {/* ── Contact Info ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Decorative lamp motif */}
            <div
              className="w-full h-[180px] rounded-2xl overflow-hidden relative"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 40%, #fce4ec 0%, #f9a8d4 35%, #db2777 70%, #3d0b22 100%)",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-24 h-24 opacity-25" fill="none">
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                    <ellipse
                      key={angle}
                      cx="50"
                      cy="22"
                      rx="10"
                      ry="22"
                      fill="white"
                      transform={`rotate(${angle} 50 50)`}
                    />
                  ))}
                  <circle cx="50" cy="50" r="10" fill="rgba(255,240,245,0.9)" />
                </svg>
              </div>
              <div
                className="absolute bottom-0 inset-x-0 px-6 py-4"
                style={{ background: "linear-gradient(to top, rgba(61,11,34,0.7), transparent)" }}
              >
                <p className="text-white text-[11px] tracking-[0.15em] uppercase font-medium text-center">
                  {t("contact.visitStudio")}
                </p>
              </div>
            </div>

            {/* Contact details list */}
            <div className="space-y-5">
              {CONTACT_DETAILS.map(({ icon: Icon, labelKey, value }) => (
                <div key={labelKey} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: "rgba(249,168,212,0.18)",
                      border: "1px solid rgba(249,168,212,0.45)",
                    }}
                  >
                    <Icon size={15} style={{ color: "var(--hanami-rose)" }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.12em] uppercase text-gray-400 font-semibold mb-1">
                      {t(labelKey)}
                    </p>
                    <p className="text-sm text-gray-700 font-normal leading-6">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Hours */}
            <div
              className="rounded-xl px-6 py-5 border border-pink-100 shadow-sm"
              style={{ background: "white" }}
            >
              <p className="text-[10px] tracking-[0.14em] uppercase text-gray-500 font-semibold mb-4">
                {t("contact.studioHours")}
              </p>
              {[
                { daysKey: "contact.monFri", hours: "9:00 – 18:00" },
                { daysKey: "contact.saturday", hours: "9:00 – 16:00" },
                { daysKey: "contact.sunday", hoursKey: "contact.byAppointment" },
              ].map(({ daysKey, hours, hoursKey }) => (
                <div key={daysKey} className="flex justify-between items-center py-2 border-b border-pink-50 last:border-0">
                  <span className="text-xs font-normal text-gray-600">{t(daysKey)}</span>
                  <span className="text-xs font-semibold" style={{ color: "var(--hanami-rose)" }}>
                    {hoursKey ? t(hoursKey) : hours}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
