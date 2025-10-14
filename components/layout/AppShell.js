"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "./AppSidebar.js";
import { Topbar } from "./Topbar.js";
import { useAuth } from "@/components/providers/AuthProvider.js";

export function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // Redirect technicians to their dedicated mobile view
  React.useEffect(() => {
    if (user && user.role === "technician" && pathname !== "/technician") {
      router.push("/technician");
    }
  }, [user, pathname, router]);

  // Don't render AppShell for login, forgot password, or technician pages
  if (
    pathname === "/auth/login" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/auth/reset-password" ||
    pathname === "/technician"
  ) {
    return <>{children}</>;
  }

  // Hide sidebar and topbar for technicians
  if (user && user.role === "technician") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <AppSidebar />
      <div className="ml-20">
        {/* Top Bar */}
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
