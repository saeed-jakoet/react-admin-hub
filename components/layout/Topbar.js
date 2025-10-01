"use client";

import { Search, Bell, Settings, User, LogOut, Zap, Globe, Activity } from "lucide-react";
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
  const { logout, userEmail } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-gradient-to-r from-background via-muted/20 to-primary/5 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-full items-center gap-6 px-6">
        {/* Enhanced Search */}
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search operations, teams, clients..." 
              className="pl-12 pr-4 h-11 bg-gradient-to-r from-background/80 to-muted/30 border border-border/50 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-sm" 
            />
          </div>
        </div>

        {/* Status Indicators */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg backdrop-blur-sm">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-sm" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">Online</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
            <Globe className="h-3 w-3 text-blue-500" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Connected</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* Quick Action */}
          <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 rounded-xl transition-all duration-300 group">
            <Zap className="h-5 w-5 text-yellow-500 group-hover:scale-110 transition-transform duration-200" />
          </Button>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 rounded-xl transition-all duration-300">
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-xs text-white font-bold">3</span>
            </div>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-xl hover:bg-primary/10 transition-all duration-300">
                <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-primary/30 shadow-lg">
                    <AvatarImage src="/avatars/user.png" alt="Operations Manager" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-cyan-500 text-white font-bold">OM</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 border-2 border-background shadow-sm">
                    <div className="h-full w-full rounded-full bg-white/20 animate-pulse" />
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-gradient-to-br from-background to-muted/30 border border-border/50 shadow-xl backdrop-blur-sm">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-primary/30">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-cyan-500 text-white text-xs font-bold">OM</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">Operations Manager</p>
                      <p className="text-xs text-muted-foreground">{userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <Activity className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Active Session</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem className="hover:bg-primary/5 rounded-lg mx-1 transition-colors duration-200">
                <User className="mr-3 h-4 w-4" />
                Profile & Account
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-primary/5 rounded-lg mx-1 transition-colors duration-200">
                <Settings className="mr-3 h-4 w-4" />
                System Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                className="text-red-500 hover:bg-red-500/10 rounded-lg mx-1 transition-colors duration-200"
                onClick={logout}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
