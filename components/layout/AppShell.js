"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar.js";
import { Topbar } from "./Topbar.js";

export function AppShell({ children }) {
  const pathname = usePathname();

  // Don't render AppShell for login or forgot password pages
  if (
    pathname === "/auth/login" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/auth/reset-password"
  ) {
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
