"use client";

import { useEffect, useState, useCallback } from "react";
import { api, type AdminOrder, type PaginatedOrders } from "@/lib/api";
import { formatVND, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, cn } from "@/lib/utils";
import {
  Search, X,
  Package, MapPin, Phone, FileText,
  Clock, CheckCircle2, Truck, AlertCircle,
} from "lucide-react";
import { Pagination } from "@/components/Pagination";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "pending",   label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "packing",   label: "Đang đóng gói" },
  { value: "shipping",  label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];

const NEXT_STATUS: Record<string, { value: string; label: string; color: string }[]> = {
  pending:   [{ value: "confirmed", label: "Xác nhận", color: "bg-blue-500" }, { value: "cancelled", label: "Hủy", color: "bg-red-500" }],
  confirmed: [{ value: "packing",   label: "Bắt đầu đóng gói", color: "bg-purple-500" }],
  packing:   [{ value: "shipping",  label: "Giao cho vận chuyển", color: "bg-cyan-600" }],
  shipping:  [{ value: "delivered", label: "Xác nhận đã giao", color: "bg-emerald-600" }],
};

export default function OrdersPage() {
  const [data,       setData]       = useState<PaginatedOrders | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [limit,      setLimit]      = useState(20);
  const [search,     setSearch]     = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [selected,   setSelected]   = useState<AdminOrder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [trackingInput, setTracking] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search) params.q = search;
      if (statusFilter) params.status = statusFilter;
      setData(await api.getOrders(params));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleStatusUpdate(orderId: string, status: string) {
    setActionLoading(true);
    try {
      const updated = await api.updateOrderStatus(orderId, status);
      setSelected(updated);
      load();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTracking() {
    if (!selected || !trackingInput.trim()) return;
    setActionLoading(true);
    try {
      const updated = await api.updateTracking(selected._id, trackingInput.trim());
      setSelected(updated);
      setTracking("");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Orders list ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Đơn hàng</h1>
            {data && <p className="text-sm text-gray-500">Tổng: {data.total} đơn</p>}
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-0 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Tìm mã đơn..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-pink-400 transition-colors"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-pink-400"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Mã đơn</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">Sản phẩm</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Tổng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Thanh toán</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.items.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => setSelected(order)}
                    className={cn(
                      "hover:bg-gray-50 cursor-pointer transition-colors",
                      selected?._id === order._id && "bg-pink-50"
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-800 whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{order.shippingAddress.name}</p>
                      <p className="text-xs text-gray-400">{order.shippingAddress.phone}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-gray-600 text-xs">{order.items.length} sản phẩm</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {formatVND(order.total)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 uppercase hidden md:table-cell">
                      {order.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap", ORDER_STATUS_COLORS[order.status])}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap hidden md:table-cell">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
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

      {/* ── Order detail drawer ──────────────────────────────────────────── */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSelected(null)} />
          <div className="fixed right-0 inset-y-0 w-full max-w-sm z-40 lg:static lg:w-96 lg:max-w-none border-l border-gray-100 bg-white flex flex-col overflow-hidden shadow-xl">
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400">Chi tiết đơn hàng</p>
              <p className="font-mono font-semibold text-gray-900">{selected.orderNumber}</p>
            </div>
            <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Status badge + actions */}
            <div>
              <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", ORDER_STATUS_COLORS[selected.status])}>
                {ORDER_STATUS_LABELS[selected.status]}
              </span>
              {NEXT_STATUS[selected.status] && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {NEXT_STATUS[selected.status].map((s) => (
                    <button
                      key={s.value}
                      onClick={() => handleStatusUpdate(selected._id, s.value)}
                      disabled={actionLoading}
                      className={cn("text-xs px-3 py-1.5 rounded-lg text-white font-medium disabled:opacity-60", s.color)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                <Package size={11} className="inline mr-1" />Sản phẩm
              </p>
              <div className="space-y-2">
                {selected.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.nameVi}</p>
                      <p className="text-xs text-gray-400">x{item.qty} · {formatVND(item.unitPrice)}/cái</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "#d96b82" }}>{formatVND(item.subtotal)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between"><span>Tạm tính</span><span>{formatVND(selected.total - selected.shippingFee + selected.discount)}</span></div>
                <div className="flex justify-between"><span>Phí ship</span><span>{selected.shippingFee === 0 ? "Miễn phí" : formatVND(selected.shippingFee)}</span></div>
                {selected.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Giảm giá</span><span>– {formatVND(selected.discount)}</span></div>}
                <div className="flex justify-between font-bold text-sm text-gray-900 pt-1 border-t border-gray-100">
                  <span>Tổng thanh toán</span><span style={{ color: "#d96b82" }}>{formatVND(selected.total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                <MapPin size={11} className="inline mr-1" />Địa chỉ giao hàng
              </p>
              <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
                <p className="font-medium text-gray-800">{selected.shippingAddress.name}</p>
                <p className="flex items-center gap-1.5 text-gray-600"><Phone size={11} />{selected.shippingAddress.phone}</p>
                <p className="text-gray-600 text-xs leading-5">{selected.shippingAddress.full}</p>
              </div>
            </div>

            {/* Note */}
            {selected.note && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  <FileText size={11} className="inline mr-1" />Ghi chú
                </p>
                <p className="text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-xl p-3">{selected.note}</p>
              </div>
            )}

            {/* Tracking code */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                <Truck size={11} className="inline mr-1" />Mã vận đơn
              </p>
              {selected.trackingCode ? (
                <p className="font-mono text-sm bg-gray-50 rounded-xl px-3 py-2 text-gray-800">{selected.trackingCode}</p>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text" value={trackingInput}
                    onChange={(e) => setTracking(e.target.value)}
                    placeholder="Nhập mã vận đơn..."
                    className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-pink-400"
                  />
                  <button
                    onClick={handleTracking} disabled={!trackingInput.trim() || actionLoading}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-white disabled:opacity-50"
                    style={{ background: "#f4b6c2" }}
                  >
                    Lưu
                  </button>
                </div>
              )}
            </div>

            {/* Status history */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                <Clock size={11} className="inline mr-1" />Lịch sử trạng thái
              </p>
              <div className="space-y-2">
                {selected.statusHistory.map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 size={11} className="text-pink-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">{ORDER_STATUS_LABELS[h.status] ?? h.status}</p>
                      <p className="text-[10px] text-gray-400">{formatDate(h.at)}</p>
                      {h.note && <p className="text-[10px] text-gray-500 mt-0.5">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
