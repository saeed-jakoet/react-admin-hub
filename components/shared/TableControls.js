import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { List, Grid3X3, Search } from "lucide-react";
import { ExportDropdown } from "@/components/shared/ExportDropdown";

/**
 * Reusable controls for inventory/clients pages: search, export, view toggle.
 * Props:
 * - searchTerm: string
 * - onSearch: (e) => void
 * - exportData: array
 * - exportColumns: array
 * - exportFilename: string
 * - exportTitle: string
 * - viewMode: string ("table" | "grid")
 * - setViewMode: (mode) => void
 */
export function TableControls({
  searchTerm,
  onSearch,
  exportData,
  exportColumns,
  exportFilename,
  exportTitle,
  viewMode,
  setViewMode,
  searchPlaceholder = "Search..."
}) {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4">
        {/* Left Side - Search & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[300px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={onSearch}
              className="pl-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <ExportDropdown
            data={exportData}
            filename={exportFilename}
            columns={exportColumns}
            title={exportTitle}
          />
        </div>
        {/* Right Side - View Options */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            View as:
          </span>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-xs ${
                viewMode === "table"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              } border-0 h-8`}
            >
              <List className="w-3 h-3 mr-1.5" />
              Table
            </Button>
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              } border-0 h-8`}
            >
              <Grid3X3 className="w-3 h-3 mr-1.5" />
              Grid
            </Button>
          </div>
        </div>
    </div>
  );
}
