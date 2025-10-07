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
  Calendar,
  MapPin,
  User,
  Building,
  Building2,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  FileText,
  Trash2,
  Phone,
  Mail,
  Clock,
  Ruler,
  Hash,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/DataTable";
import { get, put, post } from "@/lib/api/fetcher";
import { Loader } from "@/components/shared/Loader";
import JobCreationModal from "@/components/shared/JobCreationModal";
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

  // Fetch drop cable jobs for this client
  useEffect(() => {
    async function fetchDropCableJobs() {
      try {
        setLoading(true);
        const data = await get(`/drop-cable/client/${clientId}`);
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

  const handleCancelEdit = () => {
    setEditingJob(null);
    setEditFormData({});
    setDialogOpen(false);
  };

  const handleInputChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  console.log(editFormData);

  const handleSaveEdit = async () => {
    try {
      setSaving(true);

      // Only send fields allowed by backend schema to avoid validation errors
      const allowedKeys = [
        "client_id",
        "job_number",
        "circuit_number",
        "site_b_name",
        "county",
        "physical_address_site_b",
        "dfa_pm",
        "client",
        "client_contact_name",
        "end_client_contact_name",
        "end_client_contact_email",
        "end_client_contact_phone",
        "service_provider",
        "dpc_distance_meters",
        "survey_date",
        "survey_time",
        "order_received_at",
        "installation_date_requested_at",
        "survey_scheduled_for",
        "survey_completed_at",
        "lla_sent_at",
        "lla_received_at",
        "installation_scheduled_for",
        "installation_completed_at",
        "as_built_submitted_at",
        "technician_name",
        "status",
        "notes",
      ];

      const payload = { id: editingJob };
      for (const key of allowedKeys) {
        const val = editFormData[key];
        // Skip undefined, null, and empty strings to satisfy optional fields
        if (val === undefined || val === null || val === "") continue;
        // Ensure numeric fields are numbers
        if (key === "dpc_distance_meters") {
          const n = typeof val === "string" ? Number(val) : val;
          if (!Number.isFinite(n)) continue;
          payload[key] = n;
          continue;
        }
        payload[key] = val;
      }

      // Normalize survey_time from HH:MM (browser) to HH:MM:SS for backend schema
      if (payload.survey_time && /^\d{2}:\d{2}$/.test(payload.survey_time)) {
        payload.survey_time = payload.survey_time + ":00";
      }

      const result = await put(`/drop-cable`, payload);
      console.log(result);

      // Update jobs list with edited job
      setJobs((prev) =>
        prev.map((job) =>
          job.id === editingJob ? { ...job, ...payload } : job
        )
      );

      setEditingJob(null);
      setEditFormData({});
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving job:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // New Job Modal Handlers
  const handleJobCreated = (newJob) => {
    // Add new job to the list
    setJobs((prev) => [newJob, ...prev]);
  };

  const handleJobCreationError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleCloseNewJobModal = () => {
    setNewJobModalOpen(false);
    setClientNameForModal(""); // Reset client name when modal closes
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
      accessorKey: "survey_scheduled_for",
      header: "Survey Date",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <span>
            {job.survey_scheduled_for
              ? new Date(job.survey_scheduled_for).toLocaleDateString()
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
              <DialogHeader className="pb-4 items-center">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <span className="font-semibold">
                    {editFormData.circuit_number}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Job Information Section */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="w-4 h-4 text-blue-600" />
                    <h3 className="text-lg font-semibold">Job Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="circuit_number"
                        className="flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Circuit Number
                      </Label>
                      <Input
                        id="circuit_number"
                        value={editFormData.circuit_number || ""}
                        onChange={(e) =>
                          handleInputChange("circuit_number", e.target.value)
                        }
                        placeholder="Enter circuit number"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="site_b_name"
                        className="flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        Site B Name
                      </Label>
                      <Input
                        id="site_b_name"
                        value={editFormData.site_b_name || ""}
                        onChange={(e) =>
                          handleInputChange("site_b_name", e.target.value)
                        }
                        placeholder="Enter site name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="status"
                        className="flex items-center gap-2"
                      >
                        <Activity className="w-4 h-4" />
                        Status
                      </Label>
                      <select
                        id="status"
                        value={editFormData.status || ""}
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                        className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[
                          "awaiting_client_installation_date",
                          "survey_required",
                          "survey_scheduled",
                          "survey_completed",
                          "lla_required",
                          "awaiting_lla_approval",
                          "lla_received",
                          "installation_scheduled",
                          "installation_completed",
                        ].map((status) => (
                          <option key={status} value={status}>
                            {formatDropCableStatus(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label
                        htmlFor="county"
                        className="flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        County
                      </Label>
                      <select
                        id="county"
                        value={editFormData.county || ""}
                        onChange={(e) =>
                          handleInputChange("county", e.target.value || null)
                        }
                        className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select County</option>
                        <option value="tablebay">Tablebay</option>
                        <option value="falsebay">Falsebay</option>
                      </select>
                    </div>

                    <div>
                      <Label
                        htmlFor="dpc_distance_meters"
                        className="flex items-center gap-2"
                      >
                        <Ruler className="w-4 h-4" />
                        Distance (meters)
                      </Label>
                      <Input
                        id="dpc_distance_meters"
                        type="number"
                        value={editFormData.dpc_distance_meters || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "dpc_distance_meters",
                            parseInt(e.target.value) || null
                          )
                        }
                        placeholder="Distance in meters"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label
                      htmlFor="physical_address_site_b"
                      className="flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Physical Address
                    </Label>
                    <Input
                      id="physical_address_site_b"
                      value={editFormData.physical_address_site_b || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "physical_address_site_b",
                          e.target.value
                        )
                      }
                      placeholder="Enter physical address"
                      className="mt-1"
                    />
                  </div>
                </Card>

                {/* Client & Team Information */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-green-600" />
                    <h3 className="text-lg font-semibold">
                      Client & Team Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="client"
                        className="flex items-center gap-2"
                      >
                        <Building className="w-4 h-4" />
                        Client
                      </Label>
                      <Input
                        id="client"
                        value={editFormData.client || ""}
                        onChange={(e) =>
                          handleInputChange("client", e.target.value)
                        }
                        placeholder="Client name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="dfa_pm"
                        className="flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        DFA PM
                      </Label>
                      <Input
                        id="dfa_pm"
                        value={editFormData.dfa_pm || ""}
                        onChange={(e) =>
                          handleInputChange("dfa_pm", e.target.value)
                        }
                        placeholder="DFA Project Manager"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="technician_name"
                        className="flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Technician
                      </Label>
                      <Input
                        id="technician_name"
                        value={editFormData.technician_name || ""}
                        onChange={(e) =>
                          handleInputChange("technician_name", e.target.value)
                        }
                        placeholder="Technician name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="service_provider"
                        className="flex items-center gap-2"
                      >
                        <Building className="w-4 h-4" />
                        Service Provider
                      </Label>
                      <Input
                        id="service_provider"
                        value={editFormData.service_provider || ""}
                        onChange={(e) =>
                          handleInputChange("service_provider", e.target.value)
                        }
                        placeholder="Service provider"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </Card>

                {/* Contact Information */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Phone className="w-4 h-4 text-purple-600" />
                    <h3 className="text-lg font-semibold">
                      Contact Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="client_contact_name"
                        className="flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Client Contact Name
                      </Label>
                      <Input
                        id="client_contact_name"
                        value={editFormData.client_contact_name || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "client_contact_name",
                            e.target.value
                          )
                        }
                        placeholder="Client contact person"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="end_client_contact_name"
                        className="flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        End Client Contact
                      </Label>
                      <Input
                        id="end_client_contact_name"
                        value={editFormData.end_client_contact_name || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "end_client_contact_name",
                            e.target.value
                          )
                        }
                        placeholder="End client contact person"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="end_client_contact_email"
                        className="flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        End Client Email
                      </Label>
                      <Input
                        id="end_client_contact_email"
                        type="email"
                        value={editFormData.end_client_contact_email || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "end_client_contact_email",
                            e.target.value
                          )
                        }
                        placeholder="email@example.com"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="end_client_contact_phone"
                        className="flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        End Client Phone
                      </Label>
                      <Input
                        id="end_client_contact_phone"
                        value={editFormData.end_client_contact_phone || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "end_client_contact_phone",
                            e.target.value
                          )
                        }
                        placeholder="Phone number"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </Card>

                {/* Schedule Information */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <h3 className="text-lg font-semibold">
                      Schedule Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="survey_date"
                        className="flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Survey Date
                      </Label>
                      <Input
                        id="survey_date"
                        type="date"
                        value={editFormData.survey_date || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "survey_date",
                            e.target.value || null
                          )
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="survey_time"
                        className="flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        Survey Time
                      </Label>
                      <Input
                        id="survey_time"
                        type="time"
                        value={editFormData.survey_time || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "survey_time",
                            e.target.value || null
                          )
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="survey_scheduled_for"
                        className="flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Survey Scheduled
                      </Label>
                      <Input
                        id="survey_scheduled_for"
                        type="date"
                        value={
                          editFormData.survey_scheduled_for
                            ? editFormData.survey_scheduled_for.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "survey_scheduled_for",
                            e.target.value
                              ? e.target.value + "T00:00:00+00:00"
                              : null
                          )
                        }
                        className="mt-1"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <Label
                        htmlFor="installation_scheduled_for"
                        className="flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Installation Scheduled
                      </Label>
                      <Input
                        id="installation_scheduled_for"
                        type="date"
                        value={
                          editFormData.installation_scheduled_for
                            ? editFormData.installation_scheduled_for.split(
                                "T"
                              )[0]
                            : ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "installation_scheduled_for",
                            e.target.value
                              ? e.target.value + "T00:00:00+00:00"
                              : null
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              <DialogFooter className="pt-6 border-t">
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex-1 sm:flex-none"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex-1 sm:flex-none"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* New Job Creation Modal */}
          <JobCreationModal
            isOpen={newJobModalOpen}
            onClose={handleCloseNewJobModal}
            onJobCreated={handleJobCreated}
            onError={handleJobCreationError}
            jobType="drop-cable"
            jobConfig={jobTypeConfigs["drop-cable"]}
            clientId={clientId}
            clientName={clientNameForModal}
          />
        </div>
      </div>
    </div>
  );
}
