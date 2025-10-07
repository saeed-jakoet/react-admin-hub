"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
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
import { get, post } from "@/lib/api/fetcher";
import { Loader } from "@/components/shared/Loader";
import JobCreationModal from "@/components/shared/JobCreationModal";
import { jobTypeConfigs } from "@/lib/jobTypeConfigs";

export default function MaintenancePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = params.id;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // New Job Modal State
  const [newJobModalOpen, setNewJobModalOpen] = useState(false);
  const [clientNameForModal, setClientNameForModal] = useState("");

  // Fetch maintenance jobs for this client
  useEffect(() => {
    async function fetchMaintenanceJobs() {
      try {
        setLoading(true);
        const data = await get(`/maintenance/client/${clientId}`);
        setJobs(data.data || []);
      } catch (error) {
        console.error("Error fetching maintenance jobs:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (clientId) {
      fetchMaintenanceJobs();
    }
  }, [clientId, router]);

  // Check URL parameters for new job creation
  useEffect(() => {
    const isNew = searchParams.get('new') === 'true';
    const clientName = searchParams.get('clientName');
    
    if (isNew) {
      setNewJobModalOpen(true);
      // Store client name before clearing URL parameters
      if (clientName) {
        setClientNameForModal(decodeURIComponent(clientName));
      }
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  // Format status for display
  const formatMaintenanceStatus = (status) => {
    if (!status) return "Unknown";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get status color for badges
  const getMaintenanceStatusColor = (status) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      on_hold: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  // New Job Modal Handlers
  const handleJobCreated = (newJob) => {
    // Add new job to the list
    setJobs(prev => [newJob, ...prev]);
  };

  const handleJobCreationError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleCloseNewJobModal = () => {
    setNewJobModalOpen(false);
    setClientNameForModal(""); // Reset client name when modal closes
  };

  // Define table columns for DataTable
  const columns = [
    {
      accessorKey: "ticket_number",
      header: "Ticket #",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <span className="font-semibold">{job.ticket_number || "-"}</span>
        );
      },
    },
    {
      accessorKey: "maintenance_type",
      header: "Type",
      cell: ({ row }) => {
        const job = row.original;
        return <span className="capitalize">{job.maintenance_type || "-"}</span>;
      },
    },
    {
      accessorKey: "equipment_type",
      header: "Equipment",
      cell: ({ row }) => {
        const job = row.original;
        return <span>{job.equipment_type || "-"}</span>;
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const job = row.original;
        const priorityColors = {
          low: "bg-gray-100 text-gray-800",
          medium: "bg-blue-100 text-blue-800",
          high: "bg-orange-100 text-orange-800",
          critical: "bg-red-100 text-red-800",
        };
        return (
          <Badge className={priorityColors[job.priority] || "bg-gray-100 text-gray-800"}>
            {job.priority ? job.priority.charAt(0).toUpperCase() + job.priority.slice(1) : "-"}
          </Badge>
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
            className={getMaintenanceStatusColor(job.status)}
          >
            {formatMaintenanceStatus(job.status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "assigned_technician",
      header: "Technician",
      cell: ({ row }) => {
        const job = row.original;
        return <span>{job.assigned_technician || "-"}</span>;
      },
    },
    {
      accessorKey: "scheduled_date",
      header: "Scheduled Date",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <span>
            {job.scheduled_date
              ? new Date(job.scheduled_date).toLocaleDateString()
              : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const job = row.original;
        return <span>{job.location || "-"}</span>;
      },
    },
  ];

  // Filter jobs based on search term and status
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      (job.ticket_number && job.ticket_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.equipment_type && job.equipment_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.assigned_technician && job.assigned_technician.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get unique statuses for filter dropdown
  const uniqueStatuses = [...new Set(jobs.map((job) => job.status).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
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
                  Maintenance Jobs
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage maintenance and repair work
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
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
                    placeholder="Search tickets, equipment, technicians, locations..."
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
                      : formatMaintenanceStatus(statusFilter)}
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
                      {formatMaintenanceStatus(status)}
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
          />

          {/* New Job Creation Modal */}
          <JobCreationModal
            isOpen={newJobModalOpen}
            onClose={handleCloseNewJobModal}
            onJobCreated={handleJobCreated}
            onError={handleJobCreationError}
            jobType="maintenance"
            jobConfig={jobTypeConfigs["maintenance"]}
            clientId={clientId}
            clientName={clientNameForModal}
          />
        </div>
      </div>
    </div>
  );
}