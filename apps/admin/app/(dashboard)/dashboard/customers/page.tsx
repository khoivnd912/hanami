"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  api,
  type AdminConsultation, type AdminOrder,
  type CreateConsultationData, type CreateManualOrderData,
} from "@/lib/api";
import { formatDate, formatVND } from "@/lib/utils";
import {
  Users, Search, RefreshCw, X, Phone, Mail,
  CalendarDays, MessageSquare, ShoppingBag,
  CheckCircle2, Clock, PhoneCall, Package,
  ChevronRight, Send, Loader2, AlertCircle,
  Plus, Trash2, PlusCircle,
} from "lucide-react";
import { Pagination } from "@/components/Pagination";

// ─── Shared types ─────────────────────────────────────────────────────────────

type Tab = "consultations" | "orders";

const SOURCES = [
  { v: "facebook",  l: "Facebook"  },
  { v: "zalo",      l: "Zalo"      },
  { v: "instagram", l: "Instagram" },
  { v: "website",   l: "Website"   },
  { v: "other",     l: "Khác"      },
];

const SOURCE_COLORS: Record<string, { bg: string; color: string }> = {
  facebook:  { bg: "#eff6ff", color: "#1d4ed8" },
  zalo:      { bg: "#ecfdf5", color: "#065f46" },
  instagram: { bg: "#fdf2f8", color: "#9d174d" },
  website:   { bg: "#f9fafb", color: "#374151" },
  other:     { bg: "#f3f4f6", color: "#6b7280" },
};

// ─── Consultation helpers ─────────────────────────────────────────────────────

const CONSULT_STATUS: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  new:       { label: "Mới",         color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: <Clock       size={10} /> },
  contacted: { label: "Đã liên hệ",  color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", icon: <PhoneCall   size={10} /> },
  done:      { label: "Hoàn thành",  color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: <CheckCircle2 size={10} /> },
};

const ORDER_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "Chờ xác nhận", color: "#d97706", bg: "#fffbeb" },
  confirmed:  { label: "Đã xác nhận",  color: "#2563eb", bg: "#eff6ff" },
  processing: { label: "Đang làm",     color: "#7c3aed", bg: "#f5f3ff" },
  dispatched: { label: "Đang giao",    color: "#0891b2", bg: "#ecfeff" },
  delivered:  { label: "Hoàn thành",   color: "#059669", bg: "#ecfdf5" },
  cancelled:  { label: "Đã huỷ",       color: "#dc2626", bg: "#fef2f2" },
};

// ─── Create Consultation Form ─────────────────────────────────────────────────

function CreateConsultationDrawer({
  onClose,
  onCreated,
}: {
  onClose:   () => void;
  onCreated: (c: AdminConsultation) => void;
}) {
  const [form,    setForm]    = useState<CreateConsultationData>({
    name: "", phone: "", email: "", source: "facebook", message: "", status: "new",
  });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const set = (key: keyof CreateConsultationData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  async function handleSubmit() {
    if (!form.name.trim() || !form.message.trim()) {
      setError("Tên và nội dung là bắt buộc"); return;
    }
    setSaving(true); setError("");
    try {
      const created = await api.createConsultation(form);
      onCreated(created);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tạo liên hệ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <PlusCircle size={15} style={{ color: "#d96b82" }} />
            <p className="text-sm font-semibold text-gray-800">Thêm liên hệ mới</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Channel */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Kênh liên hệ</label>
            <div className="flex gap-2 flex-wrap">
              {SOURCES.map(({ v, l }) => (
                <button key={v} type="button" onClick={() => set("source", v)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  style={form.source === v
                    ? { background: SOURCE_COLORS[v]?.bg, color: SOURCE_COLORS[v]?.color, borderColor: SOURCE_COLORS[v]?.color + "50" }
                    : { background: "white", color: "#9ca3af", borderColor: "#e5e7eb" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Tên khách hàng <span className="text-red-400">*</span>
            </label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-pink-400" />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Số điện thoại</label>
            <input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)}
              placeholder="0912 345 678" type="tel"
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-pink-400" />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Email</label>
            <input value={form.email ?? ""} onChange={(e) => set("email", e.target.value)}
              placeholder="email@example.com" type="email"
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-pink-400" />
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Nội dung <span className="text-red-400">*</span>
            </label>
            <textarea rows={4} value={form.message} onChange={(e) => set("message", e.target.value)}
              placeholder="Khách hỏi về sản phẩm đèn hoa..."
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-pink-400 resize-none" />
          </div>

          {/* Delivery date */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Ngày cần nhận hàng</label>
            <input value={form.deliveryDate ?? ""} onChange={(e) => set("deliveryDate", e.target.value)}
              type="date"
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-pink-400" />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Trạng thái</label>
            <div className="flex gap-2">
              {(["new", "contacted", "done"] as const).map((k) => {
                const st = CONSULT_STATUS[k];
                return (
                  <button key={k} type="button" onClick={() => set("status", k)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                    style={form.status === k
                      ? { background: st.bg, color: st.color, borderColor: st.border }
                      : { background: "white", color: "#9ca3af", borderColor: "#e5e7eb" }}>
                    {st.icon} {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Staff note */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Ghi chú nội bộ</label>
            <textarea rows={2} value={form.staffNote ?? ""} onChange={(e) => set("staffNote", e.target.value)}
              placeholder="Ghi chú dành cho nhân viên..."
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-pink-400 resize-none" />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <AlertCircle size={12} /> {error}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100">
          <button onClick={handleSubmit} disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #f4b6c2 0%, #d96b82 100%)", boxShadow: "0 4px 16px rgba(217,107,130,0.3)" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Lưu liên hệ
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Create Manual Order Form ─────────────────────────────────────────────────

type ManualItem = { name: string; qty: number; unitPrice: number };

function CreateManualOrderDrawer({
  onClose,
  onCreated,
}: {
  onClose:   () => void;
  onCreated: (o: AdminOrder) => void;
}) {
  const [form, setForm] = useState<Omit<CreateManualOrderData, "items">>({
    customerName: "", phone: "", address: "", source: "facebook",
    paymentMethod: "transfer", paymentStatus: "paid", note: "", staffNote: "",
  });
  const [items,   setItems]   = useState<ManualItem[]>([{ name: "", qty: 1, unitPrice: 0 }]);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const setF = (key: keyof typeof form, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const setItem = (i: number, key: keyof ManualItem, val: string | number) =>
    setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, [key]: val } : it));

  const addItem    = () => setItems((prev) => [...prev, { name: "", qty: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);

  async function handleSubmit() {
    if (!form.customerName.trim() || !form.phone.trim()) {
      setError("Tên và số điện thoại là bắt buộc"); return;
    }
    if (items.some((it) => !it.name.trim() || it.qty < 1 || it.unitPrice < 0)) {
      setError("Vui lòng điền đầy đủ thông tin sản phẩm"); return;
    }
    setSaving(true); setError("");
    try {
      const order = await api.createManualOrder({ ...form, items });
      onCreated(order);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tạo đơn hàng");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <PlusCircle size={15} style={{ color: "#d96b82" }} />
            <p className="text-sm font-semibold text-gray-800">Thêm đơn hàng thủ công</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Channel */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Kênh bán hàng</label>
            <div className="flex gap-2 flex-wrap">
              {SOURCES.map(({ v, l }) => (
                <button key={v} type="button" onClick={() => setF("source", v)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  style={form.source === v
                    ? { background: SOURCE_COLORS[v]?.bg, color: SOURCE_COLORS[v]?.color, borderColor: SOURCE_COLORS[v]?.color + "50" }
                    : { background: "white", color: "#9ca3af", borderColor: "#e5e7eb" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Customer info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Tên khách hàng <span className="text-red-400">*</span>
              </label>
              <input value={form.customerName} onChange={(e) => setF("customerName", e.target.value)}
                placeholder="Nguyễn Thị Bình"
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-pink-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Số điện thoại <span className="text-red-400">*</span>
              </label>
              <input value={form.phone} onChange={(e) => setF("phone", e.target.value)}
                placeholder="0912 345 678" type="tel"
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-pink-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Địa chỉ</label>
              <input value={form.address ?? ""} onChange={(e) => setF("address", e.target.value)}
                placeholder="TP. Hồ Chí Minh"
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-pink-400" />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Sản phẩm <span className="text-red-400">*</span>
              </label>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700 font-medium">
                <Plus size={11} /> Thêm dòng
              </button>
            </div>

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_56px_88px_32px] gap-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-1">
                <span>Tên SP</span><span className="text-center">SL</span><span className="text-right">Đơn giá</span><span />
              </div>
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-[1fr_56px_88px_32px] gap-2 items-center">
                  <input value={it.name} onChange={(e) => setItem(i, "name", e.target.value)}
                    placeholder="Đèn hoa hồng"
                    className="px-2.5 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-pink-400 min-w-0" />
                  <input type="number" min={1} value={it.qty} onChange={(e) => setItem(i, "qty", Number(e.target.value))}
                    className="px-2 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-700 text-center focus:outline-none focus:border-pink-400" />
                  <input type="number" min={0} step={1000} value={it.unitPrice}
                    onChange={(e) => setItem(i, "unitPrice", Number(e.target.value))}
                    className="px-2 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-700 text-right focus:outline-none focus:border-pink-400" />
                  <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-3 flex justify-between items-center px-1">
              <span className="text-xs text-gray-500">Tổng cộng</span>
              <span className="text-base font-bold" style={{ color: "#d96b82" }}>{formatVND(total)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Thanh toán</label>
              <select value={form.paymentMethod} onChange={(e) => setF("paymentMethod", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-pink-400">
                <option value="transfer">Chuyển khoản</option>
                <option value="cod">COD</option>
                <option value="cash">Tiền mặt</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Trạng thái TT</label>
              <select value={form.paymentStatus} onChange={(e) => setF("paymentStatus", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-pink-400">
                <option value="paid">Đã thanh toán</option>
                <option value="pending">Chưa thanh toán</option>
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Ghi chú đơn hàng</label>
            <textarea rows={2} value={form.note ?? ""} onChange={(e) => setF("note", e.target.value)}
              placeholder="Yêu cầu đặc biệt của khách..."
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-pink-400 resize-none" />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <AlertCircle size={12} /> {error}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100">
          <button onClick={handleSubmit} disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #f4b6c2 0%, #d96b82 100%)", boxShadow: "0 4px 16px rgba(217,107,130,0.3)" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Lưu đơn hàng
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Consultation detail drawer ───────────────────────────────────────────────

function ConsultationDrawer({
  item,
  onClose,
  onUpdate,
  onDelete,
}: {
  item:     AdminConsultation;
  onClose:  () => void;
  onUpdate: (updated: AdminConsultation) => void;
  onDelete: (id: string) => void;
}) {
  const [status,    setStatus]    = useState(item.status);
  const [note,      setNote]      = useState(item.staffNote ?? "");
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [saveErr,   setSaveErr]   = useState("");

  async function handleSave() {
    setSaving(true); setSaveErr("");
    try {
      const updated = await api.updateConsultationStatus(item._id, status, note);
      onUpdate(updated);
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Lỗi lưu");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Xoá liên hệ này?")) return;
    setDeleting(true);
    try {
      await api.deleteConsultation(item._id);
      onDelete(item._id);
      onClose();
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Lỗi xoá");
    } finally {
      setDeleting(false);
    }
  }

  const s = CONSULT_STATUS[status];
  const src = SOURCE_COLORS[item.source ?? "website"];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquare size={15} style={{ color: "#d96b82" }} />
            <p className="text-sm font-semibold text-gray-800">Yêu cầu tư vấn</p>
            {item.source && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: src?.bg, color: src?.color }}>
                {SOURCES.find((s) => s.v === item.source)?.l ?? item.source}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleDelete} disabled={deleting}
              className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50">
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          <div className="rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {[
              { icon: Users,        label: "Tên",       value: item.name  },
              ...(item.phone ? [{ icon: Phone, label: "Điện thoại", value: item.phone }] : []),
              ...(item.email ? [{ icon: Mail,  label: "Email",      value: item.email }] : []),
              { icon: CalendarDays, label: "Ngày gửi",  value: formatDate(item.createdAt) },
              ...(item.deliveryDate ? [{ icon: CalendarDays, label: "Ngày nhận hàng", value: formatDate(item.deliveryDate) }] : []),
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(244,182,194,0.15)" }}>
                  <Icon size={13} style={{ color: "#d96b82" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{label}</p>
                  <p className="text-sm text-gray-700 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nội dung</p>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {item.message}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cập nhật trạng thái</p>
            <div className="flex gap-2 flex-wrap">
              {(["new", "contacted", "done"] as const).map((k) => {
                const st = CONSULT_STATUS[k];
                const active = status === k;
                return (
                  <button key={k} onClick={() => setStatus(k)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                    style={{
                      background:  active ? st.bg     : "white",
                      color:       active ? st.color  : "#9ca3af",
                      borderColor: active ? st.border : "#e5e7eb",
                    }}>
                    {st.icon} {st.label}
                  </button>
                );
              })}
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1.5 font-medium">Ghi chú nội bộ</p>
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú của nhân viên…"
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-pink-400 resize-none" />
            </div>

            {saveErr && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <AlertCircle size={12} /> {saveErr}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #f4b6c2 0%, #d96b82 100%)", boxShadow: "0 4px 16px rgba(217,107,130,0.3)" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Lưu & cập nhật
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Order detail drawer ──────────────────────────────────────────────────────

function OrderDrawer({ item, onClose }: { item: AdminOrder; onClose: () => void }) {
  const st  = ORDER_STATUS[item.status] ?? { label: item.status, color: "#6b7280", bg: "#f3f4f6" };
  const src = SOURCE_COLORS[(item as AdminOrder & { source?: string }).source ?? "website"];
  const source = (item as AdminOrder & { source?: string }).source;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={15} style={{ color: "#d96b82" }} />
            <p className="text-sm font-semibold text-gray-800">#{item.orderNumber}</p>
            {source && source !== "website" && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: src?.bg, color: src?.color }}>
                {SOURCES.find((s) => s.v === source)?.l ?? source}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: st.bg, color: st.color }}>
            <Package size={11} /> {st.label}
          </span>

          <div className="rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {[
              { icon: Users,        label: "Người nhận", value: item.shippingAddress.name  },
              { icon: Phone,        label: "Điện thoại",  value: item.shippingAddress.phone },
              { icon: CalendarDays, label: "Ngày đặt",    value: formatDate(item.createdAt) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(244,182,194,0.15)" }}>
                  <Icon size={13} style={{ color: "#d96b82" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{label}</p>
                  <p className="text-sm text-gray-700 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {item.shippingAddress.full && item.shippingAddress.full !== item.shippingAddress.phone && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Địa chỉ giao hàng</p>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed border border-gray-100">
                {item.shippingAddress.full}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sản phẩm</p>
            <div className="space-y-2">
              {item.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{it.nameVi}</p>
                    <p className="text-xs text-gray-400">x{it.qty} · {formatVND(it.unitPrice)}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 flex-shrink-0">{formatVND(it.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-pink-100 px-4 py-3 flex items-center justify-between"
            style={{ background: "rgba(244,182,194,0.08)" }}>
            <p className="text-sm font-semibold text-gray-700">Tổng cộng</p>
            <p className="text-base font-bold" style={{ color: "#d96b82" }}>{formatVND(item.total)}</p>
          </div>

          {item.note && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ghi chú</p>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 italic">{item.note}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── Consultations tab ────────────────────────────────────────────────────────

function ConsultationsTab() {
  const [data,      setData]     = useState<{ items: AdminConsultation[]; total: number; pages: number } | null>(null);
  const [page,      setPage]     = useState(1);
  const [limit,     setLimit]    = useState(20);
  const [q,         setQ]        = useState("");
  const [search,    setSearch]   = useState("");
  const [statusF,   setStatusF]  = useState("");
  const [loading,   setLoading]  = useState(true);
  const [error,     setError]    = useState("");
  const [selected,  setSelected] = useState<AdminConsultation | null>(null);
  const [creating,  setCreating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(q); setPage(1); }, 380);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search)  params.q      = search;
      if (statusF) params.status = statusF;
      setData(await api.getConsultations(params));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusF]);

  useEffect(() => { load(); }, [load]);

  function handleUpdate(updated: AdminConsultation) {
    setData((prev) => prev
      ? { ...prev, items: prev.items.map((it) => it._id === updated._id ? updated : it) }
      : prev
    );
    setSelected(updated);
  }

  function handleDelete(id: string) {
    setData((prev) => prev
      ? { ...prev, items: prev.items.filter((it) => it._id !== id), total: prev.total - 1 }
      : prev
    );
  }

  function handleCreated(c: AdminConsultation) {
    setCreating(false);
    setData((prev) => prev
      ? { ...prev, items: [c, ...prev.items], total: prev.total + 1 }
      : { items: [c], total: 1, pages: 1 }
    );
  }

  const countByStatus = (key: string) => data?.items.filter((c) => c.status === key).length ?? 0;

  return (
    <div className="space-y-4">
      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Tổng",       value: data.total,              color: "#1a1a1a" },
            { label: "Mới",        value: countByStatus("new"),       color: "#d97706" },
            { label: "Đã liên hệ", value: countByStatus("contacted"), color: "#2563eb" },
            { label: "Hoàn thành", value: countByStatus("done"),      color: "#059669" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
              <p className="text-xl font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters + Create button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 self-start">
          {[{ k: "", l: "Tất cả" }, { k: "new", l: "Mới" }, { k: "contacted", l: "Đã liên hệ" }, { k: "done", l: "Hoàn thành" }].map(({ k, l }) => (
            <button key={k} onClick={() => { setStatusF(k); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusF === k ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm tên, email, nội dung…"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-pink-400" />
        </div>
        <button onClick={load} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors self-start sm:self-auto">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all self-start sm:self-auto"
          style={{ background: "linear-gradient(135deg, #f4b6c2 0%, #d96b82 100%)", boxShadow: "0 4px 12px rgba(217,107,130,0.3)" }}>
          <Plus size={14} /> Thêm liên hệ
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Kênh</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Nội dung</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Ngày gửi</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div className="h-3.5 rounded-lg animate-pulse bg-gray-100" style={{ width: `${55 + (j * 17) % 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <MessageSquare size={28} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-sm text-gray-400">Chưa có yêu cầu tư vấn nào</p>
                </td>
              </tr>
            ) : data?.items.map((c) => {
              const s   = CONSULT_STATUS[c.status] ?? CONSULT_STATUS.new;
              const src = SOURCE_COLORS[c.source ?? "website"];
              return (
                <tr key={c._id} onClick={() => setSelected(c)}
                  className="hover:bg-pink-50/40 cursor-pointer transition-colors group">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.phone ?? c.email ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    {c.source && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: src?.bg, color: src?.color }}>
                        {SOURCES.find((s) => s.v === c.source)?.l ?? c.source}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <p className="text-sm text-gray-500 truncate max-w-[220px]">{c.message}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
                      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
                      {s.icon} {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400 hidden lg:table-cell whitespace-nowrap">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && data.pages > 1 && (
        <Pagination page={page} pages={data.pages} total={data.total} limit={limit} loading={loading}
          onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
      )}

      {selected && (
        <ConsultationDrawer
          item={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      {creating && (
        <CreateConsultationDrawer onClose={() => setCreating(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}

// ─── Orders tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const [data,     setData]    = useState<{ items: AdminOrder[]; total: number; pages: number } | null>(null);
  const [page,     setPage]    = useState(1);
  const [limit,    setLimit]   = useState(20);
  const [q,        setQ]       = useState("");
  const [search,   setSearch]  = useState("");
  const [statusF,  setStatusF] = useState("");
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState("");
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [creating, setCreating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(q); setPage(1); }, 380);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search)  params.q      = search;
      if (statusF) params.status = statusF;
      setData(await api.getOrders(params));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusF]);

  useEffect(() => { load(); }, [load]);

  function handleCreated(o: AdminOrder) {
    setCreating(false);
    setData((prev) => prev
      ? { ...prev, items: [o, ...prev.items], total: prev.total + 1 }
      : { items: [o], total: 1, pages: 1 }
    );
  }

  const STATUS_OPTS = [
    { k: "",           l: "Tất cả"       },
    { k: "pending",    l: "Chờ xác nhận" },
    { k: "confirmed",  l: "Đã xác nhận"  },
    { k: "processing", l: "Đang làm"     },
    { k: "dispatched", l: "Đang giao"    },
    { k: "delivered",  l: "Hoàn thành"   },
    { k: "cancelled",  l: "Đã huỷ"       },
  ];

  return (
    <div className="space-y-4">
      {/* Filters + Create button */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap self-start">
          {STATUS_OPTS.slice(0, 4).map(({ k, l }) => (
            <button key={k} onClick={() => { setStatusF(k); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusF === k ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              {l}
            </button>
          ))}
          <select value={statusF} onChange={(e) => { setStatusF(e.target.value); setPage(1); }}
            className="px-2 py-1.5 rounded-lg text-xs font-medium text-gray-500 bg-transparent focus:outline-none">
            {STATUS_OPTS.map(({ k, l }) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        <div className="relative max-w-xs flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm mã đơn hàng…"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-pink-400" />
        </div>
        <button onClick={load} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors self-start sm:self-auto">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all self-start sm:self-auto"
          style={{ background: "linear-gradient(135deg, #f4b6c2 0%, #d96b82 100%)", boxShadow: "0 4px 12px rgba(217,107,130,0.3)" }}>
          <Plus size={14} /> Thêm đơn hàng
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Kênh</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Mã đơn</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Ngày đặt</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div className="h-3.5 rounded-lg animate-pulse bg-gray-100" style={{ width: `${55 + (j * 13) % 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <ShoppingBag size={28} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-sm text-gray-400">Chưa có đơn hàng nào</p>
                </td>
              </tr>
            ) : data?.items.map((o) => {
              const st  = ORDER_STATUS[o.status] ?? { label: o.status, color: "#6b7280", bg: "#f3f4f6" };
              const source = (o as AdminOrder & { source?: string }).source;
              const src = SOURCE_COLORS[source ?? "website"];
              const initials = o.shippingAddress.name.split(" ").filter(Boolean).slice(-2).map((w) => w[0].toUpperCase()).join("");
              return (
                <tr key={o._id} onClick={() => setSelected(o)}
                  className="hover:bg-pink-50/40 cursor-pointer transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 text-white"
                        style={{ background: "linear-gradient(135deg, #f4b6c2 0%, #d96b82 100%)" }}>
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{o.shippingAddress.name}</p>
                        <p className="text-xs text-gray-400">{o.shippingAddress.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    {source && source !== "website" && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: src?.bg, color: src?.color }}>
                        {SOURCES.find((s) => s.v === source)?.l ?? source}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 font-mono text-xs hidden md:table-cell">{o.orderNumber}</td>
                  <td className="px-4 py-3.5 font-semibold" style={{ color: "#d96b82" }}>{formatVND(o.total)}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400 hidden lg:table-cell whitespace-nowrap">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && data.pages > 1 && (
        <Pagination page={page} pages={data.pages} total={data.total} limit={limit} loading={loading}
          onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
      )}

      {selected && <OrderDrawer item={selected} onClose={() => setSelected(null)} />}

      {creating && (
        <CreateManualOrderDrawer onClose={() => setCreating(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "consultations", label: "Liên hệ tư vấn", icon: <MessageSquare size={14} /> },
  { key: "orders",        label: "Đặt hàng",        icon: <ShoppingBag   size={14} /> },
];

export default function CustomersPage() {
  const [tab, setTab] = useState<Tab>("consultations");

  return (
    <div className="p-6 space-y-5">

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(244,182,194,0.2)" }}>
          <Users size={17} style={{ color: "#d96b82" }} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Khách hàng</h1>
          <p className="text-xs text-gray-400">Liên hệ tư vấn và đặt hàng từ mọi kênh</p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 self-start w-fit">
        {TABS.map(({ key, label, icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === "consultations" ? <ConsultationsTab /> : <OrdersTab />}
    </div>
  );
}
