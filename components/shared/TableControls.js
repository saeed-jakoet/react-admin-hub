import React from "react";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { ExportDropdown } from "@/components/shared/ExportDropdown";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  searchPlaceholder = "Search...",
  showViewModeSwitch = true,
  showStatusFilter = false,
  statuses = [],
  statusFilter = "all",
  onStatusFilterChange = () => {},
  formatStatus = (s) => s,
}) {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
      <div className="p-5">
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4">
          {/* Left Side - Search */}
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={onSearch}
                className="pl-10 h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right Side - Actions Group */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Status Filter */}
            {showStatusFilter && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    className="h-11 px-4 gap-2 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-all whitespace-nowrap"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {statusFilter === "all"
                        ? "Filter"
                        : formatStatus(statusFilter)}
                    </span>
                    {statusFilter !== "all" && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-500 text-white text-xs font-semibold"
                      >
                        1
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg rounded-lg"
                >
                  <DropdownMenuItem
                    onClick={() => onStatusFilterChange("all")}
                    className={`cursor-pointer ${
                      statusFilter === "all"
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    All Statuses
                  </DropdownMenuItem>
                  <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
                  {statuses.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => onStatusFilterChange(status)}
                      className={`cursor-pointer ${
                        statusFilter === status
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {formatStatus(status)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Divider */}
            {showStatusFilter && (showViewModeSwitch || exportData) && (
              <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-700" />
            )}

            {/* Export Button */}
            <ExportDropdown
              data={exportData}
              filename={exportFilename}
              columns={exportColumns}
              title={exportTitle}
              className="h-11"
            />

            {/* View Toggle */}
            {showViewModeSwitch && (
              <>
                {/* Divider */}
                <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

                <div className="flex items-center gap-2 px-3 h-11 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden sm:inline">
                    View
                  </span>
                  <ViewModeToggle
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {showStatusFilter && statusFilter !== "all" && (
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Filter:
            </span>
            <Badge
              variant="secondary"
              className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
              onClick={() => onStatusFilterChange("all")}
            >
              {formatStatus(statusFilter)}
              <span className="ml-2 text-blue-500 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-200">
                ×
              </span>
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
