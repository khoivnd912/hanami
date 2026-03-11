"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { api, type AdminStats } from "@/lib/api";
import { formatVND } from "@/lib/utils";
import { BarChart3, RefreshCw, TrendingUp, ShoppingBag, Users, DollarSign, MessageSquare } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

type Range = "7d" | "30d" | "90d";
const RANGES: { v: Range; l: string }[] = [
  { v: "7d", l: "7 ngày" }, { v: "30d", l: "30 ngày" }, { v: "90d", l: "90 ngày" },
];

const ORDER_STATUS_VI: Record<string, string> = {
  pending:    "Chờ xác nhận",
  confirmed:  "Đã xác nhận",
  processing: "Đang làm",
  dispatched: "Đang giao",
  delivered:  "Hoàn thành",
  cancelled:  "Đã huỷ",
};

export default function AnalyticsPage() {
  const [stats,   setStats]   = useState<AdminStats | null>(null);
  const [range,   setRange]   = useState<Range>("30d");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      setStats(await api.getStats(range));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const statusData = stats
    ? Object.entries(stats.ordersByStatus).map(([k, v]) => ({ name: ORDER_STATUS_VI[k] ?? k, value: v }))
    : [];

  // Merge revenueByDay (has orders per day) + consultationsByDay into one array for the customer chart
  const customerByDay = useMemo(() => {
    if (!stats) return [];
    const map: Record<string, { date: string; orders: number; consultations: number }> = {};
    for (const d of (stats.revenueByDay ?? [])) {
      map[d._id] = { date: d._id, orders: d.orders ?? 0, consultations: 0 };
    }
    for (const c of (stats.consultationsByDay ?? [])) {
      if (map[c._id]) {
        map[c._id].consultations = c.count;
      } else {
        map[c._id] = { date: c._id, orders: 0, consultations: c.count };
      }
    }
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [stats]);

  const TOOLTIP_STYLE = {
    contentStyle: { background: "#fff", border: "1px solid rgba(244,182,194,0.4)", borderRadius: "12px", fontSize: 12 },
    labelStyle:   { color: "#d96b82", fontWeight: 600 },
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(244,182,194,0.2)" }}>
            <BarChart3 size={17} style={{ color: "#d96b82" }} />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Phân tích</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            {RANGES.map(({ v, l }) => (
              <button key={v} onClick={() => setRange(v)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all font-medium ${
                  range === v ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={load} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Doanh thu",  value: formatVND(stats?.kpis.revenue ?? 0),       icon: DollarSign,    color: "#10b981", sub: null },
          { label: "Đơn hàng",  value: String(stats?.kpis.totalOrders ?? 0),        icon: ShoppingBag,   color: "#f4b6c2", sub: null },
          { label: "Giá trị TB", value: formatVND(stats?.kpis.avgOrderValue ?? 0),  icon: TrendingUp,    color: "#f59e0b", sub: null },
          {
            label: "Khách mới",
            value: String(stats?.kpis.newCustomers ?? 0),
            icon: Users,
            color: "#8b5cf6",
            sub: stats ? `${stats.kpis.newConsultations ?? 0} tư vấn · ${stats.kpis.newOrderCustomers ?? 0} đơn` : null,
          },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 w-20 rounded animate-pulse bg-gray-100" />
                <div className="h-7 w-28 rounded animate-pulse bg-gray-100" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} style={{ color }} />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Revenue Line Chart */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Doanh thu theo ngày</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={stats?.revenueByDay ?? []} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="_id" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
            <Tooltip {...TOOLTIP_STYLE}
              formatter={(v: number) => [formatVND(v), "Doanh thu"]}
              labelFormatter={(l) => `Ngày ${l}`} />
            <Line type="monotone" dataKey="revenue" stroke="#f4b6c2" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* New Customers Chart */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users size={14} style={{ color: "#8b5cf6" }} />
          <h2 className="text-sm font-semibold text-gray-700">Khách mới theo ngày</h2>
          <span className="ml-auto text-xs text-gray-400">
            Tổng: <span className="font-semibold text-gray-700">{stats?.kpis.newCustomers ?? 0}</span>
          </span>
        </div>

        {/* Breakdown badges */}
        {stats && (
          <div className="flex gap-3 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-100">
              <MessageSquare size={12} style={{ color: "#8b5cf6" }} />
              <span className="text-xs font-medium text-purple-700">{stats.kpis.newConsultations ?? 0} tư vấn</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-100">
              <ShoppingBag size={12} style={{ color: "#d96b82" }} />
              <span className="text-xs font-medium text-pink-700">{stats.kpis.newOrderCustomers ?? 0} đặt hàng</span>
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={customerByDay} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...TOOLTIP_STYLE} labelFormatter={(l) => `Ngày ${l}`} />
            <Legend iconType="circle" iconSize={8}
              formatter={(value) => <span style={{ fontSize: 11, color: "#6b7280" }}>{value}</span>} />
            <Bar dataKey="consultations" name="Tư vấn"   stackId="a" fill="#c4b5fd" radius={[0, 0, 0, 0]} />
            <Bar dataKey="orders"        name="Đặt hàng" stackId="a" fill="#f4b6c2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Orders by Status Bar Chart */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Đơn hàng theo trạng thái</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={statusData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="value" name="Đơn hàng" fill="#f4b6c2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
