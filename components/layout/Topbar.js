"use client";

import { Search, Bell, Settings, User, LogOut, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle.js";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  const router = useRouter();

  const notificationCount = 3; // This would come from your state/API

  return (
    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-10">
      <div className="flex h-full items-center justify-between px-8">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <Input
              placeholder="Search anything..."
              className="pl-12 pr-4 h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all shadow-sm hover:shadow-md text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 ml-6">
          {/* Quick Actions Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            title="Quick Actions"
          >
            <Zap className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 relative transition-all"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 border-2 border-white dark:border-slate-900"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xl rounded-xl p-0"
            >
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Notifications
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold"
                  >
                    {notificationCount} new
                  </Badge>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {/* Sample Notification Items */}
                {[1, 2, 3].map((i) => (
                  <DropdownMenuItem
                    key={i}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                  >
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          New job assigned
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Drop cable installation for Site B
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
                >
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <div className="pl-2">
            <ThemeToggle className="h-11 w-11 rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all" />
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-12 pl-3 pr-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 gap-3 transition-all"
              >
                <Avatar className="h-9 w-9 ring-2 ring-slate-200 dark:ring-slate-700">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold">
                    {user?.user_metadata.firstName.charAt(0).toUpperCase()}
                    {user?.user_metadata.surname.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {user?.user_metadata?.firstName
                      ? `${user.user_metadata.firstName
                          .charAt(0)
                          .toUpperCase()}${user.user_metadata.firstName.slice(1)}`
                      : "User"}{" "}
                    {user?.user_metadata?.surname
                      ? `${user.user_metadata.surname
                          .charAt(0)
                          .toUpperCase()}${user.user_metadata.surname.slice(1)}`
                      : ""}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.role
                      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      : "User"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xl rounded-xl p-2"
            >
              <DropdownMenuLabel className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-slate-200 dark:ring-slate-700">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold">
                      {user?.user_metadata.firstName.charAt(0).toUpperCase()}
                      {user?.user_metadata.surname.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {user?.user_metadata?.firstName
                        ? `${user.user_metadata.firstName
                            .charAt(0)
                            .toUpperCase()}${user.user_metadata.firstName.slice(1)}`
                        : "User"}{" "}
                      {user?.user_metadata?.surname
                        ? `${user.user_metadata.surname
                            .charAt(0)
                            .toUpperCase()}${user.user_metadata.surname.slice(1)}`
                        : ""}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2 bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => router.push("/settings")}
              >
                <User className="mr-3 h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
                <span className="font-medium">My Profile</span>
              </DropdownMenuItem>
              {/* <DropdownMenuItem
                className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => router.push("/settings")}
              >
                <Settings className="mr-3 h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
                <span className="font-medium">Settings</span>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator className="my-2 bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold"
                onClick={logout}
              >
                <LogOut className="mr-3 h-4.5 w-4.5" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
