"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar.js";
import { Topbar } from "./Topbar.js";
import { cn } from "@/lib/utils";

export function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const pathname = usePathname();

  // Don't render AppShell for login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={cn(
        "flex flex-1 flex-col overflow-hidden transition-all duration-300", 
        sidebarOpen ? "ml-72" : "ml-16"
      )}>
        <Topbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
