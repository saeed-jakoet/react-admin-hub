"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UsersRound,
  UserCog,
  Wrench,
  FileText,
  BarChart3,
  Settings,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Clients", href: "/clients", icon: Building2 },
  { label: "Teams", href: "/teams", icon: UsersRound },
  { label: "Staff", href: "/staff", icon: Users },
  { label: "Users", href: "/users", icon: UserCog },
  { label: "Maintenance", href: "/maintenance", icon: Wrench },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar({ open }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300",
        open ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-16 items-center justify-center border-b px-4">
        <h1 className={cn("font-bold text-primary transition-opacity", open ? "text-xl" : "text-lg opacity-0")}>
          Fibre Africa
        </h1>
      </div>
      <nav className="space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  !open && "justify-center px-2"
                )}
                title={!open ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5", open && "mr-3")} />
                {open && <span>{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
