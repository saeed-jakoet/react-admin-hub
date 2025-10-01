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

export function Topbar() {
  const { logout, user } = useAuth();
  console.log(user);

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
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-background border-b border-gray-200 dark:border-border">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search projects, clients, teams..."
              className="pl-10 pr-4 h-9 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Bell className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">
                    {avatarText}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white border-gray-200 shadow-lg"
            >
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-gray-900">
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
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem className="text-gray-700 hover:bg-gray-50">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-700 hover:bg-gray-50">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem
                className="text-red-600 hover:bg-red-50"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
