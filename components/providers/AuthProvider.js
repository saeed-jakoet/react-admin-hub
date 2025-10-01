"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated");
      const email = localStorage.getItem("userEmail");
      
      if (authStatus === "true" && email) {
        setIsAuthenticated(true);
        setUserEmail(email);
      } else {
        setIsAuthenticated(false);
        setUserEmail("");
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Handle routing based on auth status
    if (!isLoading) {
      if (!isAuthenticated && pathname !== "/login") {
        router.push("/login");
      } else if (isAuthenticated && pathname === "/login") {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = (email) => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", email);
    setIsAuthenticated(true);
    setUserEmail(email);
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    setUserEmail("");
    router.push("/login");
  };

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-white/70 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
