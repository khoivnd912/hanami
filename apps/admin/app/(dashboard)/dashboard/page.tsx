"use client";

import { useEffect, useState } from "react";
import { api, type AdminStats } from "@/lib/api";
import { formatVND, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  TrendingUp, ShoppingBag, Users, Clock,
  AlertTriangle, RefreshCw, ArrowUpRight,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

type Range = "1d" | "7d" | "30d" | "90d";
const RANGES: { v: Range; l: string }[] = [
  { v: "1d", l: "Hôm nay" }, { v: "7d", l: "7 ngày" },
  { v: "30d", l: "30 ngày" }, { v: "90d", l: "90 ngày" },
];

export default function DashboardPage() {
  const [stats,   setStats]   = useState<AdminStats | null>(null);
  const [range,   setRange]   = useState<Range>("7d");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      setStats(await api.getStats(range));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [range]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tổng quan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Dữ liệu kinh doanh Hanami</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Range selector */}
          <div className="flex gap-1 p-1 rounded-xl bg-gray-100">
            {RANGES.map((r) => (
              <button key={r.v} onClick={() => setRange(r.v)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  range === r.v ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {r.l}
              </button>
            ))}
          </div>
          <button onClick={load}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      {loading && !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* ── KPI Cards ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Doanh thu"
              value={formatVND(stats.kpis.revenue)}
              icon={<TrendingUp size={16} />}
              color="pink"
            />
            <KpiCard
              label="Đơn hàng"
              value={String(stats.kpis.totalOrders)}
              icon={<ShoppingBag size={16} />}
              color="blue"
            />
            <KpiCard
              label="Khách mới"
              value={String(stats.kpis.newCustomers)}
              icon={<Users size={16} />}
              color="purple"
            />
            <KpiCard
              label="Chờ xác nhận"
              value={String(stats.kpis.pendingOrders)}
              icon={<Clock size={16} />}
              color={stats.kpis.pendingOrders > 0 ? "amber" : "green"}
            />
          </div>

          {/* ── Revenue chart + Status donut ─────────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Revenue line chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Doanh thu theo ngày</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.revenueByDay} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    formatter={(v: number) => [formatVND(v), "Doanh thu"]}
                    labelFormatter={(l) => `Ngày ${l}`}
                  />
                  <Line
                    type="monotone" dataKey="revenue" stroke="#f9a8d4" strokeWidth={2}
                    dot={{ fill: "#f9a8d4", r: 3 }} activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Orders by status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Trạng thái đơn hàng</h3>
              <div className="space-y-2.5">
                {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", ORDER_STATUS_COLORS[status])}>
                      {ORDER_STATUS_LABELS[status] ?? status}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">{count}</span>
                  </div>
                ))}
                {Object.keys(stats.ordersByStatus).length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">Không có dữ liệu</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Low stock + Recent orders ────────────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Low stock */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={15} className="text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-700">Cảnh báo tồn kho thấp</h3>
              </div>
              {stats.lowStockProducts.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Tất cả sản phẩm đủ hàng ✓</p>
              ) : (
                <div className="space-y-2">
                  {stats.lowStockProducts.map((p) => (
                    <div key={p._id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
                      <span className="text-sm text-gray-700 font-medium">{p.nameVi}</span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        còn {p.stock}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent orders */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Đơn hàng gần đây</h3>
                <a href="/dashboard/orders" className="text-xs text-pink-500 hover:text-pink-700 flex items-center gap-1">
                  Xem tất cả <ArrowUpRight size={11} />
                </a>
              </div>
              <div className="space-y-2">
                {stats.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{order.orderNumber}</p>
                      <p className="text-[10px] text-gray-400">{order.shippingAddress.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium" style={{ color: "#db2777" }}>{formatVND(order.total)}</p>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", ORDER_STATUS_COLORS[order.status])}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bg: string; icon: string; border: string }> = {
  pink:   { bg: "bg-pink-50",   icon: "text-pink-500",   border: "border-pink-100" },
  blue:   { bg: "bg-blue-50",   icon: "text-blue-500",   border: "border-blue-100" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", border: "border-purple-100" },
  amber:  { bg: "bg-amber-50",  icon: "text-amber-500",  border: "border-amber-100" },
  green:  { bg: "bg-emerald-50",icon: "text-emerald-500",border: "border-emerald-100" },
};

function KpiCard({ label, value, icon, color }: {
  label: string; value: string; icon: React.ReactNode; color: string;
}) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.blue;
  return (
    <div className={cn("bg-white rounded-2xl border p-5 shadow-sm", c.border)}>
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", c.bg)}>
        <span className={c.icon}>{icon}</span>
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
    </div>
  );
}
