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
  const [authChecked, setAuthChecked] = useState(false);
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
      // Skip if already checked
      if (hasCheckedAuth.current) return;
      hasCheckedAuth.current = true;

      // On public pages, no need to check auth
      if (isPublicPage) {
        setAuthChecked(true);
        return;
      }

      // Check auth for protected pages
      const userData = await fetchCurrentUser();
      if (userData) {
        setUser(userData);
        setAuthChecked(true);
      } else {
        // Not authenticated - redirect to login
        setAuthChecked(true);
        router.replace("/auth/login");
      }
    };

    checkAuth();
  }, [isPublicPage, router]);

  // ---------------------------
  // Handle RBAC for authenticated users
  // ---------------------------
  useEffect(() => {
    if (!authChecked || !user || isPublicPage) return;

    const role = user?.role || user?.user_metadata?.role;
    if (!isAllowed(role, pathname)) {
      router.replace("/403");
    }
  }, [pathname, authChecked, user, isPublicPage, router]);

  // ---------------------------
  // Redirect logged-in users away from login page
  // ---------------------------
  useEffect(() => {
    if (authChecked && user && pathname === "/auth/login") {
      router.replace("/");
    }
  }, [authChecked, user, pathname, router]);

  // ---------------------------
  // Login
  // ---------------------------
  const login = async (email, password) => {
    const res = await axiosInstance.post("/auth/signin", {
      email,
      password,
    });
    
    if (res.status !== 200) {
      throw new Error("Invalid email or password");
    }

    const fetchedUser = await fetchCurrentUser();
    
    if (!fetchedUser) {
      throw new Error("Failed to fetch user after login");
    }
    
    setUser(fetchedUser);
    
    const userRole = fetchedUser?.role || fetchedUser?.user_metadata?.role;
    
    if (userRole === "technician") {
      router.replace("/403");
    } else {
      router.replace("/");
    }
    
    return true;
  };

  // ---------------------------
  // Logout
  // ---------------------------
  const logout = async () => {
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
    hasCheckedAuth.current = false;
    router.replace("/auth/login");
  };

  // ---------------------------
  // Render logic
  // ---------------------------
  
  // Public pages - always render immediately
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

  // Protected pages - render children immediately
  // If not authenticated, the useEffect will redirect
  // This avoids showing a loader on every refresh
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        isBootstrapping: !authChecked,
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
