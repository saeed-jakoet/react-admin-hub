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
        "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-background border-r border-gray-100 dark:border-border transition-all duration-300",
        open ? "w-64" : "w-16"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center px-4 border-b border-gray-100 dark:border-border relative">
        {open ? (
          <>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-foreground">
                  Fiber Africa
                </h1>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">
                  Command Center
                </p>
              </div>
            </div>
            {/* Collapse button when open */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-6 w-6 rounded-full"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
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
            className="h-6 w-6 rounded-full shadow-lg"
            aria-label="Expand sidebar"
          >
            <ChevronLeft className="h-3 w-3 rotate-180" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="px-3 py-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.id} href={item.href}>
              <div
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-primary/10 dark:text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-muted-foreground dark:hover:bg-muted/50 dark:hover:text-foreground",
                  !open && "justify-center px-2"
                )}
              >
                <Icon className={cn("h-5 w-5", item.iconColor)} />
                {open && <span className="ml-3 truncate">{item.label}</span>}
                {open && item.notification && (
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      {item.notification}
                    </span>
                  </div>
                )}
                {open && isActive && !item.notification && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-primary" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Status and Logout */}
      {open && (
        <div className="absolute bottom-4 left-3 right-3 flex flex-col gap-2">
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-green-500 dark:bg-green-700 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white dark:bg-green-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Network Online
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  All systems operational
                </p>
              </div>
            </div>
          </div>
          {/* Logout button removed as it exists in the top bar */}
        </div>
      )}
    </aside>
  );
}
