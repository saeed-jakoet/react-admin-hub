"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Activity,
  MoreVertical,
  Upload,
  FileText,
  Cable,
  MapPin,
  User,
  Mail,
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
import { get, post } from "@/lib/api/fetcher";
import { Loader } from "@/components/shared/Loader";
import JobFormDialog from "@/components/shared/JobFormDialog";
import UploadDocumentDialog from "@/components/shared/UploadDocumentDialog";
import AsBuiltDocumentDialog from "@/components/shared/AsBuiltDocumentDialog";
import { EmailDropCableDialog } from "@/components/clients/EmailDropCableDialog";
import { jobTypeConfigs } from "@/lib/jobTypeConfigs";
import { getDropCableStatusColor } from "@/lib/utils/dropCableColors";
import Header from "@/components/shared/Header";
import { useToast } from "@/components/shared/Toast";

export default function DropCablePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = params.id;
  const toast = useToast();

  // SWR for jobs
  const {
    data: jobsData,
    isLoading: loading,
    error,
  } = useSWR(
    clientId ? [`/drop-cable/client/${clientId}`] : null,
    () => get(`/drop-cable/client/${clientId}`),
    { revalidateOnFocus: true, dedupingInterval: 60000 }
  );
  const jobs = jobsData?.data || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Persist view mode in localStorage
  const [viewMode, setViewModeState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dropCableViewMode") || "table";
    }
    return "table";
  });

  const setViewMode = (mode) => {
    setViewModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("dropCableViewMode", mode);
    }
  };

  // New Job Modal State
  const [newJobModalOpen, setNewJobModalOpen] = useState(false);
  const [clientNameForModal, setClientNameForModal] = useState("");

  // Upload Document Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedJobForUpload, setSelectedJobForUpload] = useState(null);
  const [uploading, setUploading] = useState(false);

  // As-Built Document Modal State
  const [asBuiltModalOpen, setAsBuiltModalOpen] = useState(false);
  const [selectedJobForAsBuilt, setSelectedJobForAsBuilt] = useState(null);
  const [generatingAsBuilt, setGeneratingAsBuilt] = useState(false);

  // Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [clientForEmail, setClientForEmail] = useState(null);

  // Check URL parameters for new job creation
  useEffect(() => {
    const isNew = searchParams.get("new") === "true";
    const clientName = searchParams.get("clientName");

    if (isNew) {
      setNewJobModalOpen(true);
      if (clientName) {
        setClientNameForModal(decodeURIComponent(clientName));
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
        setEditingJob(job.id);
        setEditFormData({ ...job });
        setDialogOpen(true);
        // Clean up the URL so dialog can be closed without params
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [searchParams, jobs]);

  // Format status for display
  const formatDropCableStatus = (status) => {
    if (!status) return "Unknown";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Job stats calculations
  const jobStats = useMemo(() => {
    if (!jobs.length)
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        scheduled: 0,
        issues: 0,
      };

    return jobs.reduce(
      (acc, job) => {
        acc.total += 1;
        if (
          job.status === "installation_completed" ||
          job.status === "as_built_submitted"
        ) {
          acc.completed += 1;
        } else if (
          job.status === "installation_scheduled" ||
          job.status === "survey_scheduled"
        ) {
          acc.scheduled += 1;
        } else if (job.status === "issue_logged" || job.status === "on_hold") {
          acc.issues += 1;
        } else {
          acc.inProgress += 1;
        }
        return acc;
      },
      { total: 0, completed: 0, inProgress: 0, scheduled: 0, issues: 0 }
    );
  }, [jobs]);

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

  // Export columns configuration
  const exportColumns = [
    { header: "Circuit Number", accessorKey: "circuit_number" },
    { header: "Site B", accessorKey: "site_b_name" },
    { header: "Status", accessor: (job) => formatDropCableStatus(job.status) },
    { header: "County", accessorKey: "county" },
    { header: "Technician", accessorKey: "technician_name" },
    {
      header: "Survey Date",
      accessor: (job) =>
        job.survey_date ? new Date(job.survey_date).toLocaleDateString() : "-",
    },
    {
      header: "Install Date",
      accessor: (job) =>
        job.installation_scheduled_for
          ? new Date(job.installation_scheduled_for).toLocaleDateString()
          : "-",
    },
    {
      header: "Created",
      accessor: (job) => new Date(job.created_at).toLocaleDateString(),
    },
  ];

  const handleRowClick = (job) => {
    setEditingJob(job.id);
    setEditFormData({ ...job });
    setDialogOpen(true);
  };

  const handleUploadDocument = (job) => {
    setSelectedJobForUpload(job);
    setUploadModalOpen(true);
  };

  const handleGenerateAsBuilt = (job) => {
    setSelectedJobForAsBuilt(job);
    setAsBuiltModalOpen(true);
  };

  const handleSendEmail = async (job) => {
    // Fetch client data for email
    try {
      const clientResponse = await get(`/client/${clientId}`);
      setClientForEmail(clientResponse.data);
      setEmailModalOpen(true);
      toast.info("Email", "Email dialog opened.");
    } catch (error) {
      console.error("Error fetching client data:", error);
      toast.error("Error", "Failed to fetch client data for email.");
      // Still open dialog with empty client data
      setClientForEmail(null);
      setEmailModalOpen(true);
    }
  };

  // Handler for job create/edit success
  const handleJobSuccess = (job, mode) => {
    mutate([`/drop-cable/client/${clientId}`]);
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

      let clientName = "";
      let clientIdentifier = "";
      try {
        const resp = await get(`/client/${clientId}`);
        const client = resp?.data || {};
        const baseName =
          client.company_name ||
          [client.first_name, client.last_name].filter(Boolean).join(" ");
        clientName = String(baseName || "Client").trim();
        clientIdentifier = toIdentifier(baseName || "client");
      } catch (e) {
        const fallbackName =
          (jobData.client && String(jobData.client).trim()) || "Client";
        clientName = fallbackName;
        clientIdentifier =
          (jobData.client_identifier &&
            String(jobData.client_identifier).trim()) ||
          toIdentifier(fallbackName);
      }

      if (!clientName || !clientIdentifier) {
        throw new Error(
          "Missing client details (name/identifier). Please ensure the client has a name."
        );
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("clientName", clientName);
      formData.append("clientIdentifier", clientIdentifier);
      formData.append("circuitNumber", String(jobData.circuit_number));
      formData.append("jobType", "drop_cable");
      formData.append("category", category);
      formData.append("dropCableJobId", String(jobData.id));
      formData.append("clientId", String(clientId));

      const result = await post("/documents/upload", formData);
      toast.success("Success", "Document uploaded successfully.");
      mutate([`/drop-cable/client/${clientId}`]);
      console.log("Upload successful:", result);
    } catch (error) {
      toast.error("Error", error.message || "Upload failed.");
      console.error("Upload error:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const generateAsBuiltDocument = async (documentData) => {
    setGeneratingAsBuilt(true);
    try {
      const formData = new FormData();

      Object.keys(documentData).forEach((key) => {
        if (
          key !== "images" &&
          documentData[key] !== undefined &&
          documentData[key] !== ""
        ) {
          formData.append(key, documentData[key]);
        }
      });

      documentData.images?.forEach((image, index) => {
        if (image.file) {
          formData.append(`image_${index}`, image.file);
          formData.append(`caption_${index}`, image.caption || "");
        }
      });

      formData.append("jobId", documentData.jobId);
      formData.append("clientId", clientId);
      formData.append("documentType", "as_built");
      formData.append("jobType", "drop_cable");

      const result = await post("/documents/generate-as-built", formData);

      if (result.success && result.downloadUrl) {
        const link = document.createElement("a");
        link.href = result.downloadUrl;
        link.download = `AsBuilt_${documentData.circuitNumber}_${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setAsBuiltModalOpen(false);
        toast.success("Success", "As-Built document generated and downloaded.");
        mutate([`/drop-cable/client/${clientId}`]);
        console.log("As-Built document generated successfully:", result);
      } else {
        toast.error("Error", "Failed to generate As-Built document.");
        throw new Error("Failed to generate As-Built document");
      }
    } catch (error) {
      toast.error("Error", error.message || "As-Built generation failed.");
      console.error("As-Built generation error:", error);
      throw error;
    } finally {
      setGeneratingAsBuilt(false);
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
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
            className={getDropCableStatusColor(job.status)}
          >
            {formatDropCableStatus(job.status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 dark:text-white capitalize">
              {job.county || "-"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "technician_name",
      header: "Technician",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400">
              {job.technician_name || "-"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "dates",
      header: "Key Dates",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="space-y-1 text-sm">
            {job.survey_date && (
              <div className="text-slate-600 dark:text-slate-400">
                Survey: {new Date(job.survey_date).toLocaleDateString()}
              </div>
            )}
            {job.installation_scheduled_for && (
              <div className="text-slate-600 dark:text-slate-400">
                Install:{" "}
                {new Date(job.installation_scheduled_for).toLocaleDateString()}
              </div>
            )}
            {!job.survey_date && !job.installation_scheduled_for && (
              <span className="text-slate-400">—</span>
            )}
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
                  onClick={() => handleGenerateAsBuilt(job)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Generate As-Built
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSendEmail(job)}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Send Email
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
    toast.error("Error", "Failed to load drop cable jobs.");
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
            onClick={() => mutate([`/drop-cable/client/${clientId}`])}
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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Cable className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900"></div>
            </div>
            <span>Drop Cable Orders</span>
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
        onBack={() => router.back()}
        actions={
          <Button
            onClick={() => setNewJobModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 gap-2"
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
            exportFilename="drop-cable-jobs"
            exportTitle="Export"
            statusFilterEnabled={true}
            statuses={uniqueStatuses}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            formatStatus={formatDropCableStatus}
          />
        </div>
      </div>

      {/* Edit Dialog */}
      <JobFormDialog
        mode="edit"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        jobData={editFormData}
        jobConfig={jobTypeConfigs["drop-cable"]}
        onSuccess={(updatedJob) => {
          handleJobSuccess(updatedJob, "edit");
          setEditingJob(null);
          setEditFormData({});
        }}
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

      {/* As-Built Document Generation Modal */}
      <AsBuiltDocumentDialog
        open={asBuiltModalOpen}
        onOpenChange={setAsBuiltModalOpen}
        onGenerate={generateAsBuiltDocument}
        jobData={selectedJobForAsBuilt}
        generating={generatingAsBuilt}
      />

      {/* Email Dialog */}
      <EmailDropCableDialog
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        clientData={clientForEmail}
      />
    </div>
  );
}
