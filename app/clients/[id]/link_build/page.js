"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Activity,
  MoreVertical,
  Upload,
  Cable,
  MapPin,
  User,
  Hash,
  BarChart,
  Trash2,
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
import LinkBuildFormDialog from "@/components/shared/LinkBuildFormDialog";
import UploadDocumentDialog from "@/components/shared/UploadDocumentDialog";
import { jobTypeConfigs } from "@/lib/jobTypeConfigs";
import { getLinkBuildStatusColor, formatStatusText } from "@/lib/utils/linkBuildColors";
import Header from "@/components/shared/Header";
import { useToast } from "@/components/shared/Toast";
import InventoryUsageDialog from "@/components/inventory/InventoryUsageDialog";

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
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // New Job Modal State
  const [newJobModalOpen, setNewJobModalOpen] = useState(false);
  const [clientNameForModal, setClientNameForModal] = useState("");

  // Upload Document Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedJobForUpload, setSelectedJobForUpload] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Inventory usage dialog state
  const [usageOpen, setUsageOpen] = useState(false);
  const [selectedJobForUsage, setSelectedJobForUsage] = useState(null);

  // Check URL parameters for new job creation
  useEffect(() => {
    const isNew = searchParams.get("new") === "true";
    const clientNameParam = searchParams.get("clientName");

    if (isNew) {
      setNewJobModalOpen(true);
      if (clientNameParam) {
        setClientNameForModal(decodeURIComponent(clientNameParam));
      }
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  // Open edit dialog if edit=true and jobId are present in query params
  useEffect(() => {
    const isEdit = searchParams.get("edit") === "true";
    const jobId = searchParams.get("jobId");
    if (isEdit && jobId && jobs.length > 0) {
      const job = jobs.find((j) => String(j.id) === String(jobId));
      if (job) {
        setEditFormData({ ...job });
        setDialogOpen(true);
        // Clean up the URL so dialog can be closed without params
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [searchParams, jobs]);

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

  const handleUploadDocument = (job) => {
    setSelectedJobForUpload(job);
    setUploadModalOpen(true);
  };

  const handleInventoryUsage = (job) => {
    setSelectedJobForUsage(job);
    setUsageOpen(true);
  };

  // Handler for job create/edit success
  const handleJobSuccess = (job, mode) => {
    if (clientName) {
      mutate([`/link-build/client/${encodeURIComponent(clientName)}`]);
    }
    if (mode === "edit") {
      toast.success("Success", "Order updated successfully.");
    } else {
      toast.success("Success", "Order created successfully.");
    }
  };

  const uploadDocument = async ({ file, category, jobData }) => {
    setUploading(true);
    try {
      if (!jobData?.id) throw new Error("Missing job id");
      if (!clientId) throw new Error("Missing client id in route");
      if (
        !jobData?.circuit_number ||
        String(jobData.circuit_number).trim() === ""
      ) {
        throw new Error(
          "This job is missing a circuit number. Please add it before uploading."
        );
      }

      const toIdentifier = (s) =>
        String(s || "")
          .trim()
          .replace(/[\\/]+/g, "-")
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_-]/g, "");

      let clientNameStr = "";
      let clientIdentifier = "";
      try {
        const resp = await get(`/client/${clientId}`);
        const client = resp?.data || {};
        const baseName =
          client.company_name ||
          [client.first_name, client.last_name].filter(Boolean).join(" ");
        clientNameStr = String(baseName || "Client").trim();
        clientIdentifier = toIdentifier(baseName || "client");
      } catch (e) {
        const fallbackName =
          (jobData.client && String(jobData.client).trim()) || "Client";
        clientNameStr = fallbackName;
        clientIdentifier =
          (jobData.client_identifier &&
            String(jobData.client_identifier).trim()) ||
          toIdentifier(fallbackName);
      }

      if (!clientNameStr || !clientIdentifier) {
        throw new Error(
          "Missing client details (name/identifier). Please ensure the client has a name."
        );
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("clientName", clientNameStr);
      formData.append("clientIdentifier", clientIdentifier);
      formData.append("circuitNumber", String(jobData.circuit_number));
      formData.append("jobType", "link_build");
      formData.append("category", category);
      formData.append("linkBuildJobId", String(jobData.id));
      formData.append("clientId", String(clientId));

      const result = await post("/documents/upload", formData);
      toast.success("Success", "Document uploaded successfully.");
      if (clientName) {
        mutate([`/link-build/client/${encodeURIComponent(clientName)}`]);
      }
    } catch (error) {
      toast.error("Error", error.message || "Upload failed.");
      console.error("Upload error:", error);
      throw error;
    } finally {
      setUploading(false);
    }
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
                  onClick={() => handleUploadDocument(job)}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Document
                </DropdownMenuItem>
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
          <Button
            onClick={() => router.push(`/clients/${clientId}/link_build/new`)}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 gap-2"
          >
            <Plus className="w-4 h-4" />
            New Order
          </Button>
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

      {/* Edit Dialog */}
      <LinkBuildFormDialog
        mode="edit"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        jobData={editFormData}
        jobConfig={jobTypeConfigs["link-build"]}
        onSuccess={(updatedJob) => {
          handleJobSuccess(updatedJob, "edit");
          setEditFormData({});
        }}
        saving={saving}
      />

      {/* New Job Creation Modal */}
      <LinkBuildFormDialog
        mode="create"
        open={newJobModalOpen}
        onOpenChange={setNewJobModalOpen}
        jobConfig={jobTypeConfigs["link-build"]}
        clientId={clientId}
        clientName={clientName || clientNameForModal}
        clientContactName={clientContactName}
        clientContactPhone={clientContactPhone}
        onSuccess={(newJob) => {
          handleJobSuccess(newJob, "create");
          setClientNameForModal("");
        }}
      />

      {/* Upload Document Modal */}
      <UploadDocumentDialog
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUpload={uploadDocument}
        jobData={selectedJobForUpload}
        uploading={uploading}
      />

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
    </div>
  );
}
