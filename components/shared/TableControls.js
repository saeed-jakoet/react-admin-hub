import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ExportDropdown } from "@/components/shared/ExportDropdown";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";

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
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Side - Search & Export */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={onSearch}
              className="pl-10 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400"
            />
          </div>
          <ExportDropdown
            data={exportData}
            filename={exportFilename}
            columns={exportColumns}
            title={exportTitle}
            className="w-full sm:w-auto"
          />
        </div>
        
        {/* Right Side - View Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300 hidden sm:block">
            View:
          </span>
          <ViewModeToggle 
            viewMode={viewMode} 
            onViewModeChange={setViewMode}
          />
        </div>
      </div>
    </div>
  );
}
