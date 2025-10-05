"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Wifi
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
    ]
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
    ]
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
    ]
  }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 shadow-lg">
      {/* Clean Header */}
      <div className="h-16 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
        <div className="flex items-center h-full px-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">FiberOps</h1>
              <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">Business Control</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)]">
        {navigationSections.map((section, sectionIndex) => (
          <div key={section.label} className="space-y-2">
            <div className="flex items-center space-x-2 px-3 mb-3">
              <Layers className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              <h3 className="text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
                {section.label}
              </h3>
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-600"></div>
            </div>
            
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                
                return (
                  <Link key={item.id} href={item.href}>
                    <div className={cn(
                      "group relative flex items-center px-4 py-3 rounded-lg",
                      isActive 
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600 dark:border-blue-400" 
                        : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    )}>
                      
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mr-3",
                        isActive 
                          ? "bg-blue-100 dark:bg-blue-800/30" 
                          : "bg-gray-100 dark:bg-slate-700 group-hover:bg-gray-200 dark:group-hover:bg-slate-600"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5",
                          isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300"
                        )} />
                      </div>
                      
                      <div className="flex-1">
                        <span className={cn(
                          "font-medium",
                          isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white"
                        )}>
                          {item.label}
                        </span>
                      </div>
                      
                      {item.notification && (
                        <div className="ml-auto">
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {item.notification}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-2" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* System Status */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-800/30 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">System Status</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs text-green-700 dark:text-green-300">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
