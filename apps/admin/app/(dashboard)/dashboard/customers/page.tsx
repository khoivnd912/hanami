"use client";

import { useEffect, useState, useCallback } from "react";
import { api, type AdminCustomer } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Users, Search, RefreshCw, CheckCircle2, XCircle, ShieldOff, Shield } from "lucide-react";
import { Pagination } from "@/components/Pagination";

export default function CustomersPage() {
  const [data,    setData]    = useState<{ items: AdminCustomer[]; total: number; pages: number } | null>(null);
  const [page,    setPage]    = useState(1);
  const [limit,   setLimit]   = useState(20);
  const [q,       setQ]       = useState("");
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search) params.q = search;
      setData(await api.getCustomers(params));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus(customer: AdminCustomer) {
    setToggling(customer._id);
    try {
      await api.patchCustomerStatus(customer._id, !customer.isActive);
      await load();
    } catch {
      // ignore
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#f9a8d4,#db2777)" }}>
            <Users size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Khách hàng</h1>
            {data && <p className="text-xs text-gray-400">{data.total} khách hàng</p>}
          </div>
        </div>
        <button onClick={load} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { setSearch(q); setPage(1); } }}
          placeholder="Tìm email, tên, SĐT..."
          className="w-full pl-9 pr-3 py-2 rounded-xl text-sm bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-pink-400"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(249,168,212,0.25)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Số điện thoại</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Đã xác minh</th>
              <th className="px-4 py-3">Ngày đăng ký</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded animate-pulse bg-white/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Không có khách hàng</td></tr>
            ) : (
              data?.items.map((c) => (
                <tr key={c._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-gray-900 font-medium">{c.name}</p>
                    <p className="text-gray-400 text-xs">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{c.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {c.isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {c.isActive ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.isVerified
                      ? <span className="text-emerald-400 text-xs">✓ Đã xác minh</span>
                      : <span className="text-gray-500 text-xs">Chưa xác minh</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleStatus(c)}
                      disabled={toggling === c._id}
                      className={`p-1.5 rounded-lg transition-colors ${
                        c.isActive
                          ? "text-red-400 hover:bg-red-500/10"
                          : "text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                      title={c.isActive ? "Khóa tài khoản" : "Mở khóa"}
                    >
                      {c.isActive ? <ShieldOff size={14} /> : <Shield size={14} />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
  );
}
