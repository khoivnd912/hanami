"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  BarChart3, Settings, LogOut, Flower2, Boxes,
  Tag, ScrollText, ChevronRight, MessageSquareHeart, FileText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",                  label: "Tổng quan",        icon: LayoutDashboard },
  { href: "/dashboard/orders",           label: "Đơn hàng",         icon: ShoppingBag },
  { href: "/dashboard/products",         label: "Sản phẩm",         icon: Package },
  { href: "/dashboard/consultations",    label: "Tư vấn hoa",       icon: MessageSquareHeart },
  { href: "/dashboard/customers",        label: "Khách hàng",       icon: Users },
  { href: "/dashboard/inventory",        label: "Tồn kho",          icon: Boxes },
  { href: "/dashboard/coupons",          label: "Mã giảm giá",      icon: Tag },
  { href: "/dashboard/content",          label: "Nội dung trang",   icon: FileText },
  { href: "/dashboard/analytics",        label: "Phân tích",        icon: BarChart3 },
  { href: "/dashboard/audit",            label: "Nhật ký hệ thống", icon: ScrollText },
  { href: "/dashboard/settings",         label: "Cài đặt",          icon: Settings },
];

interface Props {
  open?:    boolean;
  onClose?: () => void;
}

export function AdminSidebar({ open = false, onClose }: Props) {
  const pathname = usePathname();
  const router   = useRouter();

  function logout() {
    localStorage.removeItem("admin_token");
    router.replace("/login");
  }

  function handleNav() {
    onClose?.();
  }

  const sidebar = (
    <aside
      className="flex flex-col w-60 h-full border-r"
      style={{ background: "#380d1c", borderColor: "rgba(244,182,194,0.25)" }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b flex-shrink-0" style={{ borderColor: "rgba(244,182,194,0.25)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#f4b6c2", color: "#333333" }}>
            <Flower2 size={16} className="text-[#555]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">Hanami</p>
            <p className="text-[10px]" style={{ color: "rgba(244,182,194,0.7)" }}>Admin Portal</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={handleNav}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group",
                active
                  ? "text-white font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
              style={active ? { background: "rgba(244,182,194,0.35)", color: "#f4b6c2" } : {}}
            >
              <Icon size={16} className={active ? "text-pink-400" : "text-gray-500 group-hover:text-gray-300"} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={13} className="text-pink-400/50" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t flex-shrink-0" style={{ borderColor: "rgba(244,182,194,0.25)" }}>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop: always-visible fixed sidebar ── */}
      <div className="hidden lg:flex flex-col w-60 min-h-screen flex-shrink-0">
        {sidebar}
      </div>

      {/* ── Mobile: overlay drawer ── */}
      <div className={cn(
        "lg:hidden fixed inset-0 z-50 transition-all duration-300",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}>
        {/* Backdrop */}
        <div
          className={cn("absolute inset-0 bg-black/40 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
          onClick={onClose}
        />
        {/* Drawer */}
        <div className={cn(
          "absolute left-0 top-0 h-full w-60 transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}>
          {sidebar}
        </div>
      </div>
    </>
  );
}
