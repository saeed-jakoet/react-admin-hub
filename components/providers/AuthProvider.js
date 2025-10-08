"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { isAllowed } from "./accessControl";

const BASE_URL = process.env.NEXT_PUBLIC_BASEURL;

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    failedQueue = [];
  };

  // ---------------------------
  // Refresh token function
  // ---------------------------
  const refreshToken = async () => {
    const res = await fetch(`${BASE_URL}/refresh/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Refresh failed");
    return res.json();
  };

  // ---------------------------
  // Fetch user info from /auth/me/:id
  // ---------------------------
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/me`, {
        withCredentials: true, // send cookies
      });
      if (res.status === 200 && res.data?.data) {
        setUser(res.data.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  // ---------------------------
  // Login
  // ---------------------------
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/auth/signin`,
        { email, password },
        { withCredentials: true }
      );
      if (res.status !== 200) {
        throw new Error("Invalid email or password");
      }

      await fetchCurrentUser(); // cookies are set; fetch profile

      setIsLoading(false);
      router.push("/"); // redirect after login
      return true;
    } catch (err) {
      setIsLoading(false);
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
      await axios.post(
        `${BASE_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch {}
    setUser(null);
    setIsLoading(false);
    router.push("/auth/login");
  };

  // ---------------------------
  // Setup axios interceptor for 401 handling
  // ---------------------------
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes("/refresh/")
        ) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return axios(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            await refreshToken();
            processQueue(null);
            return axios(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError);
            setUser(null);
            router.push("/auth/login");
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [router]);

  // ---------------------------
  // On mount, check for existing session
  // ---------------------------
  useEffect(() => {
    const publicPages = ["/auth/login", "/auth/forgot-password"];

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

    const publicPages = ["/auth/login", "/auth/forgot-password", "/403"];
    const onPublic = publicPages.includes(pathname);

    if (!user) {
      if (!onPublic) router.push("/auth/login");
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
