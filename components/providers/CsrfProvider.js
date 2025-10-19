"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setCsrfExpirationHandler } from "@/lib/api/fetcher";
import CsrfExpiredBanner from "@/components/shared/CsrfExpiredBanner";

const CsrfContext = createContext({});

export function useCsrf() {
  return useContext(CsrfContext);
}

export function CsrfProvider({ children }) {
  const [showBanner, setShowBanner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Set up the global CSRF expiration handler
    setCsrfExpirationHandler(() => {
      setShowBanner(true);
    });
  }, []);

  const handleContinue = async () => {
    try {
      // Import get dynamically to avoid circular dependency issues
      const { get } = await import("@/lib/api/fetcher");
      
      // Call the CSRF refresh endpoint to get a new token
      await get("/csrf/refresh");
      
      // Just close the banner - no page reload needed!
      // The new CSRF token is now in the cookie and will be used for future requests
      setShowBanner(false);
    } catch (error) {
      console.error("Failed to refresh CSRF token:", error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    setShowBanner(false);
    // Clear any local storage/session data
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to login
    router.push("/auth/login");
  };

  return (
    <CsrfContext.Provider value={{}}>
      {children}
      {showBanner && (
        <CsrfExpiredBanner onContinue={handleContinue} onLogout={handleLogout} />
      )}
    </CsrfContext.Provider>
  );
}
