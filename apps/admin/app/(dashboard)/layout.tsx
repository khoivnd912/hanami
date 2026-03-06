"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
