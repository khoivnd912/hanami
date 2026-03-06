"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  BarChart3, Settings, LogOut, Flower2, Boxes,
  Tag, ScrollText, ChevronRight, MessageSquareHeart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",            label: "Tổng quan",       icon: LayoutDashboard },
  { href: "/dashboard/orders",     label: "Đơn hàng",        icon: ShoppingBag },
  { href: "/dashboard/products",        label: "Sản phẩm",        icon: Package },
  { href: "/dashboard/consultations",   label: "Tư vấn hoa",      icon: MessageSquareHeart },
  { href: "/dashboard/customers",       label: "Khách hàng",      icon: Users },
  { href: "/dashboard/inventory",  label: "Tồn kho",         icon: Boxes },
  { href: "/dashboard/coupons",    label: "Mã giảm giá",     icon: Tag },
  { href: "/dashboard/analytics",  label: "Phân tích",       icon: BarChart3 },
  { href: "/dashboard/audit",      label: "Nhật ký hệ thống",icon: ScrollText },
  { href: "/dashboard/settings",   label: "Cài đặt",         icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  function logout() {
    localStorage.removeItem("admin_token");
    router.replace("/login");
  }

  return (
    <aside
      className="flex flex-col w-60 min-h-screen border-r"
      style={{ background: "#1e0d16", borderColor: "rgba(249,168,212,0.25)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "rgba(249,168,212,0.25)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #f9a8d4, #db2777)" }}
        >
          <Flower2 size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">Hanami</p>
          <p className="text-[10px]" style={{ color: "rgba(236,72,153,0.7)" }}>Admin Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group",
                active
                  ? "text-white font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
              style={active ? { background: "rgba(249,168,212,0.35)", color: "#f9a8d4" } : {}}
            >
              <Icon size={16} className={active ? "text-pink-400" : "text-gray-500 group-hover:text-gray-300"} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={13} className="text-pink-400/50" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(249,168,212,0.25)" }}>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
