"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import axios from "axios";
import { isAllowed } from "@/components/providers/accessControl";
import {
  Users,
  Building2,
  Package,
  BarChart3,
  Command,
  Layers,
  Network,
  Activity,
  Calendar,
  FileText,
  Truck,
  Zap,
  ChevronRight,
  Wifi,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationSections = [
  {
    label: "Command Center",
    items: [
      {
        id: "overview",
        label: "Mission Control",
        href: "/",
        icon: Command,
        notification: null,
      },
      {
        id: "operations",
        label: "Live Operations",
        href: "/operations",
        icon: Activity,
        notification: "3",
      },
      {
        id: "network",
        label: "Network Map",
        href: "/network",
        icon: Network,
        notification: null,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        id: "inventory",
        label: "Inventory",
        href: "/inventory",
        icon: Package,
        notification: null,
      },
      {
        id: "teams",
        label: "Field Teams",
        href: "/teams",
        icon: Truck,
        notification: null,
      },
      {
        id: "staff",
        label: "Staff",
        href: "/staff",
        icon: Users,
        notification: null,
      },
      {
        id: "clients",
        label: "Clients",
        href: "/clients",
        icon: Building2,
        notification: null,
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        id: "reports",
        label: "Reports",
        href: "/reports",
        icon: BarChart3,
        notification: null,
      },
      {
        id: "planning",
        label: "Planning",
        href: "/planning",
        icon: Calendar,
        notification: null,
      },
      {
        id: "documents",
        label: "Documents",
        href: "/documents",
        icon: FileText,
        notification: null,
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        id: "logs",
        label: "Audit Logs",
        href: "/logs",
        icon: Shield,
        notification: null,
        roleRequired: "super_admin",
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [supabaseStatus, setSupabaseStatus] = useState({
    status: "loading",
    message: "Checking connection...",
    indicator: "default",
  });

  // Filter navigation items based on user role and allowed paths
  const filteredNavigationSections = navigationSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!user) return false; // Hide all if user not loaded
        return isAllowed(user.role, item.href);
      }),
    }))
    .filter((section) => section.items.length > 0); // Remove empty sections

  useEffect(() => {
    const checkSupabaseStatus = async () => {
      try {
        // Check Supabase public status API
        const response = await axios.get(
          "https://status.supabase.com/api/v2/status.json"
        );

        if (response.data?.status?.indicator === "none") {
          setSupabaseStatus({
            status: "operational",
            message: "All systems operational",
            indicator: "success",
          });
        } else if (response.data?.status?.indicator === "minor") {
          setSupabaseStatus({
            status: "degraded",
            message: "Minor issues detected",
            indicator: "warning",
          });
        } else if (
          response.data?.status?.indicator === "major" ||
          response.data?.status?.indicator === "critical"
        ) {
          setSupabaseStatus({
            status: "outage",
            message: "Service disruption",
            indicator: "error",
          });
        } else {
          setSupabaseStatus({
            status: "unknown",
            message: "Status unknown",
            indicator: "warning",
          });
        }
      } catch (error) {
        console.error("Failed to fetch Supabase status:", error);
        setSupabaseStatus({
          status: "error",
          message: "Connection failed",
          indicator: "error",
        });
      }
    };

    checkSupabaseStatus();
    // Refresh status every 60 seconds
    const interval = setInterval(checkSupabaseStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  const getStatusStyles = () => {
    switch (supabaseStatus.indicator) {
      case "success":
        return {
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-800",
          iconBg: "bg-green-100 dark:bg-green-800/30",
          iconColor: "text-green-600 dark:text-green-400",
          textColor: "text-green-900 dark:text-green-100",
          subTextColor: "text-green-700 dark:text-green-300",
          dotColor: "bg-green-500",
        };
      case "warning":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-200 dark:border-yellow-800",
          iconBg: "bg-yellow-100 dark:bg-yellow-800/30",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          textColor: "text-yellow-900 dark:text-yellow-100",
          subTextColor: "text-yellow-700 dark:text-yellow-300",
          dotColor: "bg-yellow-500",
        };
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
          iconBg: "bg-red-100 dark:bg-red-800/30",
          iconColor: "text-red-600 dark:text-red-400",
          textColor: "text-red-900 dark:text-red-100",
          subTextColor: "text-red-700 dark:text-red-300",
          dotColor: "bg-red-500",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-900/20",
          border: "border-gray-200 dark:border-gray-800",
          iconBg: "bg-gray-100 dark:bg-gray-800/30",
          iconColor: "text-gray-600 dark:text-gray-400",
          textColor: "text-gray-900 dark:text-gray-100",
          subTextColor: "text-gray-700 dark:text-gray-300",
          dotColor: "bg-gray-500",
        };
    }
  };

  const getStatusIcon = () => {
    switch (supabaseStatus.indicator) {
      case "success":
        return CheckCircle2;
      case "warning":
        return AlertCircle;
      case "error":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const styles = getStatusStyles();
  const StatusIcon = getStatusIcon();

  return (
    <aside className="group fixed left-0 top-0 z-50 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 shadow-lg w-20 hover:w-72 transition-all duration-300">
      {/* Clean Header */}
      <div className="h-16 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
        <div className="flex items-center h-full px-4">
          <div className="flex items-center space-x-3">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <div
                className={cn(
                  "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900",
                  styles.dotColor
                )}
              ></div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                FiberOps
              </h1>
              <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                Business Control
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-2 py-6 space-y-6 h-[calc(100vh-4rem)] overflow-hidden">
        {filteredNavigationSections.map((section, sectionIndex) => (
          <div key={section.label} className="space-y-2">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
              <div className="flex items-center space-x-2 px-3 mb-3">
                <Layers className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                <h3 className="text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
                  {section.label}
                </h3>
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-600"></div>
              </div>
            </div>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link key={item.id} href={item.href}>
                    <div
                      className={cn(
                        "group/item relative flex items-center rounded-lg transition-all duration-200",
                        "px-2 py-3 justify-center group-hover:justify-start group-hover:px-4",
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                      )}
                      title={item.label}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center group-hover:mr-3 flex-shrink-0",
                          isActive
                            ? "bg-blue-100 dark:bg-blue-800/30"
                            : "bg-gray-100 dark:bg-slate-700 group-hover/item:bg-gray-200 dark:group-hover/item:bg-slate-600"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5",
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-600 dark:text-slate-400 group-hover/item:text-gray-700 dark:group-hover/item:text-slate-300"
                          )}
                        />
                        {item.notification && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {item.notification}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-1 flex items-center whitespace-nowrap overflow-hidden">
                        <span
                          className={cn(
                            "font-medium",
                            isActive
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-gray-700 dark:text-slate-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white"
                          )}
                        >
                          {item.label}
                        </span>

                        {isActive && (
                          <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-2 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Supabase Status */}
      {/* <div className="absolute bottom-6 left-2 right-2">
        <a
          href="https://status.supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div
            className={cn(
              "border rounded-xl shadow-sm transition-all duration-300 hover:shadow-md",
              styles.bg,
              styles.border,
              "p-2 group-hover:p-4"
            )}
          >
            <div className="flex items-center justify-center group-hover:justify-start group-hover:space-x-3">
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    styles.iconBg
                  )}
                >
                  <StatusIcon className={cn("w-5 h-5", styles.iconColor)} />
                </div>
                <div
                  className={cn(
                    "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900",
                    styles.dotColor,
                    supabaseStatus.status === "loading" && "animate-pulse"
                  )}
                ></div>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-1 whitespace-nowrap overflow-hidden">
                <p className={cn("text-sm font-semibold", styles.textColor)}>
                  Supabase Status
                </p>
                <div className="flex items-center space-x-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      styles.dotColor,
                      supabaseStatus.status === "loading" && "animate-pulse"
                    )}
                  ></div>
                  <p className={cn("text-xs", styles.subTextColor)}>
                    {supabaseStatus.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div> */}
    </aside>
  );
}
