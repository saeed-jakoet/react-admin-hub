"use client";

import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Zap,
  Globe,
  Activity,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle.js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar({ sidebarOpen }) {
  const { logout, user } = useAuth();

  // Avatar fallback: SP for super_admin, initials for others
  let avatarText = "U";
  if (user?.role === "super_admin") {
    avatarText = "SP";
  } else if (user?.firstname && user?.surname) {
    avatarText = `${user.firstname.charAt(0)}${user.surname.charAt(
      0
    )}`.toUpperCase();
  } else if (user?.email) {
    avatarText = user.email.charAt(0).toUpperCase();
  }

  // Dropdown label: show name/surname for operations_manager, else role
  let dropdownLabel = "";
  if (user?.role === "operations_manager" && user?.firstname && user?.surname) {
    dropdownLabel = `${user.firstname} ${user.surname}`;
  } else if (user?.role) {
    dropdownLabel = user.role
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  } else {
    dropdownLabel = "User";
  }

  return (
    <header className="h-16 bg-white dark:bg-card border border-gray-100/50 dark:border-border/50 rounded-xl shadow-sm mb-6">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search - Sneat Style */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search anything... ⌘K"
              className="pl-10 pr-4 h-10 rounded-lg border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/50 focus:bg-white dark:focus:bg-card focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 text-sm transition-all"
            />
          </div>
        </div>

        {/* Right Actions - Sneat Style */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-muted relative"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-card"></span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu - Sneat Style */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 pl-2 pr-3 rounded-lg hover:bg-gray-100 dark:hover:bg-muted gap-2"
              >
                <Avatar className="h-8 w-8 border-2 border-gray-100 dark:border-border">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-semibold">
                    {avatarText}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-xs font-semibold text-gray-900 dark:text-foreground leading-tight">
                    {user?.user_metadata?.firstName
                      ? user.user_metadata.firstName.charAt(0).toUpperCase() +
                        user.user_metadata.firstName.slice(1)
                      : ""}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-muted-foreground leading-tight">
                    {user?.role?.replace(/_/g, " ") || "Admin"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-60 bg-white dark:bg-card border-gray-100 dark:border-border shadow-xl rounded-xl p-2"
            >
              <DropdownMenuLabel className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-gray-100 dark:border-border">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-semibold">
                      {avatarText}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-gray-900 dark:text-foreground">
                      {user?.user_metadata?.firstName
                        ? user.user_metadata.firstName.charAt(0).toUpperCase() +
                          user.user_metadata.firstName.slice(1)
                        : ""}
                      {user?.user_metadata?.firstName &&
                      user?.user_metadata?.surname
                        ? " "
                        : ""}
                      {user?.user_metadata?.surname
                        ? user.user_metadata.surname.charAt(0).toUpperCase() +
                          user.user_metadata.surname.slice(1)
                        : ""}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-border my-2" />
              <DropdownMenuItem className="px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-muted rounded-lg cursor-pointer">
                <User className="mr-3 h-4 w-4" />
                <span className="text-sm font-medium">My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-muted rounded-lg cursor-pointer">
                <Settings className="mr-3 h-4 w-4" />
                <span className="text-sm font-medium">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-border my-2" />
              <DropdownMenuItem
                className="px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                onClick={logout}
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
