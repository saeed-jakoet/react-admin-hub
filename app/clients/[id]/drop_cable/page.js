"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Activity,
  Download,
  RefreshCw,
  MoreVertical,
  Upload,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/shared/DataTable";
import { get, put, post } from "@/lib/api/fetcher";
import { Loader } from "@/components/shared/Loader";
import JobFormDialog from "@/components/shared/JobFormDialog";
import UploadDocumentDialog from "@/components/shared/UploadDocumentDialog";
import { jobTypeConfigs } from "@/lib/jobTypeConfigs";

export default function DropCablePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = params.id;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // New Job Modal State
  const [newJobModalOpen, setNewJobModalOpen] = useState(false);
  const [clientNameForModal, setClientNameForModal] = useState("");

  // Upload Document Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedJobForUpload, setSelectedJobForUpload] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch drop cable jobs for this client
  useEffect(() => {
    async function fetchDropCableJobs() {
      try {
        setLoading(true);
        const data = await get(`/drop-cable/client/${clientId}`);
        console.log(data);
        
        setJobs(data.data || []);
      } catch (error) {
        console.error("Error fetching drop cable jobs:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (clientId) {
      fetchDropCableJobs();
    }
  }, [clientId, router]);

  // Check URL parameters for new job creation
  useEffect(() => {
    const isNew = searchParams.get("new") === "true";
    const clientName = searchParams.get("clientName");

    if (isNew) {
      setNewJobModalOpen(true);
      // Store client name before clearing URL parameters
      if (clientName) {
        setClientNameForModal(decodeURIComponent(clientName));
      }
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  // Format status for display
  const formatDropCableStatus = (status) => {
    if (!status) return "Unknown";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get status color for badges
  const getDropCableStatusColor = (status) => {
    const colors = {
      awaiting_client_installation_date:
        "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700",
      survey_required:
        "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700",
      survey_scheduled:
        "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-700",
      survey_completed:
        "text-cyan-700 bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-700",
      lla_required:
        "text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700",
      awaiting_lla_approval:
        "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700",
      lla_received:
        "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700",
      installation_scheduled:
        "text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-700",
      installation_completed:
        "text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700",
      as_built_submitted:
        "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700",
    };
    return (
      colors[status] ||
      "text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700"
    );
  };

  // Get unique statuses for filter
  const uniqueStatuses = useMemo(() => {
    const statuses = jobs.map((job) => job.status).filter(Boolean);
    return [...new Set(statuses)];
  }, [jobs]);

  // Filter jobs based on search term and status
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !searchTerm ||
        job.circuit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.site_b_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.physical_address_site_b
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        job.technician_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.service_provider?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  // Handle edit mode
  const handleRowClick = (job) => {
    setEditingJob(job.id);
    setEditFormData({ ...job });
    setDialogOpen(true);
  };

  // Handle upload document
  const handleUploadDocument = (job) => {
    setSelectedJobForUpload(job);
    setUploadModalOpen(true);
  };

  // Upload document to API
  const uploadDocument = async ({ file, category, jobData }) => {
    setUploading(true);
    
    try {
      // Validate required job fields before building payload
      if (!jobData?.id) {
        throw new Error("Missing job id");
      }
      if (!clientId) {
        throw new Error("Missing client id in route");
      }
      if (!jobData?.circuit_number || String(jobData.circuit_number).trim() === "") {
        throw new Error("This job is missing a circuit number. Please add it before uploading.");
      }

      // Helper to derive a safe identifier from a name
      const toIdentifier = (s) =>
        String(s || "")
          .trim()
          .replace(/[\\/]+/g, "-")
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_-]/g, "");

      // Ensure non-empty clientName and clientIdentifier to satisfy backend schema
      let clientName = jobData.client && String(jobData.client).trim();
      let clientIdentifier = jobData.client_identifier && String(jobData.client_identifier).trim();

      // If we don't have them on the row, fetch client details and derive
      if (!clientName || !clientIdentifier) {
        try {
          const resp = await get(`/client/${clientId}`);
          const client = resp?.data || {};
          if (!clientName) {
            clientName = client.company_name || [client.first_name, client.last_name].filter(Boolean).join(" ");
          }
          if (!clientIdentifier) {
            const base = client.company_name || [client.first_name, client.last_name].filter(Boolean).join(" ");
            clientIdentifier = toIdentifier(base || "client");
          }
        } catch (e) {
          // Fallback: derive identifier from whatever name we have
          if (!clientName) clientName = "Client";
          if (!clientIdentifier) clientIdentifier = toIdentifier(clientName);
        }
      }

      if (!clientName || !clientIdentifier) {
        throw new Error("Missing client details (name/identifier). Please ensure the client has a name.");
      }

      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clientName", clientName);
      formData.append("clientIdentifier", clientIdentifier);
      formData.append("circuitNumber", String(jobData.circuit_number));
  formData.append("jobType", "drop_cable");
  formData.append("category", category);
  // Use new field expected by the API/DB column
  formData.append("dropCableJobId", String(jobData.id));
      formData.append("clientId", String(clientId));

      // Optional: debug log the payload keys (not file content)
      try {
        const debug = {};
        for (const [k, v] of formData.entries()) {
          debug[k] = k === "file" ? (v && v.name ? v.name : "[file]") : v;
        }
        console.debug("Uploading document with payload:", debug);
      } catch {}

      // Make API call to upload endpoint using your post provider
      const result = await post("/documents/upload", formData);
      console.log("Upload successful:", result);
      
      // Show success message or refresh data if needed
      // You could add a toast notification here
      
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Define table columns for DataTable - simplified view
  const columns = [
    {
      accessorKey: "circuit_number",
      header: "Circuit",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <span className="font-semibold">{job.circuit_number || "-"}</span>
        );
      },
    },
    {
      accessorKey: "site_b_name",
      header: "Site B",
      cell: ({ row }) => {
        const job = row.original;
        return <span>{job.site_b_name || "-"}</span>;
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
            className={getDropCableStatusColor(job.status)}
          >
            {formatDropCableStatus(job.status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "county",
      header: "County",
      cell: ({ row }) => {
        const job = row.original;
        return <span className="capitalize">{job.county || "-"}</span>;
      },
    },
    {
      accessorKey: "technician_name",
      header: "Technician",
      cell: ({ row }) => {
        const job = row.original;
        return <span>{job.technician_name || "-"}</span>;
      },
    },
    {
      accessorKey: "survey_date",
      header: "Survey Date",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <span>
            {job.survey_date
              ? new Date(job.survey_date).toLocaleDateString()
              : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "installation_scheduled_for",
      header: "Install Date",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <span>
            {job.installation_scheduled_for
              ? new Date(job.installation_scheduled_for).toLocaleDateString()
              : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <span className="text-sm text-gray-500">
            {new Date(job.created_at).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return <Loader variant="bars" text="Loading Drop Cable data..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
            Error Loading Jobs
          </h3>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[95vw] mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Drop Cable Jobs
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Click any row to edit job details
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={() => setNewJobModalOpen(true)}
                className="bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Drop Cable Job
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search circuits, sites, clients, technicians..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Status:{" "}
                    {statusFilter === "all"
                      ? "All"
                      : formatDropCableStatus(statusFilter)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Statuses
                  </DropdownMenuItem>
                  {uniqueStatuses.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => setStatusFilter(status)}
                    >
                      {formatDropCableStatus(status)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Jobs Table */}
          <DataTable
            columns={columns}
            data={filteredJobs}
            onRowClick={handleRowClick}
          />

          {/* Edit Dialog */}
          <JobFormDialog
            mode="edit"
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            jobData={editFormData}
            jobConfig={jobTypeConfigs["drop-cable"]}
            onSuccess={(updatedJob) => {
              // Update jobs list with edited job
              setJobs((prev) =>
                prev.map((job) =>
                  job.id === editingJob ? { ...job, ...updatedJob } : job
                )
              );
              setEditingJob(null);
              setEditFormData({});
            }}
            onError={(error) => setError(error)}
            saving={saving}
          />

          {/* New Job Creation Modal */}
          <JobFormDialog
            mode="create"
            open={newJobModalOpen}
            onOpenChange={setNewJobModalOpen}
            jobConfig={jobTypeConfigs["drop-cable"]}
            clientId={clientId}
            clientName={clientNameForModal}
            onSuccess={(newJob) => {
              // Add new job to the list
              setJobs((prev) => [newJob, ...prev]);
              setClientNameForModal("");
            }}
            onError={(error) => setError(error)}
          />

          {/* Upload Document Modal */}
          <UploadDocumentDialog
            open={uploadModalOpen}
            onOpenChange={setUploadModalOpen}
            onUpload={uploadDocument}
            jobData={selectedJobForUpload}
            uploading={uploading}
          />
        </div>
      </div>
    </div>
  );
}
