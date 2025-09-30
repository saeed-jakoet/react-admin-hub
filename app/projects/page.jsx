"use client";

import * as React from "react";
import Link from "next/link";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/StatusPill";
import { Plus } from "lucide-react";
import { getAllProjects } from "@/lib/repositories/projects";

const columns = [
  {
    accessorKey: "title",
    header: "Project",
    cell: ({ row }) => (
      <Link href={`/projects/${row.original.id}`} className="font-medium hover:underline">
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row }) => row.original.client?.name || "-",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <span className="capitalize">{row.original.type}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusPill status={row.original.status} />,
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => `${row.original.progress}%`,
  },
  {
    accessorKey: "budget",
    header: "Budget",
    cell: ({ row }) => `$${row.original.budget.toLocaleString()}`,
  },
  {
    accessorKey: "deadline",
    header: "Deadline",
    cell: ({ row }) => new Date(row.original.deadline).toLocaleDateString(),
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getAllProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage fibre installation and maintenance projects</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <DataTable columns={columns} data={projects} searchKey="title" searchPlaceholder="Search projects..." />
    </div>
  );
}
