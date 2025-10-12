"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Grid3X3, List } from "lucide-react";

export function ViewModeToggle({ viewMode, onViewModeChange, className = "" }) {
  return (
    <div
      className={`inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg ${className}`}
    >
      <button
        onClick={() => onViewModeChange("grid")}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${
            viewMode === "grid"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }
        `}
      >
        <Grid3X3 className="w-4 h-4" />
        <span className="hidden sm:inline">Grid</span>
      </button>
      <button
        onClick={() => onViewModeChange("table")}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${
            viewMode === "table"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }
        `}
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">Table</span>
      </button>
    </div>
  );
}

// Usage example - you can remove the wrapper div entirely now
// Just use: <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
