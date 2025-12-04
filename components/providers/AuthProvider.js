"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAllowed } from "./accessControl";
import { axiosInstance } from "@/lib/api/fetcher";

const AuthContext = createContext(undefined);

// Public pages that don't require authentication
const PUBLIC_PAGES = ["/auth/login", "/auth/forgot-password", "/auth/reset-password", "/403"];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authState, setAuthState] = useState("loading"); // "loading" | "authenticated" | "unauthenticated"
  const router = useRouter();
  const pathname = usePathname();
  const hasCheckedAuth = useRef(false);

  const isPublicPage = PUBLIC_PAGES.includes(pathname);

  // ---------------------------
  // Fetch user info from /auth/me
  // ---------------------------
  const fetchCurrentUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      
      let data = res.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return null;
        }
      }
      
      if (res.status === 200 && data?.data) {
        return data.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  // ---------------------------
  // Initial auth check on mount
  // ---------------------------
  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check on public pages - just mark as ready
      if (isPublicPage) {
        setAuthState("unauthenticated");
        hasCheckedAuth.current = true;
        return;
      }

      // Only check once per mount
      if (hasCheckedAuth.current) return;
      hasCheckedAuth.current = true;

      try {
        const userData = await fetchCurrentUser();
        if (userData) {
          setUser(userData);
          setAuthState("authenticated");
        } else {
          setUser(null);
          setAuthState("unauthenticated");
          // Redirect to login immediately
          router.replace("/auth/login");
        }
      } catch {
        setUser(null);
        setAuthState("unauthenticated");
        router.replace("/auth/login");
      }
    };

    checkAuth();
  }, [isPublicPage, router]);

  // ---------------------------
  // Handle pathname changes for authenticated users
  // ---------------------------
  useEffect(() => {
    if (authState !== "authenticated" || !user) return;

    // Check RBAC
    const role = user?.role || user?.user_metadata?.role;
    if (!isAllowed(role, pathname)) {
      router.replace("/403");
    }
  }, [pathname, authState, user, router]);

  // ---------------------------
  // Redirect logged-in users away from login page
  // ---------------------------
  useEffect(() => {
    if (authState === "authenticated" && pathname === "/auth/login") {
      router.replace("/");
    }
  }, [authState, pathname, router]);

  // ---------------------------
  // Login
  // ---------------------------
  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post("/auth/signin", {
        email,
        password,
      });
      
      if (res.status !== 200) {
        throw new Error("Invalid email or password");
      }

      // Fetch user profile (cookies are now set)
      const fetchedUser = await fetchCurrentUser();
      
      if (!fetchedUser) {
        throw new Error("Failed to fetch user after login");
      }
      
      setUser(fetchedUser);
      setAuthState("authenticated");
      
      // Get user role
      const userRole = fetchedUser?.role || fetchedUser?.user_metadata?.role;
      
      // Technicians should use the mobile app - redirect to 403
      if (userRole === "technician") {
        router.replace("/403");
      } else {
        router.replace("/");
      }
      
      return true;
    } catch (err) {
      throw err;
    }
  };

  // ---------------------------
  // Logout
  // ---------------------------
  const logout = async () => {
    // Clear UI state persistence keys from localStorage
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("clientsViewMode");
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith("client-") && key.endsWith("-activeTab")) {
          window.localStorage.removeItem(key);
        }
      });
    }
    
    try {
      await axiosInstance.post("/auth/logout", {});
    } catch {}
    
    setUser(null);
    setAuthState("unauthenticated");
    hasCheckedAuth.current = false;
    router.replace("/auth/login");
  };

  // ---------------------------
  // CRITICAL: Block rendering until auth is determined
  // ---------------------------
  
  // On public pages, render immediately
  if (isPublicPage) {
    return (
      <AuthContext.Provider
        value={{
          isAuthenticated: !!user,
          user,
          isBootstrapping: false,
          login,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  // On protected pages, show loading until auth is verified
  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1426]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#07B857]"></div>
      </div>
    );
  }

  // If not authenticated on protected page, show nothing (redirect is in progress)
  if (authState === "unauthenticated" && !isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1426]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#07B857]"></div>
      </div>
    );
  }

  // Authenticated - render children
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        isBootstrapping: false,
        login,
        logout,
      }}
    >
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
