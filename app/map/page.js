"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loader } from "@/components/shared/Loader";
import { MapPin, Satellite, Globe } from "lucide-react";

const MapComponent = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-4">
            <Globe className="w-10 h-10 text-white animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
            <MapPin className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-4">Loading interactive map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="fixed inset-0 left-20 top-16 bg-slate-100 dark:bg-slate-900">
      <div
        className="w-full h-full overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <Suspense 
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl mb-3">
                  <Globe className="w-8 h-8 text-white animate-pulse" />
                </div>
                <p className="text-sm text-slate-500">Initializing map...</p>
              </div>
            </div>
          }
        >
          <MapComponent />
        </Suspense>
      </div>
    </div>
  );
}
