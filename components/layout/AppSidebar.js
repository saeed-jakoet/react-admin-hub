"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCallback } from "react";
import { get } from "@/lib/api/fetcher";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
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
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { APP_VERSION } from "@/lib/version";

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
        id: "map",
        label: "Map",
        href: "/map",
        icon: Network,
        notification: null,
      },
      // {
      //   id: "operations",
      //   label: "Live Operations",
      //   href: "/operations",
      //   icon: Activity,
      //   notification: "3",
      // },
      // {
      //   id: "network",
      //   label: "Network Map",
      //   href: "/network",
      //   icon: Network,
      //   notification: null,
      // },
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
        id: "staff",
        label: "Staff",
        href: "/staff",
        icon: Users,
        notification: null,
      },
      {
        id: "teams",
        label: "Field Teams",
        href: "/teams",
        icon: Layers,
        notification: null,
      },
      {
        id: "fleet",
        label: "Fleet Management",
        href: "/fleet",
        icon: Truck,
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
      // {
      //   id: "reports",
      //   label: "Reports",
      //   href: "/reports",
      //   icon: BarChart3,
      //   notification: null,
      // },
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
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [showTree, setShowTree] = useState(false);

  const fetchClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      const response = await get("/client");
      setClients(response.data || []);
    } catch (e) {
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (clients.length === 0 && !clientsLoading) {
      fetchClients();
    }
  }, [fetchClients, clients.length, clientsLoading]);

  const filteredNavigationSections = navigationSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!user) return false;
        return isAllowed(user.role, item.href);
      }),
    }))
    .filter((section) => section.items.length > 0);

  // Close any open select dropdowns when sidebar is hovered
  useEffect(() => {
    const handleMouseEnter = () => {
      // Blur any focused element (closes select dropdowns)
      if (document.activeElement && document.activeElement.tagName === 'SELECT') {
        document.activeElement.blur();
      }
      // Also blur any other focused input elements
      const activeEl = document.activeElement;
      if (activeEl && activeEl !== document.body) {
        activeEl.blur();
      }
    };

    const sidebar = document.querySelector('aside.group');
    if (sidebar) {
      sidebar.addEventListener('mouseenter', handleMouseEnter);
      return () => {
        sidebar.removeEventListener('mouseenter', handleMouseEnter);
      };
    }
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      <aside className="group fixed left-0 top-0 z-[9999] h-screen bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80 w-20 hover:w-72 transition-[width] duration-300 ease-in-out">
        {/* Header */}
        <div className="h-16 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center h-full px-5 mt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-shrink-0">
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={55}
                  height={55}
                  className="object-contain"
                />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
                <h1 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
                  Fiber Africa
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Operations Center
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-6 space-y-8 h-[calc(100vh-4rem)] overflow-hidden hover:overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {filteredNavigationSections.map((section) => (
            <div key={section.label} className="space-y-1">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden mb-3">
                <div className="flex items-center gap-2 px-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {section.label}
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                </div>
              </div>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  if (item.id === "clients") {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith("/clients");
                    return (
                      <div
                        key="clients"
                        onMouseEnter={() => setShowTree(true)}
                        onMouseLeave={() => setShowTree(false)}
                      >
                        <Link href="/clients">
                          <div
                            className={cn(
                              "group/item relative flex items-center rounded-xl transition-all duration-200",
                              "px-2 py-2.5 justify-center group-hover:justify-start group-hover:px-3 w-full cursor-pointer",
                              isActive
                                ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500 shadow-none"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 border-l-4 border-transparent"
                            )}
                            title="Clients"
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center group-hover:mr-3 flex-shrink-0 transition-all duration-200",
                                isActive
                                  ? "bg-blue-50 dark:bg-blue-900/30"
                                  : "bg-slate-100 dark:bg-slate-900 group-hover/item:bg-slate-200 dark:group-hover/item:bg-slate-800"
                              )}
                            >
                              <Icon
                                className={cn(
                                  "w-[18px] h-[18px]",
                                  isActive
                                    ? "text-slate-500"
                                    : "text-slate-500 dark:text-slate-400"
                                )}
                              />
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-1 flex items-center whitespace-nowrap overflow-hidden">
                              <span className={cn("text-sm font-medium")}>
                                Clients
                              </span>
                            </div>
                          </div>
                        </Link>

                        {/* Client Tree */}
                        <div
                          className={cn(
                            "ml-11 mt-1 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-800 pl-3 overflow-hidden transition-all duration-300 ease-out",
                            showTree && clients.length > 0
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          )}
                        >
                          {clientsLoading ? (
                            <div className="text-xs text-slate-400 dark:text-slate-500 py-2 animate-pulse">
                              Loading...
                            </div>
                          ) : clients.length === 0 ? (
                            <div className="text-xs text-slate-400 dark:text-slate-500 py-2">
                              No clients
                            </div>
                          ) : (
                            clients.map((client, index) => {
                              const activeClient = pathname.startsWith(
                                `/clients/${client.id}`
                              );
                              return (
                                <Link
                                  key={client.id}
                                  href={`/clients/${client.id}`}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm group/client",
                                    activeClient
                                      ? "bg-slate-100 dark:bg-slate-800 text-slate-600 font-medium shadow-sm"
                                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50"
                                  )}
                                  style={{
                                    animationDelay: `${index * 30}ms`,
                                    animation: showTree
                                      ? "slideIn 0.3s ease-out forwards"
                                      : "none",
                                  }}
                                >
                                  <span
                                    className={cn(
                                      "w-1.5 h-1.5 rounded-full transition-all duration-200",
                                      activeClient
                                        ? "bg-emerald-500 scale-110"
                                        : "bg-slate-300 dark:bg-slate-700 group-hover/client:bg-slate-400 dark:group-hover/client:bg-slate-600"
                                    )}
                                  />
                                  <span className="truncate">
                                    {client.company_name || "(No name)"}
                                  </span>
                                </Link>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Default navigation item
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link key={item.id} href={item.href}>
                      <div
                        className={cn(
                          "group/item relative flex items-center rounded-xl transition-all duration-200",
                          "px-2 py-2.5 justify-center group-hover:justify-start group-hover:px-3",
                          isActive
                            ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500 shadow-none"
                            : "text-gray-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/40 border-l-4 border-transparent"
                        )}
                        title={item.label}
                      >
                        <div
                          className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center group-hover:mr-3 flex-shrink-0 transition-all duration-200 relative",
                            isActive
                              ? "bg-blue-50 dark:bg-blue-900/30"
                              : "bg-gray-100 dark:bg-slate-700 group-hover/item:bg-gray-200 dark:group-hover/item:bg-slate-600"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-[18px] h-[18px]",
                              isActive
                                ? "text-slate-500"
                                : "text-slate-500 dark:text-slate-400"
                            )}
                          />
                          {item.notification && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                              <span className="text-[10px] font-bold text-white">
                                {item.notification}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-1 flex items-center justify-between whitespace-nowrap overflow-hidden">
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                          {isActive && (
                            <ChevronRight className="w-4 h-4 flex-shrink-0" />
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
        {/* Version at the very bottom */}
        <div className="absolute bottom-0 left-0 w-full py-2 text-center text-xs text-gray-400 dark:text-gray-600 select-none">
         v.{APP_VERSION}
        </div>
      </aside>
    </>
  );
}
