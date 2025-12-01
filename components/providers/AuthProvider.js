"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAllowed } from "./accessControl";
import { axiosInstance } from "@/lib/api/fetcher";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  // ---------------------------
  // Fetch user info from /auth/me/:id
  // ---------------------------
  const fetchCurrentUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      
      // Handle case where response might be a string (needs parsing)
      let data = res.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {
          setUser(null);
          return null;
        }
      }
      
      if (res.status === 200 && data?.data) {
        setUser(data.data);
        return data.data;
      } else {
        setUser(null);
        return null;
      }
    } catch (err) {
      setUser(null);
      return null;
    }
  };

  // ---------------------------
  // Login
  // ---------------------------
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/auth/signin", {
        email,
        password,
      });
      if (res.status !== 200) {
        throw new Error("Invalid email or password");
      }

      // Fetch user profile (cookies are now set)
      await fetchCurrentUser();
      
      // Wait a bit to ensure user state is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      setIsLoading(false);
      
      // Get user role from state (already fetched by fetchCurrentUser)
      const userData = await axiosInstance.get("/auth/me");
      const userRole = userData?.data?.data?.role || userData?.data?.data?.user_metadata?.role;
      
      // Technicians should use the mobile app - redirect to 403
      if (userRole === "technician") {
        router.push("/403");
      } else {
        router.push("/");
      }
      
      return true;
    } catch (err) {
      setIsLoading(false);
      if (process.env.NODE_ENV === "development") {
        console.error("Login error:", err);
      }
      throw err;
    }
  };

  // ---------------------------
  // Logout
  // ---------------------------
  const logout = async () => {
    // Clear UI state persistence keys from localStorage
    if (typeof window !== "undefined") {
      // Remove clients view mode
      window.localStorage.removeItem("clientsViewMode");
      // Remove all client-[id]-activeTab keys
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
    setIsLoading(false);
    router.push("/auth/login");
  };

  // ---------------------------
  // On mount, check for existing session
  // ---------------------------
  useEffect(() => {
    const publicPages = ["/auth/login", "/auth/forgot-password", "/auth/reset-password"]; 

    if (publicPages.includes(pathname)) {
      setIsBootstrapping(false);
      return;
    }

    const checkSession = async () => {
      try {
        await fetchCurrentUser();
      } catch {
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    checkSession();
  }, [pathname]);

  // ---------------------------
  // Route protection
  // ---------------------------
  useEffect(() => {
    if (isBootstrapping || isLoading) return;

    const publicPages = ["/auth/login", "/auth/forgot-password", "/auth/reset-password", "/403"]; 
    const onPublic = publicPages.includes(pathname);

    if (!user) {
      if (!onPublic) {
        router.push("/auth/login");
      }
      return;
    }

    // If user is logged in and on public login page, redirect home
    if (onPublic && pathname === "/auth/login") {
      router.push("/");
      return;
    }

    // Enforce RBAC on non-public pages
    const role = user?.role || user?.user_metadata?.role;
    if (!isAllowed(role, pathname)) {
      router.push("/403");
    }
  }, [user, isBootstrapping, isLoading, pathname, router]);

  // ---------------------------
  // No loader on page refresh - better UX
  // Content renders immediately, auth happens in background
  // ---------------------------

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        isBootstrapping,
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
