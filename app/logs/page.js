"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/shared/Loader";
import { get } from "@/lib/api/fetcher";
import {
  Clock,
  RefreshCw,
  Search,
  ChevronRight,
  FileText,
  UserCircle,
  Download,
  X,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Activity,
  Database,
  Edit3,
  Trash2,
  PlusCircle,
  ArrowRight,
} from "lucide-react";

const ITEMS_PER_PAGE = 15;

export default function LogsAuditPage() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedLogId, setSelectedLogId] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await get("/log");
      if (res?.status === "success") setLogs(res.data || []);
      else setError(res?.message || "Failed to load logs");
    } catch (e) {
      setError(e?.message || String(e) || "Error fetching logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getActionIcon = (action) => {
    const iconClass = "w-4 h-4";
    switch ((action || "").toUpperCase()) {
      case "CREATE":
      case "INSERT":
        return <PlusCircle className={iconClass} />;
      case "UPDATE":
        return <Edit3 className={iconClass} />;
      case "DELETE":
        return <Trash2 className={iconClass} />;
      default:
        return <Activity className={iconClass} />;
    }
  };

  const getActionStyle = (action) => {
    switch ((action || "").toUpperCase()) {
      case "CREATE":
      case "INSERT":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900";
      case "UPDATE":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900";
      case "DELETE":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800";
    }
  };

  const computeChanges = (log) => {
    const oldData = log.old_data || {};
    const newData = log.new_data || {};
    const keys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)])).filter(
      (k) => !["created_at", "updated_at", "deleted_at"].includes(k),
    );
    const changes = keys
      .map((k) => ({
        key: k,
        before: typeof oldData[k] === "object" ? JSON.stringify(oldData[k]) : oldData[k],
        after: typeof newData[k] === "object" ? JSON.stringify(newData[k]) : newData[k],
      }))
      .filter((c) => String(c.before) !== String(c.after));
    return changes;
  };

  const filtered = useMemo(() => {
    const s = (searchTerm || "").trim().toLowerCase();
    return logs
      .filter((l) => {
        if (actionFilter && l.action !== actionFilter) return false;
        if (tableFilter && l.table_name !== tableFilter) return false;
        if (dateFrom && new Date(l.created_at) < new Date(dateFrom)) return false;
        if (dateTo && new Date(l.created_at) > new Date(dateTo)) return false;
        if (!s) return true;
        return (
          (l.user_name || "").toLowerCase().includes(s) ||
          (l.table_name || "").toLowerCase().includes(s) ||
          (l.action || "").toLowerCase().includes(s) ||
          (l.new_data && JSON.stringify(l.new_data).toLowerCase().includes(s)) ||
          (l.old_data && JSON.stringify(l.old_data).toLowerCase().includes(s))
        );
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [logs, searchTerm, actionFilter, tableFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedLogs = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, actionFilter, tableFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (!selectedLogId && paginatedLogs.length) setSelectedLogId(paginatedLogs[0].id);
    if (paginatedLogs.length === 0) setSelectedLogId(null);
  }, [paginatedLogs, selectedLogId]);

  const selectedLog = useMemo(() => logs.find((l) => l.id === selectedLogId) || null, [logs, selectedLogId]);

  const downloadCsv = useCallback(() => {
    const rows = filtered.map((l) => ({
      id: l.id,
      action: l.action,
      table: l.table_name,
      user: l.user_name,
      time: l.created_at,
      summary: l.summary || "",
      changed_fields: computeChanges(l).map((c) => c.key).join("; "),
    }));
    const csv = [
      Object.keys(rows[0] || {}).join(","),
      ...rows.map((r) =>
        Object.values(r)
          .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-export-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const getNavigationUrl = (log) => {
    const { table_name, record_id, old_data, new_data } = log;
    if (table_name === "clients") return `/clients/${record_id}`;
    if (table_name === "drop_cable") {
      const clientId = new_data?.client_id || old_data?.client_id;
      if (clientId) return `/clients/${clientId}/drop_cable`;
    }
    if (table_name === "inventory") return `/inventory/${record_id}`;
    if (table_name === "staff") return `/staff/${record_id}`;
    return null;
  };

  if (loading) return <Loader variant="bars" text="Loading activity..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="p-4 sm:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Activity Log</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 ml-[52px]">
            Complete audit trail of system changes and user actions
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <Input
                  placeholder="Search users, tables, or changes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-slate-200 dark:border-slate-800 focus:border-slate-400 dark:focus:border-slate-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                >
                  <option value="">All actions</option>
                  <option value="CREATE">Created</option>
                  <option value="UPDATE">Updated</option>
                  <option value="DELETE">Deleted</option>
                </select>

                <select
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                >
                  <option value="">All tables</option>
                  {Array.from(new Set(logs.map((l) => l.table_name))).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-10 w-40 border-slate-200 dark:border-slate-800"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-10 w-40 border-slate-200 dark:border-slate-800"
                />

                {(searchTerm || actionFilter || tableFilter || dateFrom || dateTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                      setActionFilter("");
                      setTableFilter("");
                      setSearchTerm("");
                    }}
                    className="h-10"
                  >
                    <X className="w-4 h-4 mr-2" /> Clear
                  </Button>
                )}

                <Button variant="outline" size="sm" onClick={fetchLogs} className="h-10">
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>

                <Button variant="outline" size="sm" onClick={downloadCsv} className="h-10" disabled={filtered.length === 0}>
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <div>
                Showing <span className="font-medium text-slate-900 dark:text-slate-100">{paginatedLogs.length}</span> of{" "}
                <span className="font-medium text-slate-900 dark:text-slate-100">{filtered.length}</span> activities
              </div>
            </div>
          </div>
        </Card>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Activity list */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedLogs.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No activities found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      Try adjusting your filters or search term
                    </p>
                  </div>
                ) : (
                  paginatedLogs.map((log) => {
                    const changes = computeChanges(log);
                    const isSelected = selectedLogId === log.id;
                    return (
                      <button
                        key={log.id}
                        onClick={() => setSelectedLogId(log.id)}
                        className={`w-full text-left p-4 flex items-start gap-4 transition-all ${
                          isSelected
                            ? "bg-slate-50 dark:bg-slate-900/50 border-l-2 border-slate-900 dark:border-slate-100"
                            : "hover:bg-slate-50/50 dark:hover:bg-slate-900/30 border-l-2 border-transparent"
                        }`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getActionStyle(log.action)} border`}>
                            {getActionIcon(log.action)}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                {log.user_name || "Unknown User"}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                                <Database className="w-3 h-3" />
                                <span className="truncate">{log.table_name}</span>
                              </div>
                            </div>
                            <div className="text-xs text-slate-400 whitespace-nowrap">{formatTimeAgo(log.created_at)}</div>
                          </div>

                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${getActionStyle(log.action)} border`}
                          >
                            {getActionIcon(log.action)}
                            <span>{log.action}</span>
                          </div>

                          {changes.length > 0 && (
                            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                              {changes.length} field{changes.length !== 1 ? "s" : ""} changed
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/20">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT: Detail pane */}
          <div className="lg:col-span-3">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              {!selectedLog ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Select an activity</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Choose an item from the list to view detailed change information
                  </p>
                </div>
              ) : (
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center ${getActionStyle(selectedLog.action)} border-2`}
                      >
                        {getActionIcon(selectedLog.action)}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                          {selectedLog.user_name || "Unknown User"}
                        </h2>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Database className="w-4 h-4" />
                            {selectedLog.table_name}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {new Date(selectedLog.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getNavigationUrl(selectedLog) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(getNavigationUrl(selectedLog))}
                          className="h-9"
                        >
                          <ChevronRight className="w-4 h-4 mr-2" /> View Record
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-6 space-y-6">
                    {/* Summary */}
                    {selectedLog.summary && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Summary</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{selectedLog.summary}</p>
                      </div>
                    )}

                    {/* Changes */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Field Changes ({computeChanges(selectedLog).length})
                      </h3>

                      {computeChanges(selectedLog).length === 0 ? (
                        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 text-center">
                          <p className="text-sm text-slate-500 dark:text-slate-400">No field-level changes detected</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {computeChanges(selectedLog).map((change) => (
                            <div
                              key={change.key}
                              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20"
                            >
                              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                                {change.key.replace(/_/g, " ")}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    Previous
                                  </div>
                                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900">
                                    <p className="text-sm text-rose-900 dark:text-rose-300 break-all">
                                      {String(change.before ?? "(empty)")}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <ArrowRight className="w-3 h-3" />
                                    Current
                                  </div>
                                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                                    <p className="text-sm text-emerald-900 dark:text-emerald-300 break-all">
                                      {String(change.after ?? "(empty)")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Metadata</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Record ID</div>
                          <div className="text-sm font-mono text-slate-900 dark:text-slate-100">
                            {selectedLog.record_id || "—"}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">IP Address</div>
                          <div className="text-sm font-mono text-slate-900 dark:text-slate-100">{selectedLog.ip || "—"}</div>
                        </div>
                      </div>
                    </div>

                    {/* Raw Data */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Raw Data</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Before</span>
                          </div>
                          <pre className="p-4 text-xs text-slate-700 dark:text-slate-300 overflow-auto max-h-64 bg-slate-50 dark:bg-slate-900/20">
                            {JSON.stringify(selectedLog.old_data || {}, null, 2)}
                          </pre>
                        </div>
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">After</span>
                          </div>
                          <pre className="p-4 text-xs text-slate-700 dark:text-slate-300 overflow-auto max-h-64 bg-slate-50 dark:bg-slate-900/20">
                            {JSON.stringify(selectedLog.new_data || {}, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}