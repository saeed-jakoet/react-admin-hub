"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar.js";
import { Topbar } from "./Topbar.js";
import { cn } from "@/lib/utils";

export function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const pathname = usePathname();

  // Don't render AppShell for login or forgot password pages
  if (pathname === "/auth/login" || pathname === "/auth/forgot-password") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <AppSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={cn(
        "min-h-screen transition-all duration-300 p-6",
        sidebarOpen ? "ml-64" : "ml-16"
      )}>
        <Topbar sidebarOpen={sidebarOpen} />
        <main className="bg-gray-50 dark:bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
