"use client";

import { useEffect, useState, useCallback } from "react";
import { api, type AdminCoupon } from "@/lib/api";
import { formatDate, formatVND } from "@/lib/utils";
import { Tag, Plus, RefreshCw, Trash2, CheckCircle2, XCircle, Edit2 } from "lucide-react";
import { Pagination } from "@/components/Pagination";

const TYPE_LABELS = { percent: "% Giảm giá", fixed: "Giảm cố định", free_shipping: "Miễn phí vận chuyển" };

const EMPTY_FORM = {
  code: "", type: "percent" as "percent" | "fixed" | "free_shipping", value: 0, minOrder: 0, usageLimit: 0, expiresAt: "", isActive: true,
};

export default function CouponsPage() {
  const [data,    setData]    = useState<{ items: AdminCoupon[]; total: number; pages: number } | null>(null);
  const [page,    setPage]    = useState(1);
  const [limit,   setLimit]   = useState(20);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<AdminCoupon | null>(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      setData(await api.getCoupons({ page: String(page), limit: String(limit) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null); setForm(EMPTY_FORM); setShowForm(true);
  }

  function openEdit(c: AdminCoupon) {
    setEditing(c);
    setForm({
      code: c.code, type: c.type, value: c.value,
      minOrder: c.minOrder, usageLimit: c.usageLimit,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : "",
      isActive: c.isActive,
    });
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        value:      Number(form.value),
        minOrder:   Number(form.minOrder),
        usageLimit: Number(form.usageLimit),
        expiresAt:  form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      };
      if (editing) {
        await api.updateCoupon(editing._id, payload);
      } else {
        await api.createCoupon(payload);
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi lưu");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Xóa mã giảm giá này?")) return;
    try {
      await api.deleteCoupon(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi xóa mã giảm giá");
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#f4b6c2", color: "#333333" }}>
            <Tag size={17} className="text-[#555]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Mã giảm giá</h1>
            {data && <p className="text-xs text-gray-400">{data.total} mã</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ background: "#f4b6c2", color: "#333333" }}>
            <Plus size={14} /> Tạo mã
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(244,182,194,0.25)" }}>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Giá trị</th>
              <th className="px-4 py-3">Đã dùng</th>
              <th className="px-4 py-3">Hết hạn</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((__, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 rounded animate-pulse bg-white/5" /></td>
                ))}</tr>
              ))
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">Chưa có mã giảm giá</td></tr>
            ) : (
              data?.items.map((c) => (
                <tr key={c._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-pink-400">{c.code}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{TYPE_LABELS[c.type]}</td>
                  <td className="px-4 py-3 text-gray-800">
                    {c.type === "percent" ? `${c.value}%`
                      : c.type === "fixed" ? formatVND(c.value)
                      : "Miễn phí ship"}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {c.usedCount} / {c.usageLimit === 0 ? "∞" : c.usageLimit}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {c.expiresAt ? formatDate(c.expiresAt) : "Không giới hạn"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                      c.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"
                    }`}>
                      {c.isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {c.isActive ? "Đang dùng" : "Tắt"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(c)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => remove(c._id)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {data && (
        <Pagination
          page={page}
          pages={data.pages}
          total={data.total}
          limit={limit}
          loading={loading}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
        />
      )}

      {/* Create / Edit Drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="w-full max-w-sm sm:max-w-md flex flex-col gap-4 p-5 sm:p-6 h-full overflow-y-auto"
            style={{ background: "#380d1c", borderLeft: "1px solid rgba(244,182,194,0.28)" }}>
            <h2 className="text-base font-semibold text-white">
              {editing ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
            </h2>

            {[
              { label: "Mã giảm giá", key: "code", type: "text", placeholder: "VD: HANAMI20" },
              { label: "Giá trị", key: "value", type: "number", placeholder: "20" },
              { label: "Đơn hàng tối thiểu (VND)", key: "minOrder", type: "number", placeholder: "0" },
              { label: "Giới hạn sử dụng (0 = không giới hạn)", key: "usageLimit", type: "number", placeholder: "0" },
              { label: "Hết hạn lúc", key: "expiresAt", type: "datetime-local", placeholder: "" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={String(form[key as keyof typeof form])}
                  onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50"
                />
              </div>
            ))}

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Loại</label>
              <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as typeof form.type }))}
                className="w-full px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50">
                <option value="percent">% Giảm giá</option>
                <option value="fixed">Giảm cố định (VND)</option>
                <option value="free_shipping">Miễn phí vận chuyển</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive}
                onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="rounded" />
              <span className="text-sm text-gray-300">Đang kích hoạt</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
                Hủy
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm text-white font-medium transition-colors disabled:opacity-50"
                style={{ background: "#f4b6c2", color: "#333333" }}>
                {saving ? "Đang lưu…" : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
