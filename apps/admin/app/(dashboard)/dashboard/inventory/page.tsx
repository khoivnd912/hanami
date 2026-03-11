"use client";

import { useEffect, useState, useCallback } from "react";
import { api, type InventoryLog } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Boxes, RefreshCw, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Pagination } from "@/components/Pagination";

const REASON_LABELS: Record<string, string> = {
  order_placed:     "Đơn hàng",
  manual_restock:   "Nhập kho",
  manual_adjustment:"Điều chỉnh",
  order_cancelled:  "Hủy đơn",
  return:           "Trả hàng",
};

export default function InventoryPage() {
  const [logs,     setLogs]     = useState<InventoryLog[]>([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [page,     setPage]     = useState(1);
  const [limit,    setLimit]    = useState(30);
  const [lowStock, setLowStock] = useState<{ _id: string; nameVi: string; stock: number }[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [logsData, lowData] = await Promise.all([
        api.getInventoryLogs({ page: String(page), limit: String(limit) }),
        page === 1 ? api.getLowStock() : Promise.resolve(lowStock),
      ]);
      setLogs(logsData.items);
      setTotal(logsData.total);
      setPages(logsData.pages);
      if (page === 1) setLowStock(lowData as typeof lowStock);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [page, limit]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#f4b6c2", color: "#333333" }}>
            <Boxes size={17} className="text-[#555]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Tồn kho</h1>
            <p className="text-xs text-gray-400">{total} bản ghi lịch sử</p>
          </div>
        </div>
        <button onClick={load} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-amber-400" />
            <span className="text-sm font-medium text-amber-400">
              {lowStock.length} sản phẩm sắp hết hàng
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {lowStock.map((p) => (
              <div key={p._id} className="bg-amber-500/10 rounded-xl px-3 py-2">
                <p className="text-xs text-amber-900 font-medium truncate">{p.nameVi}</p>
                <p className="text-xs text-amber-400 mt-0.5">Còn {p.stock} cái</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Log table */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(244,182,194,0.25)" }}>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <th className="px-4 py-3">Sản phẩm (ID)</th>
              <th className="px-4 py-3">Thay đổi</th>
              <th className="px-4 py-3">Tồn sau</th>
              <th className="px-4 py-3">Lý do</th>
              <th className="px-4 py-3">Ghi chú</th>
              <th className="px-4 py-3">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded animate-pulse bg-white/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Chưa có lịch sử kho</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{log.productId.slice(-8)}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 text-xs font-semibold ${
                      log.delta > 0 ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {log.delta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {log.delta > 0 ? "+" : ""}{log.delta}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{log.stockAfter}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-gray-400">
                      {REASON_LABELS[log.reason] ?? log.reason}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{log.note ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(log.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
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
