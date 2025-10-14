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
  AlertCircle,
  Search,
  ChevronRight,
  FileText,
  Users,
  Briefcase,
  Package,
  UserCircle,
  Settings,
  Download,
  Filter,
  X,
} from "lucide-react";

// Redesigned Audit / Activity Log page
// Features:
// - Two-column layout: timeline/list on left, selected log detail on right
// - Search + filters (action, table, date range)
// - Change-diff view (field: old -> new) with visual highlights
// - Export visible logs to CSV

export default function LogsAuditPage() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // helpers (slightly simplified from your existing logic)
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
    return date.toLocaleString();
  };

  const getTableIcon = (tableName) => {
    const iconClass = "w-4 h-4 text-current";
    switch (tableName) {
      case "drop_cable":
        return <Settings className={iconClass} />;
      case "clients":
        return <Users className={iconClass} />;
      case "projects":
        return <Briefcase className={iconClass} />;
      case "inventory":
        return <Package className={iconClass} />;
      case "users":
      case "staff":
        return <UserCircle className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  const getActionLabel = (action) => {
    switch ((action || "").toUpperCase()) {
      case "CREATE":
      case "INSERT":
        return { text: "Created", style: "bg-green-100 text-green-800" };
      case "UPDATE":
        return { text: "Updated", style: "bg-blue-100 text-blue-800" };
      case "DELETE":
        return { text: "Deleted", style: "bg-red-100 text-red-800" };
      default:
        return { text: action || "Action", style: "bg-gray-100 text-gray-800" };
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

  useEffect(() => {
    if (!selectedLogId && filtered.length) setSelectedLogId(filtered[0].id);
    if (filtered.length === 0) setSelectedLogId(null);
  }, [filtered]);

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
    const csv = [Object.keys(rows[0] || {}).join(","), ...rows.map((r) => Object.values(r).map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(","))].join("\n");
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Activity & Audit</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Who changed what, and when — an immutable trail for accountability.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchLogs}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCsv}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters bar */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <Input
              placeholder="Search by user, table, field or text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded-md border bg-white dark:bg-gray-800"
            >
              <option value="">All actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </select>

            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="px-3 py-2 rounded-md border bg-white dark:bg-gray-800"
            >
              <option value="">All tables</option>
              {Array.from(new Set(logs.map((l) => l.table_name))).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-2 py-2" />
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-2 py-2" />
              <Button variant="ghost" size="sm" onClick={() => { setDateFrom(""); setDateTo(""); setActionFilter(""); setTableFilter(""); setSearchTerm(""); }}>
                <X className="w-4 h-4" /> Clear
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main layout: left list / right detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Timeline / list */}
        <div className="lg:col-span-1">
          <Card className="p-0 overflow-hidden">
            <div className="divide-y">
              {filtered.length === 0 ? (
                <div className="p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No activity found</h3>
                  <p className="text-sm text-gray-500 mt-2">Try adjusting the filters or refresh to see recent events.</p>
                </div>
              ) : (
                filtered.map((log) => {
                  const changes = computeChanges(log);
                  const primary = changes[0]?.key || log.new_data?.status || log.action;
                  return (
                    <button
                      key={log.id}
                      onClick={() => setSelectedLogId(log.id)}
                      className={`w-full text-left p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${selectedLogId === log.id ? "bg-gray-50 dark:bg-gray-900" : ""}`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                          <UserCircle className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="truncate">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{log.user_name || "Unknown"}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{log.table_name} • {primary}</div>
                          </div>
                          <div className="text-right text-xs text-gray-400">
                            <div>{formatTimeAgo(log.created_at)}</div>
                            <div className="mt-1 text-xs text-gray-500">{log.action}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate">{log.summary || log.message || "—"}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT: Detail pane */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            {!selectedLog ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">Select an activity to view details</h3>
                <p className="text-sm text-gray-500 mt-2">Click an item on the left to inspect what changed and who made it.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-gray-700" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{selectedLog.user_name || "Unknown user"}</div>
                      <div className="text-sm text-gray-500 mt-1">{selectedLog.table_name} • {selectedLog.action}</div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(selectedLog.created_at).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { const url = getNavigationUrl(selectedLog); if (url) router.push(url); }}>
                      <ChevronRight className="w-4 h-4 mr-2" /> Go to record
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2))}>
                      Copy JSON
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Summary</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedLog.summary || selectedLog.message || "No summary available."}</p>

                    <div className="pt-3">
                      <h5 className="text-sm font-medium">Metadata</h5>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div><strong>Table:</strong> {selectedLog.table_name}</div>
                        <div><strong>Action:</strong> {selectedLog.action}</div>
                        <div><strong>Record ID:</strong> {selectedLog.record_id || "—"}</div>
                        <div><strong>When:</strong> {new Date(selectedLog.created_at).toLocaleString()}</div>
                        <div><strong>IP / Agent:</strong> {selectedLog.ip || selectedLog.user_agent || "—"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Changes</h4>
                    <div className="mt-2 divide-y rounded-md border">
                      {computeChanges(selectedLog).length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">No field-level changes detected.</div>
                      ) : (
                        computeChanges(selectedLog).map((c) => (
                          <div key={c.key} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                            <div>
                              <div className="text-xs text-gray-500">{c.key.replace(/_/g, " ")}</div>
                              <div className="mt-1 text-sm truncate text-red-700">{String(c.before ?? "(empty)")}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">New</div>
                              <div className="mt-1 text-sm truncate text-green-700">{String(c.after ?? "(empty)")}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h5 className="text-sm font-medium">Notes / Raw</h5>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded border bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200">
                      <div className="text-xs text-gray-500">Old data</div>
                      <pre className="whitespace-pre-wrap text-xs mt-2 max-h-40 overflow-auto">{JSON.stringify(selectedLog.old_data || {}, null, 2)}</pre>
                    </div>
                    <div className="p-3 rounded border bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200">
                      <div className="text-xs text-gray-500">New data</div>
                      <pre className="whitespace-pre-wrap text-xs mt-2 max-h-40 overflow-auto">{JSON.stringify(selectedLog.new_data || {}, null, 2)}</pre>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
