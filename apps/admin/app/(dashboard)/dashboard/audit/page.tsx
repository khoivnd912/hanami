"use client";

import { useEffect, useState, useCallback } from "react";
import { api, type AuditLog } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { ScrollText, RefreshCw, ChevronDown } from "lucide-react";
import { Pagination } from "@/components/Pagination";

const RESOURCE_COLORS: Record<string, string> = {
  Order:        "text-blue-400 bg-blue-500/10",
  Product:      "text-purple-400 bg-purple-500/10",
  StaffUser:    "text-amber-400 bg-amber-500/10",
  Customer:     "text-cyan-400 bg-cyan-500/10",
  Coupon:       "text-emerald-400 bg-emerald-500/10",
  Consultation: "text-rose-400 bg-rose-500/10",
  SiteContent:  "text-indigo-400 bg-indigo-500/10",
};

export default function AuditPage() {
  const [logs,    setLogs]    = useState<AuditLog[]>([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [page,    setPage]    = useState(1);
  const [limit,   setLimit]   = useState(30);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [resource, setResource] = useState("");
  const [action,   setAction]   = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (resource) params.resource = resource;
      if (action)   params.action   = action;
      const res = await api.getAuditLogs(params);
      setLogs(res.items);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [page, limit, resource, action]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#f4b6c2", color: "#333333" }}>
            <ScrollText size={17} className="text-[#555]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Nhật ký hệ thống</h1>
            <p className="text-xs text-gray-400">{total} bản ghi</p>
          </div>
        </div>
        <button onClick={load} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={resource} onChange={(e) => { setResource(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-pink-400">
          <option value="">Tất cả tài nguyên</option>
          <option value="Order">Đơn hàng</option>
          <option value="Product">Sản phẩm</option>
          <option value="Customer">Khách hàng</option>
          <option value="Coupon">Mã giảm giá</option>
          <option value="Consultation">Tư vấn</option>
          <option value="SiteContent">Nội dung trang</option>
          <option value="StaffUser">Nhân viên</option>
        </select>
        <input value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}
          placeholder="Tìm theo hành động..."
          className="px-3 py-2 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-pink-400" />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Logs */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse bg-white/5" />
          ))
        ) : logs.length === 0 ? (
          <div className="text-center text-gray-500 py-10">Không có nhật ký</div>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="rounded-xl border overflow-hidden"
              style={{ borderColor: "rgba(244,182,194,0.20)", background: "rgba(255,255,255,0.02)" }}>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
                onClick={() => setExpanded(expanded === log._id ? null : log._id)}>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium flex-shrink-0 ${
                  RESOURCE_COLORS[log.resource] ?? "text-gray-400 bg-white/5"
                }`}>
                  {log.resource}
                </span>
                <span className="text-sm text-gray-800 font-mono">{log.action}</span>
                <span className="text-xs text-gray-500 ml-auto hidden sm:inline">{log.actorName}</span>
                <span className="text-xs text-gray-600 flex-shrink-0 hidden sm:inline">{formatDate(log.createdAt)}</span>
                <ChevronDown size={13} className={`text-gray-500 transition-transform flex-shrink-0 ${
                  expanded === log._id ? "rotate-180" : ""
                }`} />
              </button>

              {expanded === log._id && (
                <div className="px-4 pb-3 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400 mb-2">
                    <span>Actor ID: <span className="text-gray-300 font-mono">{log.actorId}</span></span>
                    <span>Resource ID: <span className="text-gray-300 font-mono">{log.resourceId}</span></span>
                    {log.ip && <span>IP: <span className="text-gray-300">{log.ip}</span></span>}
                  </div>
                  {log.diff != null && (
                    <pre className="text-xs text-gray-400 bg-black/20 rounded-lg p-3 overflow-x-auto max-h-40">
                      {JSON.stringify(log.diff, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Pagination
        page={page}
        pages={pages}
        total={total}
        limit={limit}
        loading={loading}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />
    </div>
  );
}
