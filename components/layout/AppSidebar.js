"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderKanban,
  Users,
  Calendar,
  Building2,
  Wrench,
  HardHat,
  DollarSign,
  Package,
  BarChart3,
  ChevronLeft,
  Menu,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { id: "overview", label: "Overview", href: "/", icon: Home, color: "from-blue-500 to-cyan-500" },
  { id: "projects", label: "Projects", href: "/projects", icon: FolderKanban, color: "from-green-500 to-emerald-500" },
  // { id: "scheduling", label: "Scheduling", href: "/scheduling", icon: Calendar, color: "from-purple-500 to-pink-500" },
  { id: "teams", label: "Teams", href: "/teams", icon: Users, color: "from-orange-500 to-red-500" },
  { id: "staff", label: "Staff", href: "/staff", icon: Users, color: "from-emerald-500 to-teal-500" },
  { id: "clients", label: "Clients", href: "/clients", icon: Building2, color: "from-indigo-500 to-blue-500" },
  // { id: "installations", label: "Installations", href: "/installations", icon: HardHat, color: "from-yellow-500 to-orange-500" },
  // { id: "maintenance", label: "Maintenance", href: "/maintenance", icon: Wrench, color: "from-red-500 to-pink-500" },
  // { id: "finance", label: "Finance", href: "/finance", icon: DollarSign, color: "from-green-500 to-teal-500" },
  { id: "inventory", label: "Inventory", href: "/inventory", icon: Package, color: "from-violet-500 to-purple-500" },
  // { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3, color: "from-cyan-500 to-blue-500" },
];

export function AppSidebar({ open, onToggle }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen gradient-card border-r border-primary/20 transition-all duration-300",
        open ? "w-72" : "w-16"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center px-4 border-b border-primary/20">
        {open ? (
          <>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
                  Fibre Africa
                </h1>
                <p className="text-xs text-muted-foreground">Business Command Center</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="ml-auto h-8 w-8 hover:bg-primary/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg">
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
            className="h-6 w-6 rounded-full shadow-lg"
          >
            <ChevronLeft className="h-3 w-3 rotate-180" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-3 space-y-2">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link key={item.id} href={item.href}>
              <div
                className={cn(
                  "group relative rounded-xl transition-all duration-300 hover:scale-[1.02]",
                  isActive ? "shadow-lg" : "hover:shadow-md"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-cyan-500/20 rounded-xl" />
                )}
                
                <div className={cn("flex items-center p-3 relative", !open && "justify-center")}>
                  <div className="relative">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-300",
                      isActive 
                        ? `bg-gradient-to-br ${item.color} shadow-lg` 
                        : "bg-muted/50 group-hover:bg-primary/10"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5 transition-colors duration-300",
                        isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                      )} />
                    </div>
                  </div>
                  
                  {open && (
                    <div className="ml-3 flex-1">
                      <span className={cn(
                        "font-medium text-sm transition-colors duration-300",
                        isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                      )}>
                        {item.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Status */}
      {open && (
        <div className="absolute bottom-4 left-3 right-3">
          <div className="gradient-card p-4 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">System Online</p>
                <p className="text-xs text-muted-foreground">All services running</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
