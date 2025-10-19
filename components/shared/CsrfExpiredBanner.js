"use client";

import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, LogOut, RefreshCw, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CsrfExpiredBanner({ onContinue, onLogout }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleContinue = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContinue();
  };

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onLogout();
  };

  if (!mounted) return null;

  const banner = (
    <div 
      className="fixed top-0 left-0 right-0 z-[999999] animate-in slide-in-from-top-4 duration-500"
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Banner Bar */}
      <div className="bg-gradient-to-r from-[#264C92] via-[#1e3d75] to-[#264C92] border-b-4 border-[#F5B800] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left: Icon + Message */}
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#F5B800] rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-3 h-3 text-[#0B1426]" />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg md:text-xl font-bold text-white mb-0.5">
                  Security Session Expired
                </h3>
                <p className="text-sm text-white/85">
                  Your session has timed out. Please refresh to continue working.
                </p>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                type="button"
                onClick={handleLogout}
                variant="outline"
                className="h-10 px-4 gap-2 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white text-sm font-semibold transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                className="h-10 px-5 gap-2 bg-[#F5B800] hover:bg-[#d9a300] text-[#0B1426] text-sm font-bold shadow-lg transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(banner, document.body);
}