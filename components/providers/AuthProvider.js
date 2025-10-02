"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
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
      console.log(res);
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
