"use client";

import * as React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, UserPlus, CheckCircle, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columns = [
  { 
    accessorKey: "name", 
    header: "Name",
    cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`
  },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phoneNumber", header: "Phone" },
  { accessorKey: "companyName", header: "Company" },
  {
    accessorKey: "clientType",
    header: "Type",
    cell: ({ row }) => {
      const getTypeColor = (type) => {
        const colors = {
          'Enterprise': 'border-blue-500/20 bg-blue-500/10 text-blue-500',
          'Commercial': 'border-green-500/20 bg-green-500/10 text-green-500',
          'Residential': 'border-purple-500/20 bg-purple-500/10 text-purple-500',
          'Small Business': 'border-orange-500/20 bg-orange-500/10 text-orange-500'
        };
        return colors[type] || 'border-gray-500/20 bg-gray-500/10 text-gray-500';
      };
      
      return (
        <Badge variant="outline" className={getTypeColor(row.original.clientType)}>
          {row.original.clientType}
        </Badge>
      );
    },
  },
  { accessorKey: "address", header: "Address" },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Active" : "Inactive"}
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
          <DropdownMenuItem>Assign Project</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

const clickButton = () => {
  console.log('add client button clicked')
}

export default function ClientsPage() {

  const [clients] = React.useState([
    {
      id: "client-001",
      firstName: "Robert",
      lastName: "Johnson",
      email: "robert.johnson@techcorp.com",
      phoneNumber: "+1 (555) 123-4567",
      address: "1234 Business Blvd, Tech City, TC 12345",
      companyName: "TechCorp Industries",
      notes: "Large enterprise client requiring high-speed fiber backbone installation",
      createdAt: "2024-01-15",
      updatedAt: "2024-09-28",
      isActive: true,
      clientType: "Enterprise"
    },
    {
      id: "client-002", 
      firstName: "Maria",
      lastName: "Garcia",
      email: "maria.garcia@downtownmall.com",
      phoneNumber: "+1 (555) 234-5678",
      address: "567 Shopping Center Dr, Downtown, DT 54321",
      companyName: "Downtown Shopping Mall",
      notes: "Commercial client needing network upgrade for retail operations",
      createdAt: "2024-02-20",
      updatedAt: "2024-09-30",
      isActive: true,
      clientType: "Commercial"
    },
    {
      id: "client-003",
      firstName: "David",
      lastName: "Chen",
      email: "david.chen@residentialpark.com", 
      phoneNumber: "+1 (555) 345-6789",
      address: "890 Residential Way, Suburb Heights, SH 67890",
      companyName: "Maple Heights Development",
      notes: "Residential development requiring fiber-to-home installation",
      createdAt: "2024-03-10",
      updatedAt: "2024-09-25",
      isActive: true,
      clientType: "Residential"
    },
    {
      id: "client-004",
      firstName: "Jennifer",
      lastName: "Smith",
      email: "jennifer.smith@oldclient.com",
      phoneNumber: "+1 (555) 456-7890", 
      address: "321 Legacy St, Old Town, OT 13579",
      companyName: "Legacy Systems Inc",
      notes: "Former client, project completed but account maintained for future work",
      createdAt: "2023-11-05",
      updatedAt: "2024-06-15",
      isActive: false,
      clientType: "Enterprise"
    },
    {
      id: "client-005",
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@startup.tech",
      phoneNumber: "+1 (555) 567-8901",
      address: "654 Innovation Dr, Tech Park, TP 24680", 
      companyName: "StartupTech Solutions",
      notes: "Growing startup requiring scalable fiber infrastructure",
      createdAt: "2024-08-01",
      updatedAt: "2024-09-30",
      isActive: true,
      clientType: "Small Business"
    }
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage client accounts and relationships</p>
        </div>
        <Button onClick={clickButton}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <DataTable columns={columns} data={clients} searchKey="name" searchPlaceholder="Search clients..." />
    </div>
  );
}
