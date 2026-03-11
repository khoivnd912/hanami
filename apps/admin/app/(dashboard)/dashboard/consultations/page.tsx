"use client";

import { useEffect, useState, useCallback } from "react";
import { api, type AdminConsultation, type PaginatedConsultations } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Search, MessageSquareHeart, X, ChevronDown, Mail, Calendar, FileText } from "lucide-react";
import { Pagination } from "@/components/Pagination";

const STATUS_OPTIONS = [
  { value: "",          label: "Tất cả" },
  { value: "new",       label: "Mới" },
  { value: "contacted", label: "Đã liên hệ" },
  { value: "done",      label: "Hoàn tất" },
];

const STATUS_LABELS: Record<string, string> = {
  new:       "Mới",
  contacted: "Đã liên hệ",
  done:      "Hoàn tất",
};

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  done:      "bg-emerald-100 text-emerald-700",
};

const NEXT_STATUS: Record<string, { value: string; label: string }[]> = {
  new:       [{ value: "contacted", label: "Đánh dấu đã liên hệ" }],
  contacted: [{ value: "done",      label: "Đánh dấu hoàn tất" }],
};

export default function ConsultationsPage() {
  const [data,      setData]      = useState<PaginatedConsultations | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState(1);
  const [limit,     setLimit]     = useState(20);
  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState("");
  const [selected,  setSelected]  = useState<AdminConsultation | null>(null);
  const [staffNote, setStaffNote] = useState("");
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search) params.q      = search;
      if (status) params.status = status;
      setData(await api.getConsultations(params));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status]);

  useEffect(() => { load(); }, [load]);

  function openDetail(c: AdminConsultation) {
    setSelected(c);
    setStaffNote(c.staffNote ?? "");
  }

  async function handleStatusChange(consultation: AdminConsultation, newStatus: string) {
    setSaving(true);
    try {
      await api.updateConsultationStatus(consultation._id, newStatus, staffNote || undefined);
      setSelected(null);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi cập nhật");
    } finally {
      setSaving(false);
    }
  }

  async function saveNote(consultation: AdminConsultation) {
    setSaving(true);
    try {
      await api.updateConsultationStatus(consultation._id, consultation.status, staffNote);
      setSelected(null);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi lưu ghi chú");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── List ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold text-gray-900">Tư vấn hoa</h1>
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_OPTIONS.slice(1).map((s) => (
                <button
                  key={s.value}
                  onClick={() => { setStatus(status === s.value ? "" : s.value); setPage(1); }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    status === s.value
                      ? STATUS_COLORS[s.value]
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-full max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm tên, email, nội dung..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-pink-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data?.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <MessageSquareHeart size={32} className="mb-3 opacity-30" />
              <p className="text-sm">Chưa có yêu cầu tư vấn nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Ngày giao hoa</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Nội dung</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Ngày gửi</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.items.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openDetail(c)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                      {c.deliveryDate || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 max-w-[220px] hidden md:table-cell">
                      <p className="text-xs text-gray-600 truncate">{c.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap", STATUS_COLORS[c.status])}>
                        {STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <ChevronDown size={14} className="text-gray-300 -rotate-90" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
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
      </div>

      {/* ── Detail drawer ── */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSelected(null)} />
          <div className="fixed right-0 inset-y-0 w-full max-w-sm z-40 lg:static lg:w-96 lg:max-w-none border-l border-gray-100 bg-white flex flex-col overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Chi tiết yêu cầu</h2>
            <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Status badge */}
            <div className="flex items-center gap-2">
              <span className={cn("text-xs px-3 py-1 rounded-full font-semibold", STATUS_COLORS[selected.status])}>
                {STATUS_LABELS[selected.status]}
              </span>
              <span className="text-xs text-gray-400">{formatDate(selected.createdAt)}</span>
            </div>

            {/* Customer info */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-pink-600">
                    {selected.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-semibold text-gray-900">{selected.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail size={12} className="text-gray-400" />
                <a href={`mailto:${selected.email}`} className="text-pink-600 hover:underline">
                  {selected.email}
                </a>
              </div>
              {selected.deliveryDate && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={12} className="text-gray-400" />
                  <span>Ngày giao hoa: <strong>{selected.deliveryDate}</strong></span>
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <FileText size={12} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nội dung</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-white border border-gray-100 rounded-xl p-4">
                {selected.message}
              </p>
            </div>

            {/* Staff note */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                Ghi chú nội bộ
              </label>
              <textarea
                value={staffNote}
                onChange={(e) => setStaffNote(e.target.value)}
                rows={3}
                placeholder="Ghi chú cho nhân viên (không hiển thị cho khách)..."
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-400 resize-none"
              />
            </div>

            {/* Next status actions */}
            {NEXT_STATUS[selected.status]?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cập nhật trạng thái</p>
                {NEXT_STATUS[selected.status].map((ns) => (
                  <button
                    key={ns.value}
                    onClick={() => handleStatusChange(selected, ns.value)}
                    disabled={saving}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 transition-colors"
                  >
                    {saving ? "Đang lưu..." : ns.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Save note footer */}
          <div className="px-5 py-4 border-t border-gray-100">
            <button
              onClick={() => saveNote(selected)}
              disabled={saving}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60 transition-colors"
              style={{ background: "#f4b6c2", color: "#333333" }}
            >
              {saving ? "Đang lưu..." : "Lưu ghi chú"}
            </button>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
