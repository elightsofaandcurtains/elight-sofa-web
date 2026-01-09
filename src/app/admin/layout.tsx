"use client";

import AdminSidebar from "@/components/AdminSidebar";
import AdminGuard from "@/components/AdminGuard";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard requiredRoles={["admin", "manager"]}>
      <div className="min-h-screen bg-[#F9F8F6]">
        <AdminSidebar />
        <main className="md:ml-16 lg:ml-64 p-3 md:p-4 lg:p-8 pt-20 md:pt-4">{children}</main>
      </div>
    </AdminGuard>
  );
}
