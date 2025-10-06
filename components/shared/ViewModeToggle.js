"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Grid3X3, List } from "lucide-react";

export function ViewModeToggle({ viewMode, onViewModeChange, className = "" }) {
  return (
    <div className={`flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-1 ${className}`}>
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("grid")}
        className={`px-3 py-2 transition-all duration-200 ${
          viewMode === "grid"
            ? "bg-white dark:bg-slate-600 shadow-sm text-gray-900 dark:text-white"
            : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-600/50"
        }`}
      >
        <Grid3X3 className="w-4 h-4 mr-2" />
        Grid
      </Button>
      <Button
        variant={viewMode === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("table")}
        className={`px-3 py-2 transition-all duration-200 ${
          viewMode === "table"
            ? "bg-white dark:bg-slate-600 shadow-sm text-gray-900 dark:text-white"
            : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-600/50"
        }`}
      >
        <List className="w-4 h-4 mr-2" />
        Table
      </Button>
    </div>
  );
}