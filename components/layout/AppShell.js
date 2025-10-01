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
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={cn(
        "flex flex-1 flex-col overflow-hidden transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-16"
      )}>
        <Topbar />
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
