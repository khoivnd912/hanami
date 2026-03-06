"use client";

import { useEffect, useState } from "react";
import { api, type AdminStats } from "@/lib/api";
import { formatVND } from "@/lib/utils";
import { BarChart3, RefreshCw, TrendingUp, ShoppingBag, Users, DollarSign } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

type Range = "7d" | "30d" | "90d";
const RANGES: { v: Range; l: string }[] = [
  { v: "7d", l: "7 ngày" }, { v: "30d", l: "30 ngày" }, { v: "90d", l: "90 ngày" },
];

export default function AnalyticsPage() {
  const [stats,   setStats]   = useState<AdminStats | null>(null);
  const [range,   setRange]   = useState<Range>("30d");
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

  useEffect(() => { load(); }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  const statusData = stats
    ? Object.entries(stats.ordersByStatus).map(([k, v]) => ({ name: k, value: v }))
    : [];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#f9a8d4,#db2777)" }}>
            <BarChart3 size={17} className="text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Phân tích</h1>
        </div>
        <div className="flex items-center gap-2">
          {RANGES.map(({ v, l }) => (
            <button key={v} onClick={() => setRange(v)}
              className={`px-3 py-1.5 text-xs rounded-xl transition-colors font-medium ${
                range === v ? "text-white" : "text-gray-500 hover:text-gray-700"
              }`}
              style={range === v ? { background: "rgba(249,168,212,0.35)" } : {}}>
              {l}
            </button>
          ))}
          <button onClick={load} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Doanh thu", value: formatVND(stats?.kpis.revenue ?? 0), icon: DollarSign, color: "#10b981" },
          { label: "Đơn hàng", value: String(stats?.kpis.totalOrders ?? 0), icon: ShoppingBag, color: "#f9a8d4" },
          { label: "Giá trị TB", value: formatVND(stats?.kpis.avgOrderValue ?? 0), icon: TrendingUp, color: "#f59e0b" },
          { label: "Khách mới", value: String(stats?.kpis.newCustomers ?? 0), icon: Users, color: "#8b5cf6" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4 border"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(249,168,212,0.20)" }}>
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 w-20 rounded animate-pulse bg-white/5" />
                <div className="h-7 w-32 rounded animate-pulse bg-white/5" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} style={{ color }} />
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Revenue Line Chart */}
      <div className="rounded-2xl p-5 border"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(249,168,212,0.20)" }}>
        <h2 className="text-sm font-medium text-gray-600 mb-4">Doanh thu theo ngày</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={stats?.revenueByDay ?? []} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="_id" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "#1e0d16", border: "1px solid rgba(249,168,212,0.35)", borderRadius: "12px", fontSize: 12 }}
              labelStyle={{ color: "#f9a8d4" }}
              formatter={(v: number) => [formatVND(v), "Doanh thu"]} />
            <Line type="monotone" dataKey="revenue" stroke="#f9a8d4" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders by Status Bar Chart */}
      <div className="rounded-2xl p-5 border"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(249,168,212,0.20)" }}>
        <h2 className="text-sm font-medium text-gray-600 mb-4">Đơn hàng theo trạng thái</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={statusData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#1e0d16", border: "1px solid rgba(249,168,212,0.35)", borderRadius: "12px", fontSize: 12 }}
              labelStyle={{ color: "#f9a8d4" }} />
            <Bar dataKey="value" fill="#f9a8d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
