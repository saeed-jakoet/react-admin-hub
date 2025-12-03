"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Activity,
  MoreVertical,
  Cable,
  MapPin,
  User,
  Hash,
  BarChart,
  Trash2,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/shared/DataTable";
import { get, post, del } from "@/lib/api/fetcher";
import { Loader } from "@/components/shared/Loader";
import { getLinkBuildStatusColor, formatStatusText } from "@/lib/utils/linkBuildColors";
import Header from "@/components/shared/Header";
import { useToast } from "@/components/shared/Toast";
import InventoryUsageDialog from "@/components/inventory/InventoryUsageDialog";
import GenerateWeeklyQuoteDialog from "@/components/quotes/GenerateWeeklyQuoteDialog";

export default function LinkBuildPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = params.id;
  const toast = useToast();

  // Get client data to retrieve company name and contact info
  const { data: clientData } = useSWR(
    clientId ? `/client/${clientId}` : null,
    () => get(`/client/${clientId}`),
    { revalidateOnFocus: true, dedupingInterval: 60000 }
  );
  const client = clientData?.data;
  const clientName = client?.company_name || "";
  const clientContactName = client
    ? `${client.first_name || ""} ${client.last_name || ""}`.trim()
    : "";
  const clientContactPhone = client?.phone_number || "";

  // SWR for jobs - using client name as parameter
  const {
    data: jobsData,
    isLoading: loading,
    error,
  } = useSWR(
    clientName ? [`/link-build/client/${encodeURIComponent(clientName)}`] : null,
    () => get(`/link-build/client/${encodeURIComponent(clientName)}`),
    { revalidateOnFocus: true, dedupingInterval: 60000 }
  );
  const jobs = useMemo(() => jobsData?.data || [], [jobsData]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [weekFilter, setWeekFilter] = useState("all");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Inventory usage dialog state
  const [usageOpen, setUsageOpen] = useState(false);
  const [selectedJobForUsage, setSelectedJobForUsage] = useState(null);

  // Quote dialog state
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);

  // Check URL parameters for status filter
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setStatusFilter(statusParam);
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);



  const handleDeleteOrder = (job) => {
    const title = "Delete order?";
    const message =
      "This action cannot be undone. This will permanently delete the order and its associated data.";
    toast.warning(title, message, {
      action: "Delete",
      duration: 0,
      onAction: async () => {
        try {
          await del(`/link-build/${job.id}`);
          if (clientName) {
            await mutate([`/link-build/client/${encodeURIComponent(clientName)}`]);
          }
          toast.success("Deleted", "Order deleted successfully.");
        } catch (e) {
          console.error(e);
          toast.error("Error", e.message || "Failed to delete order.");
        }
      },
      onCancel: () => {
        // no-op
      },
    });
  };

  // Job stats calculations
  const jobStats = useMemo(() => {
    if (!jobs.length)
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
      };

    return jobs.reduce(
      (acc, job) => {
        acc.total += 1;
        if (job.atp_pack_submitted?.toLowerCase() === "yes" || job.atp_date) {
          acc.completed += 1;
        } else {
          acc.inProgress += 1;
        }
        return acc;
      },
      { total: 0, completed: 0, inProgress: 0 }
    );
  }, [jobs]);

  // Get unique statuses for filter, sorted alphabetically
  const uniqueStatuses = useMemo(() => {
    const statuses = jobs.map((job) => job.status).filter(Boolean);
    return [...new Set(statuses)].sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  // Get unique weeks for filter
  const uniqueWeeks = useMemo(() => {
    const weeks = jobs.map((job) => job.week).filter(Boolean);
    return [...new Set(weeks)].sort();
  }, [jobs]);

  // Filter jobs based on search term, status, and week
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !searchTerm ||
        job.circuit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.site_b_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.technician?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.pm?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;

      const matchesWeek = weekFilter === "all" || job.week === weekFilter;

      return matchesSearch && matchesStatus && matchesWeek;
    });
  }, [jobs, searchTerm, statusFilter, weekFilter]);

  // Export columns configuration
  const exportColumns = [
    { header: "Circuit Number", accessorKey: "circuit_number" },
    { header: "Site B", accessorKey: "site_b_name" },
    { header: "County", accessorKey: "county" },
    { header: "PM", accessorKey: "pm" },
    { header: "Client", accessorKey: "client" },
    { header: "Technician", accessorKey: "technician" },
    { header: "Week", accessorKey: "week" },
    { header: "ATP Submitted", accessorKey: "atp_pack_submitted" },
    { header: "Quote Number", accessorKey: "quote_number" },
    {
      header: "Created",
      accessor: (job) => new Date(job.created_at).toLocaleDateString(),
    },
  ];

  const handleRowClick = (job) => {
    // Navigate to the order detail page instead of opening dialog
    router.push(`/clients/${clientId}/link_build/${job.id}`);
  };

  const handleInventoryUsage = (job) => {
    setSelectedJobForUsage(job);
    setUsageOpen(true);
  };

  const columns = [
    {
      accessorKey: "circuit_number",
      header: "Job Details",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Cable className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                {job.circuit_number || "-"}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {job.site_b_name || "-"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <Badge
            variant="outline"
            className={getLinkBuildStatusColor(job.status)}
          >
            {formatStatusText(job.status) || "Unknown"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "client",
      header: "Client",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400">
              {job.client || "-"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "atp_pack_submitted",
      header: "ATP Status",
      cell: ({ row }) => {
        const job = row.original;
        const isSubmitted = job.atp_pack_submitted || job.atp_date;
        return (
          <Badge
            variant="outline"
            className={
              isSubmitted
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400"
            }
          >
            {isSubmitted ? "Submitted" : "Pending"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const job = row.original;
        let countyDisplay = job.county || "-";
        if (countyDisplay.toLowerCase() === "tablebay")
          countyDisplay = "Table Bay";
        return (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 dark:text-white capitalize">
              {countyDisplay}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "pm",
      header: "Project Manager",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 dark:text-white capitalize">
              {job.pm || "-"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "technician",
      header: "Technician",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400">
              {job.technician || "-"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleInventoryUsage(job)}
                  className="flex items-center gap-2"
                >
                  <BarChart className="h-4 w-4" />
                  Inventory Usage
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteOrder(job)}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return <Loader variant="bars" text="Loading Link Build data..." />;
  }

  if (error) {
    toast.error("Error", "Failed to load link build jobs.");
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
            Error Loading Jobs
          </h3>
          <p className="text-red-600 dark:text-red-400">
            {error.message || error}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (clientName) {
                mutate([`/link-build/client/${encodeURIComponent(clientName)}`]);
              }
            }}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Page Header */}
      <Header
        title={
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Cable className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900"></div>
            </div>
            <span>Link Build Orders</span>
          </div>
        }
        stats={
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              {jobStats.total} Total Orders
            </span>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
            <Badge
              variant="default"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 font-medium"
            >
              {jobStats.completed} Completed
            </Badge>
          </div>
        }
        onBack={() => router.push(`/clients/${clientId}`)}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setQuoteDialogOpen(true)}
              className="gap-2"
            >
              <Receipt className="w-4 h-4" />
              Generate Quote
            </Button>
            <Button
              onClick={() => router.push(`/clients/${clientId}/link_build/new`)}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 gap-2"
            >
              <Plus className="w-4 h-4" />
              New Order
            </Button>
          </div>
        }
      />

      {/* Content */}
      <div className="space-y-6">
        {/* Jobs Table */}
        <div className="w-full">
          <DataTable
            columns={columns}
            data={filteredJobs}
            onRowClick={handleRowClick}
            searchEnabled={true}
            searchTerm={searchTerm}
            onSearch={(e) => setSearchTerm(e.target.value)}
            searchPlaceholder="Search jobs..."
            exportEnabled={true}
            exportData={filteredJobs}
            exportColumns={exportColumns}
            exportFilename="link-build-jobs"
            exportTitle="Export"
            weekFilterEnabled={true}
            weeks={uniqueWeeks}
            weekFilter={weekFilter}
            onWeekFilterChange={setWeekFilter}
            statusFilterEnabled={true}
            statuses={uniqueStatuses}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            formatStatus={formatStatusText}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            onPaginationChange={setPagination}
          />
        </div>
      </div>

      {/* Inventory Usage Dialog */}
      <InventoryUsageDialog
        open={usageOpen}
        onOpenChange={setUsageOpen}
        jobType="link_build"
        jobId={selectedJobForUsage?.id}
        onSuccess={() => {
          if (clientName) {
            mutate([`/link-build/client/${encodeURIComponent(clientName)}`]);
          }
          mutate([`/inventory`]);
          toast.success("Success", "Inventory usage applied.");
        }}
      />

      {/* Generate Quote Dialog */}
      <GenerateWeeklyQuoteDialog
        open={quoteDialogOpen}
        onOpenChange={setQuoteDialogOpen}
        clientId={clientId}
        clientInfo={client}
        orderType="link_build"
        orderTypeLabel="Link Build"
      />
    </div>
  );
}
