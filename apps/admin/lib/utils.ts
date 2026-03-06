import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending:   "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  packing:   "Đang đóng gói",
  shipping:  "Đang vận chuyển",
  delivered: "Đã giao hàng",
  cancelled: "Đã hủy",
  refunded:  "Đã hoàn tiền",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  packing:   "bg-purple-100 text-purple-700",
  shipping:  "bg-cyan-100 text-cyan-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
  refunded:  "bg-gray-100 text-gray-600",
};
