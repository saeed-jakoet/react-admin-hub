"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { ExportDropdown } from "@/components/shared/ExportDropdown";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function DataTable({
  columns,
  data,
  onRowClick,
  // Search Props
  searchEnabled = false,
  searchTerm = "",
  onSearch = () => {},
  searchPlaceholder = "Search...",
  // Export Props
  exportEnabled = false,
  exportData = [],
  exportColumns = [],
  exportFilename = "export",
  exportTitle = "Export",
  // View Mode Props
  viewModeEnabled = false,
  viewMode = "table",
  setViewMode = () => {},
  // Status Filter Props
  statusFilterEnabled = false,
  statuses = [],
  statusFilter = "all",
  onStatusFilterChange = () => {},
  formatStatus = (s) => s,
  // Week Filter Props
  weekFilterEnabled = false,
  weeks = [],
  weekFilter = "all",
  onWeekFilterChange = () => {},
  // Pagination Props
  pageIndex = 0,
  pageSize = 10,
  onPaginationChange = null,
}) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [internalPagination, setInternalPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Use external pagination if provided, otherwise use internal
  const paginationState = onPaginationChange
    ? { pageIndex, pageSize }
    : internalPagination;
  const setPaginationState = onPaginationChange || setInternalPagination;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPaginationState,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: paginationState,
    },
  });

  const hasControls =
    searchEnabled || exportEnabled || viewModeEnabled || statusFilterEnabled || weekFilterEnabled;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
      {/* Integrated Table Controls */}
      {hasControls && (
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
              {/* Left Side - Search */}
              {searchEnabled && (
                <div className="flex-1">
                  <div className="relative max-w-md">
                    <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <Input
                      placeholder={searchPlaceholder}
                      value={searchTerm}
                      onChange={onSearch}
                      className="pl-11 h-12 bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Right Side - Actions Group */}
              {(weekFilterEnabled || statusFilterEnabled || exportEnabled || viewModeEnabled) && (
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  {/* Week Filter */}
                  {weekFilterEnabled && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="default"
                          className="h-12 px-5 gap-2.5 bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800  text-slate-700 dark:text white hover:text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-all shadow-sm whitespace-nowrap"
                        >
                          <Filter className="w-4.5 h-4.5" />
                          <span className="hidden sm:inline">
                            {weekFilter === "all"
                              ? "Filter Week"
                              : `Week ${weekFilter}`}
                          </span>
                          <span className="sm:hidden">Week</span>
                          {weekFilter !== "all" && (
                            <Badge
                              variant="secondary"
                              className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold shadow-sm"
                            >
                              1
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xl rounded-xl p-2"
                      >
                        <DropdownMenuItem
                          onClick={() => onWeekFilterChange("all")}
                          className={`cursor-pointer rounded-lg px-4 py-2.5 ${
                            weekFilter === "all"
                              ? "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/20 text-purple-700 dark:text-purple-400 font-semibold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          All Weeks
                        </DropdownMenuItem>
                        <div className="my-2 h-px bg-slate-200 dark:bg-slate-700" />
                        {weeks.map((week) => (
                          <DropdownMenuItem
                            key={week}
                            onClick={() => onWeekFilterChange(week)}
                            className={`cursor-pointer rounded-lg px-4 py-2.5 ${
                              weekFilter === week
                                ? "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/20 text-purple-700 dark:text-purple-400 font-semibold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                            }`}
                          >
                            Week {week}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Status Filter */}
                  {statusFilterEnabled && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="default"
                          className="h-12 px-5 gap-2.5 bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800  text-slate-700 dark:text white hover:text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-all shadow-sm whitespace-nowrap"
                        >
                          <Filter className="w-4.5 h-4.5" />
                          <span className="hidden sm:inline">
                            {statusFilter === "all"
                              ? "Filter Status"
                              : formatStatus(statusFilter)}
                          </span>
                          <span className="sm:hidden">Filter</span>
                          {statusFilter !== "all" && (
                            <Badge
                              variant="secondary"
                              className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold shadow-sm"
                            >
                              1
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xl rounded-xl p-2"
                      >
                        <DropdownMenuItem
                          onClick={() => onStatusFilterChange("all")}
                          className={`cursor-pointer rounded-lg px-4 py-2.5 ${
                            statusFilter === "all"
                              ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          All Statuses
                        </DropdownMenuItem>
                        <div className="my-2 h-px bg-slate-200 dark:bg-slate-700" />
                        {statuses.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => onStatusFilterChange(status)}
                            className={`cursor-pointer rounded-lg px-4 py-2.5 ${
                              statusFilter === status
                                ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                            }`}
                          >
                            {formatStatus(status)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Export Button */}
                  {exportEnabled && (
                    <ExportDropdown
                      data={exportData}
                      filename={exportFilename}
                      columns={exportColumns}
                      title={exportTitle}
                      className="h-12 px-5 rounded-xl shadow-sm"
                    />
                  )}

                  {/* View Toggle */}
                  {viewModeEnabled && (
                    <ViewModeToggle
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(statusFilterEnabled || weekFilterEnabled) && (statusFilter !== "all" || weekFilter !== "all") && (
            <div className="px-6 pb-5">
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Active Filters:
                </span>
                {weekFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 px-4 py-2 rounded-lg font-semibold hover:from-purple-200 hover:to-purple-100 dark:hover:from-purple-900/40 dark:hover:to-purple-900/30 transition-all cursor-pointer shadow-sm"
                    onClick={() => onWeekFilterChange("all")}
                  >
                    Week {weekFilter}
                    <span className="ml-2.5 text-purple-600 dark:text-purple-400 font-bold hover:text-purple-800 dark:hover:text-purple-200 text-base">
                      ×
                    </span>
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 px-4 py-2 rounded-lg font-semibold hover:from-blue-200 hover:to-blue-100 dark:hover:from-blue-900/40 dark:hover:to-blue-900/30 transition-all cursor-pointer shadow-sm"
                    onClick={() => onStatusFilterChange("all")}
                  >
                    {formatStatus(statusFilter)}
                    <span className="ml-2.5 text-blue-600 dark:text-blue-400 font-bold hover:text-blue-800 dark:hover:text-blue-200 text-base">
                      ×
                    </span>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-14 text-slate-700 dark:text-slate-300 font-bold text-sm"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent dark:hover:from-slate-800/30 dark:hover:to-transparent transition-all ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${index % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-50/30 dark:bg-slate-900/20"}`}
                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                    <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Search className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                    </div>
                    <p className="text-base font-semibold mb-1">
                      No results found
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Showing{" "}
          <span className="font-bold text-slate-900 dark:text-white">
            {table.getFilteredRowModel().rows.length}
          </span>{" "}
          {table.getFilteredRowModel().rows.length === 1 ? "result" : "results"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-10 px-4 rounded-lg hover:text-slate-700 dark:hover:text-white border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-3">
            Page{" "}
            <span className="text-blue-600 dark:text-blue-400">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            of{" "}
            <span className="text-slate-900 dark:text-white">
              {table.getPageCount()}
            </span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-10 px-4 rounded-lg hover:text-slate-700 dark:hover:text-white border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all shadow-sm"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
