"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  RefreshCw,
  Upload,
  FileText,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreVertical
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { DataTable } from "@/components/shared/DataTable";
import { TableControls } from "@/components/shared/TableControls";
import { Loader } from "@/components/shared/Loader";

import { get, post } from "@/lib/api/fetcher";
import { getDropCableStatusColor, formatStatusText } from "@/lib/utils/dropCableColors";

import JobFormDialog from "@/components/shared/JobFormDialog";
import UploadDocumentDialog from "@/components/shared/UploadDocumentDialog";
import AsBuiltDocumentDialog from "@/components/shared/AsBuiltDocumentDialog";

export default function DropCablePage() {
  const { id: clientId } = useParams();
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog state
  const [newJobOpen, setNewJobOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [asBuiltOpen, setAsBuiltOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Fetch jobs
  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const res = await get(`/drop-cable/client/${clientId}`);
        setJobs(res.data || []);
      } finally {
        setLoading(false);
      }
    }
    if (clientId) fetchJobs();
  }, [clientId]);

  // Stats
  const stats = useMemo(() => {
    const total = jobs.length;
    const completed = jobs.filter(j => j.status === "completed").length;
    const inProgress = jobs.filter(j => j.status === "in_progress").length;
    const pendingSurvey = jobs.filter(j => j.status === "survey_pending").length;
    const docs = jobs.filter(j => j.as_built_submitted_at).length;

    return { total, completed, inProgress, pendingSurvey, docs };
  }, [jobs]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchesSearch = !searchTerm || j.circuit_number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || j.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  // Table columns
  const columns = [
    { accessorKey: "circuit_number", header: "Circuit", cell: ({ row }) => <span className="font-semibold">{row.original.circuit_number}</span> },
    { accessorKey: "site_b_name", header: "Site B" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => (
        <Badge variant="outline" className={getDropCableStatusColor(row.original.status)}>
          {formatStatusText(row.original.status)}
        </Badge>
      )
    },
    { accessorKey: "technician_name", header: "Technician" },
    { accessorKey: "installation_scheduled_for", header: "Install Date", cell: ({ row }) => row.original.installation_scheduled_for ? new Date(row.original.installation_scheduled_for).toLocaleDateString() : "—" },
    { accessorKey: "created_at", header: "Created", cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString() },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSelectedJob(row.original); setUploadOpen(true); }}>
              <Upload className="h-4 w-4 mr-2" /> Upload Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedJob(row.original); setAsBuiltOpen(true); }}>
              <FileText className="h-4 w-4 mr-2" /> Generate As-Built
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  if (loading) return <Loader variant="bars" text="Loading Drop Cable..." />;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Drop Cable Management</h1>
          <p className="text-gray-600 dark:text-slate-400">Manage client jobs, documents, and field progress</p>
        </div>
        <Button onClick={() => setNewJobOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create Drop Cable
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <StatCard label="Total Jobs" value={stats.total} icon={Activity} color="blue" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="green" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock} color="orange" />
        <StatCard label="Pending Survey" value={stats.pendingSurvey} icon={AlertTriangle} color="yellow" />
        <StatCard label="With Docs" value={stats.docs} icon={FileText} color="purple" />
      </div>

      {/* Controls */}
      <TableControls
        searchTerm={searchTerm}
        onSearch={e => setSearchTerm(e.target.value)}
        exportData={filteredJobs}
        exportColumns={columns}
        exportFilename="drop-cable-export"
        searchPlaceholder="Search jobs..."
      />

      {/* Table */}
      <Card className="shadow-sm">
        <div className="p-6">
          <DataTable columns={columns} data={filteredJobs} />
        </div>
      </Card>

      {/* Dialogs */}
      <JobFormDialog open={newJobOpen} onOpenChange={setNewJobOpen} onSuccess={() => router.refresh()} />
      <UploadDocumentDialog open={uploadOpen} onOpenChange={setUploadOpen} job={selectedJob} />
      <AsBuiltDocumentDialog open={asBuiltOpen} onOpenChange={setAsBuiltOpen} job={selectedJob} />
    </>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <Card className="bg-white dark:bg-slate-800 border shadow-sm">
      <div className="p-6 flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-50 dark:bg-${color}-900/20`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </Card>
  );
}
