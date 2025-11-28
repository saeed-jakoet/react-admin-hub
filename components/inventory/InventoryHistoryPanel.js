"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Package,
  User,
  Calendar,
  MapPin,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * InventoryHistoryPanel
 * Displays history of inventory allocations across all jobs
 * Currently uses placeholder data - can be connected to real API later
 */
export function InventoryHistoryPanel({ className = "" }) {
  const [expandedId, setExpandedId] = useState(null);

  // Placeholder data - replace with real API call when ready
  const historyData = [
    {
      id: "1",
      job_type: "drop_cable",
      circuit_number: "CKT-2024-001",
      site_name: "Sandton Office Park",
      technician: { first_name: "John", surname: "Doe" },
      allocated_at: new Date().toISOString(),
      items: [
        { item_name: "Fiber Cable 12 Core", quantity: 50, unit: "meters" },
        { item_name: "SC/APC Connectors", quantity: 4, unit: "pcs" },
        { item_name: "Splice Tray", quantity: 1, unit: "pcs" },
      ],
    },
    {
      id: "2",
      job_type: "link_build",
      circuit_number: "CKT-2024-002",
      site_name: "Rosebank Mall",
      technician: { first_name: "Jane", surname: "Smith" },
      allocated_at: new Date(Date.now() - 86400000).toISOString(),
      items: [
        { item_name: "Fiber Cable 24 Core", quantity: 100, unit: "meters" },
        { item_name: "ODF Panel", quantity: 1, unit: "pcs" },
        { item_name: "Patch Cords", quantity: 12, unit: "pcs" },
      ],
    },
    {
      id: "3",
      job_type: "drop_cable",
      circuit_number: "CKT-2024-003",
      site_name: "Midrand Business Park",
      technician: { first_name: "Mike", surname: "Johnson" },
      allocated_at: new Date(Date.now() - 172800000).toISOString(),
      items: [
        { item_name: "Fiber Cable 6 Core", quantity: 25, unit: "meters" },
        { item_name: "SC/UPC Connectors", quantity: 2, unit: "pcs" },
      ],
    },
  ];

  const formatJobType = (jobType) => {
    return jobType
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getJobTypeBadge = (jobType) => {
    const isLinkBuild = jobType === "link_build";
    return (
      <Badge
        className={
          isLinkBuild
            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
            : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
        }
      >
        {formatJobType(jobType)}
      </Badge>
    );
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Inventory Allocation History
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track materials used across all jobs
        </p>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
        {historyData.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No allocation history found</p>
          </div>
        ) : (
          historyData.map((record) => (
            <div key={record.id} className="p-4">
              {/* Record Header */}
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() =>
                  setExpandedId(expandedId === record.id ? null : record.id)
                }
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getJobTypeBadge(record.job_type)}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {record.circuit_number}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{record.site_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm mt-1">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                      <User className="w-4 h-4" />
                      <span>
                        {record.technician?.first_name}{" "}
                        {record.technician?.surname}
                      </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(
                          new Date(record.allocated_at),
                          "MMM d, yyyy HH:mm"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {record.items?.length || 0} item(s) allocated
                  </div>
                </div>
                <div className="flex items-center">
                  {expandedId === record.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === record.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Items Allocated
                  </h4>
                  <div className="space-y-2">
                    {record.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-md px-3 py-2"
                      >
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.item_name}
                          </span>
                          {item.unit && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({item.unit})
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          × {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
