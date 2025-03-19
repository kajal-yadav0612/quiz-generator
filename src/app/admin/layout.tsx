"use client";
import { AdminNavbar } from "@/ui/components/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
