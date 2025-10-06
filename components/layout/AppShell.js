"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar.js";
import { Topbar } from "./Topbar.js";

export function AppShell({ children }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Don't render AppShell for login or forgot password pages
  if (pathname === "/auth/login" || pathname === "/auth/forgot-password") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <AppSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
              {/* Top Bar */}
      <Topbar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
