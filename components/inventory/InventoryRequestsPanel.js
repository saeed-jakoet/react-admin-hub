"use client";

import { useState, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { format, formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Clock,
  Package,
  User,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getInventoryRequests,
  getPendingRequestsCount,
  approveInventoryRequest,
  rejectInventoryRequest,
} from "@/lib/api/inventoryRequests";
import { useToast } from "@/components/shared/Toast";

/**
 * InventoryRequestsPanel
 * Displays pending inventory requests for super_admin approval
 */
export function InventoryRequestsPanel({ className = "" }) {
  const [expandedId, setExpandedId] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(null);
  const toast = useToast();

  // Fetch requests
  const {
    data: requestsData,
    isLoading,
    error,
  } = useSWR(
    ["/inventory-requests", statusFilter],
    () => getInventoryRequests(statusFilter),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  // Fetch pending count for badge
  const { data: countData } = useSWR(
    "/inventory-requests/pending/count",
    getPendingRequestsCount,
    {
      refreshInterval: 30000,
    }
  );

  const requests = useMemo(() => requestsData?.data || [], [requestsData]);
  const pendingCount = countData?.data?.count || 0;

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await approveInventoryRequest(id);
      toast.success("Approved", "Inventory request has been approved and stock updated.");
      mutate(["/inventory-requests", statusFilter]);
      mutate("/inventory-requests/pending/count");
      mutate(["/inventory"]); // Refresh inventory list
    } catch (err) {
      toast.error("Error", err.message || "Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await rejectInventoryRequest(id, rejectReason);
      toast.success("Rejected", "Inventory request has been rejected.");
      setShowRejectModal(null);
      setRejectReason("");
      mutate(["/inventory-requests", statusFilter]);
      mutate("/inventory-requests/pending/count");
    } catch (err) {
      toast.error("Error", err.message || "Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatJobType = (jobType) => {
    return jobType
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-center text-red-500 gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load inventory requests</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Inventory Requests
            </h2>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2">
          {["pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === status
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No {statusFilter} requests</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="p-4">
              {/* Request Header */}
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(request.status)}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}
                    </span>
                  </div>
                  {/* Circuit Number and Site Name */}
                  <div className="flex items-center gap-2 mb-1">
                    {request.circuit_number && (
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {request.circuit_number}
                      </span>
                    )}
                    {request.site_name && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {request.site_name}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4" />
                      <span>
                        {request.technician?.first_name} {request.technician?.surname}
                      </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatJobType(request.job_type)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {request.items?.length || 0} item(s) requested
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {request.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(request.id);
                        }}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRejectModal(request.id);
                        }}
                        disabled={processingId === request.id}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {expandedId === request.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === request.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Requested Items
                  </h4>
                  <div className="space-y-2">
                    {request.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-md px-3 py-2"
                      >
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.item_name || "Unknown Item"}
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

                  {/* Additional Info */}
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Requested:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {format(new Date(request.requested_at), "MMM d, yyyy HH:mm")}
                      </span>
                    </div>
                    {request.reviewed_at && (
                      <>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Reviewed:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {format(new Date(request.reviewed_at), "MMM d, yyyy HH:mm")}
                          </span>
                        </div>
                      </>
                    )}
                    {request.rejection_reason && (
                      <div className="col-span-2">
                        <span className="text-gray-500 dark:text-gray-400">Rejection Reason:</span>
                        <span className="ml-2 text-red-600 dark:text-red-400">
                          {request.rejection_reason}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reject Request
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to reject this inventory request? You can provide an optional reason.
            </p>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Rejection reason (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(showRejectModal)}
                disabled={processingId === showRejectModal}
              >
                {processingId === showRejectModal ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
