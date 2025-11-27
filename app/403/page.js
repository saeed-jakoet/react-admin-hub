"use client";

import { Shield, ArrowLeft, Home, Smartphone } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ForbiddenPage() {
  const { user, logout } = useAuth();
  const isTechnician = user?.role === "technician" || user?.user_metadata?.role === "technician";

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className={`mx-auto w-20 h-20 ${isTechnician ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'} rounded-full flex items-center justify-center mb-6`}>
            {isTechnician ? (
              <Smartphone className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            ) : (
              <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
            )}
          </div>
          
          {isTechnician ? (
            <>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Use Mobile App
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                As a technician, please use the <strong>Fiber Africa mobile app</strong> to access your assignments, 
                planning documents, and complete your work orders.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={handleLogout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Access Denied
              </h1>
              <div className="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">
                403
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                You do not have the required permissions to access this page. 
                Contact your administrator if you believe this is an error.
              </p>
              
              <div className="space-y-3">
                <Link href="/">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                    <Home className="w-4 h-4" />
                    <span>Go to Dashboard</span>
                  </button>
                </Link>
                
                <button 
                  onClick={() => window.history.back()}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go Back</span>
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isTechnician 
              ? "Download the mobile app from your device's app store"
              : "Need help? Contact your system administrator"
            }
          </p>
        </div>
      </div>
    </div>
  );
}
