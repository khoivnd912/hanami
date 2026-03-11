"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatVND } from "@/lib/products";
import { useLang } from "@/lib/lang-context";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  User, Phone, Mail, MapPin, FileText, Package, CheckCircle2,
  ChevronRight, Truck, ShieldCheck, ShoppingBag, ArrowLeft,
  ChevronDown, Banknote, Check, Flower2,
} from "lucide-react";

// ─── Vietnamese Address Types ─────────────────────────────────────────────────

interface VietnamUnit { code: number; name: string }
interface ProvinceDetail extends VietnamUnit { districts: VietnamUnit[] }
interface DistrictDetail extends VietnamUnit { wards:     VietnamUnit[] }

const PROVINCES_API   = "https://provinces.open-api.vn/api/p/";
const PROVINCE_DETAIL = (code: number) => `https://provinces.open-api.vn/api/p/${code}?depth=2`;
const DISTRICT_DETAIL = (code: number) => `https://provinces.open-api.vn/api/d/${code}?depth=2`;

// ─── Flower Thumbnail ─────────────────────────────────────────────────────────

function FlowerThumb({ gradient, imageUrl }: { gradient?: string; imageUrl?: string }) {
  if (imageUrl) {
    return <img src={imageUrl} alt="" className="w-[72px] h-[84px] rounded-xl object-cover flex-shrink-0" />;
  }

  const pts = [
    { x: 18, y: 20, s: 26, r: 15 }, { x: 72, y: 12, s: 18, r: -20 },
    { x: 50, y: 60, s: 30, r: 30 }, { x:  8, y: 60, s: 16, r: 45 },
    { x: 82, y: 52, s: 22, r: -10 },
  ];

  return (
    <div className="relative w-[72px] h-[84px] rounded-xl overflow-hidden flex-shrink-0"
      style={{ background: gradient ?? "radial-gradient(ellipse at 50% 35%, #fff5f7 0%, #fae8ee 18%, #f4b6c2 38%, #e8859a 62%, #c05070 82%, #5c1a30 100%)" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none">
        {pts.map(({ x, y, s, r }, i) => (
          <g key={i} transform={`translate(${x},${y}) rotate(${r}) scale(${s / 40})`} opacity={0.18}>
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse key={a} cx="0" cy="-11" rx="4.5" ry="11" fill="white" transform={`rotate(${a})`} />
            ))}
            <circle cx="0" cy="0" r="4" fill="rgba(255,240,245,0.9)" />
          </g>
        ))}
      </svg>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 65%, rgba(255,235,240,0.4) 0%, transparent 55%)" }} />
    </div>
  );
}

// ─── Reusable UI Atoms ────────────────────────────────────────────────────────

function FieldLabel({ icon, children, required }: { icon: ReactNode; children: ReactNode; required?: boolean }) {
  return (
    <label className="flex items-center gap-2 mb-2">
      <span className="flex-shrink-0" style={{ color: "#d96b82" }}>{icon}</span>
      <span className="text-[11px] tracking-[0.18em] uppercase font-semibold" style={{ color: "#333" }}>
        {children}
      </span>
      {required && <span className="text-[#e8859a] text-xs leading-none ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
      <span className="inline-block w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
      {msg}
    </p>
  );
}

function StyledSelect({
  value, onChange, disabled, placeholder, children,
}: {
  value: string; onChange: (v: string) => void;
  disabled?: boolean; placeholder: string; children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm outline-none transition-all duration-200 font-sans cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          borderColor: value ? "rgba(244,182,194,0.5)" : "#f4b6c2",
          background:  disabled ? "#fef5f7" : "white",
          color:       value ? "#333333" : "#aaa",
          boxShadow:   value ? "0 0 0 3px rgba(244,182,194,0.12)" : "none",
        }}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown
        size={15}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: value ? "#d96b82" : "#ccc" }}
      />
    </div>
  );
}

// ─── Input className shared ───────────────────────────────────────────────────

const inputCls =
  "rounded-xl h-12 text-sm text-[#333] placeholder:text-[#bbb] bg-white " +
  "border-[#f4b6c2]/60 focus-visible:border-[#f4b6c2] focus-visible:ring-2 focus-visible:ring-[#f4b6c2]/20 " +
  "hover:border-[#f4b6c2] transition-all duration-200";

// ─── Form types ───────────────────────────────────────────────────────────────

interface FormState {
  name: string; phone: string; email: string;
  province: string; district: string; ward: string;
  addressDetail: string; note: string; payment: string;
}

const INIT: FormState = {
  name: "", phone: "", email: "", province: "", district: "", ward: "",
  addressDetail: "", note: "", payment: "cod",
};

type Errors = Partial<Record<keyof FormState, string>>;

// ─── Main Component ───────────────────────────────────────────────────────────

export function CheckoutClient() {
  const { items, cartTotal, clearCart } = useCart();
  const { t } = useLang();

  const [form,        setForm]        = useState<FormState>(INIT);
  const [errors,      setErrors]      = useState<Errors>({});
  const [touched,     setTouched]     = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitted,   setSubmitted]   = useState(false);
  const [placing,     setPlacing]     = useState(false);
  const [apiError,    setApiError]    = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const [provinces,        setProvinces]        = useState<VietnamUnit[]>([]);
  const [districts,        setDistricts]        = useState<VietnamUnit[]>([]);
  const [wards,            setWards]            = useState<VietnamUnit[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards,     setLoadingWards]     = useState(false);

  // ── Validation (uses t() so must be inside component) ──────────────────────
  function validate(f: FormState): Errors {
    const e: Errors = {};
    if (!f.name.trim() || f.name.trim().length < 2)
      e.name = t("checkout.errName");
    if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(f.phone.trim()))
      e.phone = t("checkout.errPhone");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
      e.email = t("checkout.errEmail");
    if (!f.province)   e.province   = t("checkout.errProvince");
    if (!f.district)   e.district   = t("checkout.errDistrict");
    if (!f.ward)       e.ward       = t("checkout.errWard");
    if (!f.addressDetail.trim() || f.addressDetail.trim().length < 5)
      e.addressDetail = t("checkout.errAddress");
    return e;
  }

  useEffect(() => {
    fetch(PROVINCES_API)
      .then((r) => r.json())
      .then((data: VietnamUnit[]) => setProvinces(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setDistricts([]); setWards([]);
    setForm((f) => ({ ...f, district: "", ward: "" }));
    if (!form.province) return;
    setLoadingDistricts(true);
    fetch(PROVINCE_DETAIL(Number(form.province)))
      .then((r) => r.json())
      .then((data: ProvinceDetail) => setDistricts(data.districts ?? []))
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDistricts(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.province]);

  useEffect(() => {
    setWards([]);
    setForm((f) => ({ ...f, ward: "" }));
    if (!form.district) return;
    setLoadingWards(true);
    fetch(DISTRICT_DETAIL(Number(form.district)))
      .then((r) => r.json())
      .then((data: DistrictDetail) => setWards(data.wards ?? []))
      .catch(() => setWards([]))
      .finally(() => setLoadingWards(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.district]);

  useEffect(() => {
    if (Object.keys(touched).length > 0) setErrors(validate(form));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, touched]);

  const SHIPPING_FEE = cartTotal >= 1_000_000 ? 0 : 30_000;
  const DISCOUNT     = 0;
  const totalToPay   = cartTotal + SHIPPING_FEE - DISCOUNT;

  const set   = (key: keyof FormState) => (val: string) => setForm((f) => ({ ...f, [key]: val }));
  const touch = (key: keyof FormState) => () => setTouched((t) => ({ ...t, [key]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    const allTouched = Object.keys(INIT).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<keyof FormState, boolean>
    );
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPlacing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
      const res = await fetch(`${apiUrl}/orders/guest`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestEmail: form.email.trim(),
          items:      items.map((i) => ({ productId: i.product.id, qty: i.qty })),
          shippingAddress: {
            name: form.name.trim(), phone: form.phone.trim(),
            province: form.province, provinceName,
            district: form.district, districtName,
            ward: form.ward, wardName,
            detail: form.addressDetail.trim(),
          },
          paymentMethod: form.payment === "bank" ? "bank_transfer" : "cod",
          note: form.note.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (json as { issues?: { message: string }[] }).issues?.[0]?.message
          ?? (json as { error?: string }).error
          ?? t("checkout.errGeneric")
        );
      }
      setOrderNumber((json as { data: { orderNumber: string } }).data.orderNumber ?? "");
      clearCart();
      setSubmitted(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t("checkout.errGeneric"));
    } finally {
      setPlacing(false);
    }
  };

  const provinceName = provinces.find((p) => String(p.code) === form.province)?.name ?? "";
  const districtName = districts.find((d) => String(d.code) === form.district)?.name ?? "";
  const wardName     = wards.find((w) => String(w.code) === form.ward)?.name ?? "";

  // ── Empty / Success views ──────────────────────────────────────────────────
  if (items.length === 0 && !submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center py-20"
        style={{ background: "var(--hanami-ivory)" }}>
        <svg viewBox="0 0 80 80" className="w-20 h-20 mb-6 opacity-20" fill="none">
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="40" cy="18" rx="6" ry="18" fill="var(--hanami-rose)" transform={`rotate(${a} 40 40)`} />
          ))}
          <circle cx="40" cy="40" r="8" fill="var(--hanami-blush)" />
        </svg>
        <h2 className="font-display text-3xl font-semibold mb-3" style={{ color: "#1a1a1a" }}>
          {t("checkout.emptyTitle")}
        </h2>
        <p className="text-sm mb-8" style={{ color: "#666" }}>
          {t("checkout.emptyDesc")}
        </p>
        <Link href="/shop"
          className="flex items-center gap-2 px-7 py-3.5 rounded-full text-[11px] tracking-[0.25em] uppercase font-semibold hover:opacity-90 transition-opacity"
          style={{ background: "#f4b6c2", color: "#333333" }}>
          <ShoppingBag size={13} />
          {t("checkout.exploreCollection")}
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center py-20 animate-fade-up"
        style={{ background: "var(--hanami-ivory)" }}>
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: "radial-gradient(circle at 40% 40%, var(--hanami-blush) 0%, var(--hanami-pale) 60%, white 100%)",
              boxShadow: "0 0 0 8px rgba(244,182,194,0.15), 0 0 0 16px rgba(244,182,194,0.03)",
            }}>
            <CheckCircle2 size={46} style={{ color: "var(--hanami-rose)" }} strokeWidth={1.5} />
          </div>
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <div key={deg} className="absolute w-3 h-5 rounded-full opacity-50"
              style={{
                background: "var(--hanami-soft)",
                top: "50%", left: "50%",
                transformOrigin: "0 -52px",
                transform: `rotate(${deg}deg) translateY(-52px)`,
              }} />
          ))}
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-3 animate-fade-up-1"
          style={{ color: "#1a1a1a" }}>
          {t("checkout.successTitle")}
        </h1>
        <p className="text-base mb-2 animate-fade-up-2" style={{ color: "var(--hanami-rose)" }}>
          {t("checkout.successThanks")} <span className="font-semibold">{form.name}</span> ✿
        </p>
        {orderNumber && (
          <p className="text-xs mb-3 px-4 py-2 rounded-full animate-fade-up-2"
            style={{ background: "rgba(244,182,194,0.10)", color: "#d96b82", border: "1px solid rgba(244,182,194,0.3)" }}>
            {t("checkout.successOrderCode")} <span className="font-semibold tracking-wider">{orderNumber}</span>
          </p>
        )}
        <p className="text-sm max-w-sm leading-7 animate-fade-up-2" style={{ color: "#666" }}>
          {t("checkout.successDesc1")}<br />{t("checkout.successDesc2")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-10 animate-fade-up-3">
          <Link href="/shop"
            className="px-8 py-3.5 rounded-full text-[11px] tracking-[0.25em] uppercase font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: "#f4b6c2", color: "#333333", boxShadow: "0 4px 24px rgba(244,182,194,0.50)" }}>
            <ShoppingBag size={13} />
            {t("checkout.continueShopping")}
          </Link>
          <Link href="/"
            className="px-8 py-3.5 rounded-full text-[11px] tracking-[0.25em] uppercase font-semibold flex items-center justify-center gap-2 hover:bg-pink-50 transition-colors border"
            style={{ borderColor: "rgba(244,182,194,0.50)", color: "#d96b82" }}>
            {t("checkout.backHome")}
          </Link>
        </div>
      </div>
    );
  }

  const PAYMENT_METHODS = [
    {
      id:       "cod",
      label:    t("checkout.codLabel"),
      sublabel: t("checkout.codSublabel"),
      icon:     <Banknote size={18} />,
    },
    {
      id:       "bank",
      label:    t("checkout.bankLabel"),
      sublabel: t("checkout.bankSublabel"),
      icon:     <Package size={18} />,
    },
  ];

  return (
    <div className="min-h-screen pb-20 pt-[76px]" style={{ background: "var(--hanami-ivory)" }}>

      {/* ── Page Header ── */}
      <div className="border-b border-pink-100" style={{ background: "white" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[11px] tracking-wide mb-4" style={{ color: "#aaa" }}>
            <Link href="/"     className="hover:text-[#d96b82] transition-colors">{t("checkout.home")}</Link>
            <ChevronRight size={11} />
            <Link href="/shop" className="hover:text-[#d96b82] transition-colors">{t("checkout.shop")}</Link>
            <ChevronRight size={11} />
            <span style={{ color: "#d96b82" }}>{t("checkout.checkout")}</span>
          </nav>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/shop"
                className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-pink-50 transition-colors"
                style={{ borderColor: "rgba(244,182,194,0.35)", color: "#d96b82" }}>
                <ArrowLeft size={15} />
              </Link>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: "#1a1a1a" }}>
                  {t("checkout.checkout")}
                </h1>
                <p className="text-xs mt-0.5" style={{ color: "#999" }}>
                  {items.length} {t("checkout.items")} · {formatVND(cartTotal)}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-medium" style={{ color: "#888" }}>
              <ShieldCheck size={15} style={{ color: "#f4b6c2" }} />
              {t("checkout.secureCheckout")}
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-Column Layout ── */}
      <form
        onSubmit={handleSubmit} noValidate
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-6 items-start"
      >

        {/* ════ LEFT — Form ════ */}
        <div className="space-y-5">

          {/* Section heading */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(244,182,194,0.15)" }}>
              <FileText size={14} style={{ color: "#d96b82" }} />
            </div>
            <h2 className="font-display text-2xl font-semibold" style={{ color: "#1a1a1a" }}>
              {t("checkout.information")}
            </h2>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-pink-100/80 p-6 sm:p-8"
            style={{ boxShadow: "0 2px 20px rgba(244,182,194,0.10)" }}>

            {/* Name */}
            <div className="mb-5">
              <FieldLabel icon={<User size={13} />} required>{t("checkout.fullName")}</FieldLabel>
              <Input type="text" placeholder="Nguyễn Văn A"
                value={form.name} onChange={(e) => set("name")(e.target.value)} onBlur={touch("name")}
                className={inputCls}
                style={{
                  borderColor: errors.name && touched.name ? "rgb(239,68,68)" : undefined,
                  boxShadow:   errors.name && touched.name ? "0 0 0 3px rgba(239,68,68,0.08)" : undefined,
                }} />
              <FieldError msg={touched.name ? errors.name : undefined} />
            </div>

            {/* Phone + Email */}
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <FieldLabel icon={<Phone size={13} />} required>{t("checkout.phone")}</FieldLabel>
                <Input type="tel" placeholder="0901 234 567"
                  value={form.phone} onChange={(e) => set("phone")(e.target.value.replace(/\s/g, ""))}
                  onBlur={touch("phone")} maxLength={10}
                  className={inputCls}
                  style={{
                    borderColor: errors.phone && touched.phone ? "rgb(239,68,68)" : undefined,
                    boxShadow:   errors.phone && touched.phone ? "0 0 0 3px rgba(239,68,68,0.08)" : undefined,
                  }} />
                <FieldError msg={touched.phone ? errors.phone : undefined} />
              </div>
              <div>
                <FieldLabel icon={<Mail size={13} />} required>{t("checkout.email")}</FieldLabel>
                <Input type="email" placeholder="ten@email.com"
                  value={form.email} onChange={(e) => set("email")(e.target.value)} onBlur={touch("email")}
                  className={inputCls}
                  style={{
                    borderColor: errors.email && touched.email ? "rgb(239,68,68)" : undefined,
                    boxShadow:   errors.email && touched.email ? "0 0 0 3px rgba(239,68,68,0.08)" : undefined,
                  }} />
                <FieldError msg={touched.email ? errors.email : undefined} />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: "#f9d5e2" }} />
              <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase font-medium"
                style={{ color: "#bbb" }}>
                <MapPin size={10} />
                {t("checkout.shippingSection")}
              </div>
              <div className="flex-1 h-px" style={{ background: "#f9d5e2" }} />
            </div>

            {/* Province + District */}
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <FieldLabel icon={<MapPin size={13} />} required>{t("checkout.province")}</FieldLabel>
                <div style={{ outline: errors.province && touched.province ? "3px solid rgba(239,68,68,0.12)" : undefined, borderRadius: 12 }}>
                  <StyledSelect value={form.province}
                    onChange={(v) => { set("province")(v); touch("province")(); }}
                    placeholder={provinces.length === 0 ? t("checkout.loadingProvinces") : t("checkout.selectProvince")}
                    disabled={provinces.length === 0}>
                    {provinces.map((p) => <option key={p.code} value={String(p.code)}>{p.name}</option>)}
                  </StyledSelect>
                </div>
                <FieldError msg={touched.province ? errors.province : undefined} />
              </div>
              <div>
                <FieldLabel icon={<MapPin size={13} />} required>{t("checkout.district")}</FieldLabel>
                <div style={{ outline: errors.district && touched.district ? "3px solid rgba(239,68,68,0.12)" : undefined, borderRadius: 12 }}>
                  <StyledSelect value={form.district}
                    onChange={(v) => { set("district")(v); touch("district")(); }}
                    disabled={!form.province || loadingDistricts}
                    placeholder={!form.province ? t("checkout.selectProvFirst") : loadingDistricts ? t("checkout.loadingDistricts") : t("checkout.selectDistrict")}>
                    {districts.map((d) => <option key={d.code} value={String(d.code)}>{d.name}</option>)}
                  </StyledSelect>
                </div>
                <FieldError msg={touched.district ? errors.district : undefined} />
              </div>
            </div>

            {/* Ward */}
            <div className="mb-5">
              <FieldLabel icon={<MapPin size={13} />} required>{t("checkout.ward")}</FieldLabel>
              <div style={{ outline: errors.ward && touched.ward ? "3px solid rgba(239,68,68,0.12)" : undefined, borderRadius: 12 }}>
                <StyledSelect value={form.ward}
                  onChange={(v) => { set("ward")(v); touch("ward")(); }}
                  disabled={!form.district || loadingWards}
                  placeholder={!form.district ? t("checkout.selectDistFirst") : loadingWards ? t("checkout.loadingWards") : t("checkout.selectWard")}>
                  {wards.map((w) => <option key={w.code} value={String(w.code)}>{w.name}</option>)}
                </StyledSelect>
              </div>
              <FieldError msg={touched.ward ? errors.ward : undefined} />
            </div>

            {/* Address detail */}
            <div className="mb-5">
              <FieldLabel icon={<MapPin size={13} />} required>{t("checkout.addressDetail")}</FieldLabel>
              <Input type="text" placeholder={t("checkout.addressPlaceholder")}
                value={form.addressDetail} onChange={(e) => set("addressDetail")(e.target.value)}
                onBlur={touch("addressDetail")}
                className={inputCls}
                style={{
                  borderColor: errors.addressDetail && touched.addressDetail ? "rgb(239,68,68)" : undefined,
                  boxShadow:   errors.addressDetail && touched.addressDetail ? "0 0 0 3px rgba(239,68,68,0.08)" : undefined,
                }} />
              <FieldError msg={touched.addressDetail ? errors.addressDetail : undefined} />

              {wardName && (
                <p className="mt-2 text-[11px] leading-5 px-3 py-2 rounded-lg font-normal"
                  style={{ background: "rgba(244,182,194,0.06)", color: "#666", border: "1px solid rgba(244,182,194,0.18)" }}>
                  <span className="mr-1" style={{ color: "#f4b6c2" }}>✦</span>
                  {form.addressDetail ? `${form.addressDetail}, ` : ""}{wardName}, {districtName}, {provinceName}
                </p>
              )}
            </div>

            {/* Note */}
            <div>
              <FieldLabel icon={<FileText size={13} />}>{t("checkout.orderNote")}</FieldLabel>
              <Textarea
                placeholder={t("checkout.orderNotePlaceholder")}
                value={form.note} onChange={(e) => set("note")(e.target.value)}
                className="rounded-xl text-sm resize-none text-[#333] placeholder:text-[#bbb] bg-white border-[#f4b6c2]/50 focus-visible:border-[#f4b6c2] focus-visible:ring-2 focus-visible:ring-[#f4b6c2]/20 hover:border-[#f4b6c2] transition-all duration-200"
                rows={3} />
              <p className="mt-1.5 text-[11px] font-normal" style={{ color: "#aaa" }}>
                {t("checkout.orderNoteHint")}
              </p>
            </div>
          </div>

          {/* Trust indicators (mobile) */}
          <div className="flex lg:hidden items-center justify-center gap-6 py-2">
            {[
              { icon: <ShieldCheck size={14} />, label: t("checkout.trustSecureFull") },
              { icon: <Truck size={14} />,       label: t("checkout.trustDelivery")   },
              { icon: <Flower2 size={14} />,     label: t("checkout.trustAuthentic")  },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: "#888" }}>
                <span style={{ color: "#f4b6c2" }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ════ RIGHT — Summary (Sticky) ════ */}
        <div className="lg:sticky lg:top-28 space-y-4">

          {/* Section heading */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(244,182,194,0.15)" }}>
              <ShoppingBag size={14} style={{ color: "#d96b82" }} />
            </div>
            <h2 className="font-display text-2xl font-semibold" style={{ color: "#1a1a1a" }}>
              {t("checkout.orderSummary")}
            </h2>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-pink-100/80 overflow-hidden"
            style={{ boxShadow: "0 2px 20px rgba(244,182,194,0.10)" }}>

            {/* Product list */}
            <div className="p-5 space-y-3">
              {items.map(({ product, qty }) => (
                <div key={product.id}
                  className="flex gap-4 items-start p-3 rounded-xl transition-colors hover:bg-pink-50/40"
                  style={{ border: "1px solid rgba(244,182,194,0.12)" }}>
                  <FlowerThumb gradient={product.gradient} imageUrl={product.imageUrl} />
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="font-display text-base font-semibold leading-snug mb-0.5 truncate"
                      style={{ color: "#1a1a1a" }}>
                      {product.nameVi}
                    </p>
                    <p className="text-[10px] tracking-wide mb-2 font-normal" style={{ color: "#aaa" }}>
                      {product.nameEn}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                        style={{ background: "rgba(244,182,194,0.12)", color: "#d96b82" }}>
                        x{qty}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "#d96b82" }}>
                        {formatVND(product.price * qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="px-5 py-4 space-y-2.5"
              style={{ borderTop: "1px dashed rgba(244,182,194,0.35)", background: "rgba(254,245,247,0.5)" }}>
              <div className="flex justify-between items-center text-sm">
                <span className="font-normal" style={{ color: "#666" }}>{t("checkout.subtotal")}</span>
                <span className="font-medium" style={{ color: "#333" }}>{formatVND(cartTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-1.5 font-normal" style={{ color: "#666" }}>
                  <Truck size={12} className="opacity-60" />
                  {t("checkout.shipping")}
                </span>
                {SHIPPING_FEE === 0 ? (
                  <span className="text-emerald-600 text-xs font-semibold">{t("checkout.free")}</span>
                ) : (
                  <span className="font-medium" style={{ color: "#333" }}>{formatVND(SHIPPING_FEE)}</span>
                )}
              </div>
              {SHIPPING_FEE > 0 && (
                <p className="text-[10px] pl-5 font-normal" style={{ color: "#999" }}>
                  {t("checkout.freeShippingNote")} {formatVND(1_000_000)}
                </p>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="font-normal" style={{ color: "#666" }}>{t("checkout.discount")}</span>
                <span style={{ color: DISCOUNT > 0 ? "#d96b82" : "#aaa" }}>
                  {DISCOUNT > 0 ? `– ${formatVND(DISCOUNT)}` : "—"}
                </span>
              </div>
              <div className="h-px" style={{ background: "rgba(244,182,194,0.2)" }} />
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-semibold" style={{ color: "#333" }}>{t("checkout.total")}</span>
                <span className="font-display text-2xl font-bold" style={{ color: "#d96b82" }}>
                  {formatVND(totalToPay)}
                </span>
              </div>
            </div>

            {/* Payment method */}
            <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(244,182,194,0.15)" }}>
              <p className="text-[10px] tracking-[0.2em] uppercase mb-3 font-semibold" style={{ color: "#d96b82" }}>
                {t("checkout.paymentMethod")}
              </p>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => {
                  const active = form.payment === m.id;
                  return (
                    <label key={m.id}
                      className="flex items-start gap-3 rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none"
                      style={{
                        border: `1.5px solid ${active ? "rgba(244,182,194,0.55)" : "rgba(244,182,194,0.25)"}`,
                        background: active ? "rgba(244,182,194,0.06)" : "transparent",
                        boxShadow:  active ? "0 0 0 3px rgba(244,182,194,0.12)" : "none",
                      }}>
                      <div className="mt-0.5 flex-shrink-0">
                        <input type="radio" name="payment" value={m.id}
                          checked={active} onChange={() => set("payment")(m.id)} className="sr-only" />
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                          style={{ borderColor: active ? "#f4b6c2" : "#ddd" }}>
                          {active && <div className="w-2 h-2 rounded-full" style={{ background: "#f4b6c2" }} />}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: active ? "rgba(244,182,194,0.12)" : "#fef5f7",
                          color:      active ? "#d96b82" : "#bbb",
                        }}>
                        {m.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight"
                          style={{ color: active ? "#1a1a1a" : "#555" }}>
                          {m.label}
                        </p>
                        <p className="text-[10px] mt-0.5 font-normal" style={{ color: "#999" }}>
                          {m.sublabel}
                        </p>
                      </div>
                      {active && <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#f4b6c2" }} />}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="mx-5 mb-3 px-4 py-3 rounded-xl text-sm font-medium text-red-700 border border-red-200"
                style={{ background: "rgba(239,68,68,0.05)" }}>
                {apiError}
              </div>
            )}

            {/* Place Order Button */}
            <div className="px-5 pb-5 pt-2">
              <button
                type="submit" disabled={placing}
                className="w-full h-[54px] rounded-full text-[11px] tracking-[0.3em] uppercase font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 relative overflow-hidden disabled:opacity-80"
                style={{
                  background: placing ? "linear-gradient(135deg, #f19cad 0%, #e8859a 100%)" : "#f4b6c2",
                  boxShadow:  placing ? "none" : "0 6px 28px rgba(244,182,194,0.35)",
                  color: "#333333",
                }}>
                {!placing && (
                  <span className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%)",
                      animation: "shimmer-sweep 2.5s ease-in-out infinite",
                    }} />
                )}
                {placing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" style={{ color: "#333" }}>
                      <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    {t("checkout.placing")}
                  </>
                ) : (
                  <>
                    <Package size={14} />
                    {t("checkout.placeOrder")}
                    <ChevronRight size={14} />
                  </>
                )}
              </button>

              <p className="text-center text-[10px] mt-3 flex items-center justify-center gap-1.5 font-normal"
                style={{ color: "#aaa" }}>
                <ShieldCheck size={11} style={{ color: "#f4b6c2" }} />
                {t("checkout.securityNote")}
              </p>
            </div>
          </div>

          {/* Trust indicators (desktop) */}
          <div className="hidden lg:grid grid-cols-3 gap-2">
            {[
              { icon: <ShieldCheck size={14} />, label: t("checkout.trustSecure")      },
              { icon: <Truck size={14} />,       label: t("checkout.trustNationwide")  },
              { icon: <Flower2 size={14} />,     label: t("checkout.trustHandcrafted") },
            ].map(({ icon, label }) => (
              <div key={label}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-center"
                style={{ background: "white", border: "1px solid rgba(244,182,194,0.15)" }}>
                <span style={{ color: "#f4b6c2" }}>{icon}</span>
                <span className="text-[10px] tracking-wide font-medium" style={{ color: "#888" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
