"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderKanban,
  Users,
  Building2,
  Wrench,
  Package,
  BarChart3,
  ChevronLeft,
  Zap,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    id: "overview",
    label: "Overview",
    href: "/",
    icon: Home,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100",
    notification: null,
  },
  // {
  //   id: "projects",
  //   label: "Projects",
  //   href: "/projects",
  //   icon: FolderKanban,
  //   iconColor: "text-purple-600",
  //   bgColor: "bg-purple-100",
  //   notification: null,
  // },
  {
    id: "teams",
    label: "Teams",
    href: "/teams",
    icon: Users,
    iconColor: "text-green-600",
    bgColor: "bg-green-100",
    notification: null,
  },
  {
    id: "staff",
    label: "Staff",
    href: "/staff",
    icon: Users,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-100",
    notification: null,
  },
  {
    id: "clients",
    label: "Clients",
    href: "/clients",
    icon: Building2,
    iconColor: "text-red-600",
    bgColor: "bg-red-100",
    notification: null,
  },
  {
    id: "inventory",
    label: "Inventory",
    href: "/inventory",
    icon: Package,
    iconColor: "text-indigo-600",
    bgColor: "bg-indigo-100",
    notification: null,
  },
  // {
  //   id: "maintenance",
  //   label: "Maintenance",
  //   href: "/maintenance",
  //   icon: Wrench,
  //   iconColor: "text-yellow-600",
  //   bgColor: "bg-yellow-100",
  //   notification: "3",
  // },
  // {
  //   id: "reports",
  //   label: "Reports",
  //   href: "/reports",
  //   icon: BarChart3,
  //   iconColor: "text-cyan-600",
  //   bgColor: "bg-cyan-100",
  //   notification: null,
  // },
  // {
  //   id: "settings",
  //   label: "Settings",
  //   href: "/settings",
  //   icon: Settings,
  //   iconColor: "text-gray-600",
  //   bgColor: "bg-gray-100",
  //   notification: null,
  // },
];

export function AppSidebar({ open, onToggle }) {
  const pathname = usePathname();
  // ...existing code...

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-card border-r border-gray-100/50 dark:border-border/50 transition-all duration-300 shadow-sm",
        open ? "w-64" : "w-16"
      )}
    >
      {/* Header - Sneat Style */}
      <div className="flex h-16 items-center px-4 border-b border-gray-100/50 dark:border-border/50 relative">
        {open ? (
          <>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-foreground text-base">
                  Fiber Africa
                </h1>
              </div>
            </div>
            {/* Collapse button when open */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-7 w-7 rounded-md hover:bg-gray-100 dark:hover:bg-muted"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Expand button when collapsed */}
      {!open && (
        <div className="absolute top-4 -right-3 z-50">
          <Button
            variant="default"
            size="icon"
            onClick={onToggle}
            className="h-6 w-6 rounded-full shadow-md bg-white dark:bg-card border border-gray-200 dark:border-border hover:bg-gray-50"
            aria-label="Expand sidebar"
          >
            <ChevronLeft className="h-3 w-3 rotate-180 text-gray-600" />
          </Button>
        </div>
      )}

      {/* Navigation - Clean Sneat Style */}
      <nav className="px-3 py-6 space-y-1.5">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.id} href={item.href}>
              <div
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 dark:from-indigo-950/30 dark:to-purple-950/30 dark:text-indigo-400 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-muted/50",
                  !open && "justify-center px-2"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                  isActive ? "bg-white dark:bg-card shadow-sm" : ""
                )}>
                  <Icon className={cn(
                    "h-4.5 w-4.5 transition-colors",
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"
                  )} />
                </div>
                {open && <span className="ml-3 truncate">{item.label}</span>}
                {open && item.notification && (
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white">
                      {item.notification}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Card - Sneat Style */}
      {open && (
        <div className="absolute bottom-6 left-3 right-3">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/50 dark:border-green-800/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-green-500 dark:bg-green-600 flex items-center justify-center shadow-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                  All Systems Online
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                  99.9% uptime today
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
