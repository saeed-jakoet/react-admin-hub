"use client";

import * as React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockStaff, mockRegions } from "@/lib/mock-data";

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone" },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className={row.original.type === "employee" ? "border-blue-500/20 bg-blue-500/10 text-blue-500" : "border-amber-500/20 bg-amber-500/10 text-amber-500"}>
        {row.original.type}
      </Badge>
    ),
  },
  { accessorKey: "role", header: "Role" },
  {
    accessorKey: "certifications",
    header: "Certifications",
    cell: ({ row }) => row.original.certifications.join(", "),
  },
  {
    accessorKey: "regionId",
    header: "Region",
    cell: ({ row }) => {
      const region = mockRegions.find((r) => r.id === row.original.regionId);
      return region?.code || "-";
    },
  },
  {
    accessorKey: "available",
    header: "Available",
    cell: ({ row }) => (
      <Badge variant={row.original.available ? "default" : "secondary"}>
        {row.original.available ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Assign to Project</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];


const clickButton = () => {
  console.log('button clicked')
}

export default function StaffPage() {
  const [staff] = React.useState(mockStaff);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Members</h1>
          <p className="text-muted-foreground">Manage employees and contractors</p>
        </div>
        <Button onClick={clickButton}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <DataTable columns={columns} data={staff} searchKey="name" searchPlaceholder="Search staff..." />
    </div>
  );
}
