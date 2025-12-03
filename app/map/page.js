"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loader } from "@/components/shared/Loader";

const MapComponent = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <div className="w-full h-full"><Loader variant="bars" text="Loading map..." /></div>,
});

export default function MapPage() {
  return (
    <div className="flex flex-col h-screen w-full">
      <div
        className="flex-1 flex rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mx-6 my-4"
        style={{ minHeight: 0, zIndex: 0 }}
      >
        <Suspense fallback={<div className="w-full h-full"><Loader variant="bars" text="Loading map..." /></div>}>
          <MapComponent />
        </Suspense>
      </div>
    </div>
  );
}
