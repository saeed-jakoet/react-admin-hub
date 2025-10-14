"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MoreVertical,
  Building2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Edit,
  Eye,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Minus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { get } from "@/lib/api/fetcher";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { Loader } from "@/components/shared/Loader";
import Header from "@/components/shared/Header";
import { useToast } from "@/components/shared/Toast";

export default function ClientsPage() {
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useToast();

  // SWR for clients
  const {
    data: clientsData,
    isLoading: loading,
    error,
  } = useSWR(["/client"], () => get("/client"), {
    revalidateOnFocus: true,
    dedupingInterval: 60000,
  });
  const clients = clientsData?.data || [];

  // Client stats calculations
  const clientStats = useMemo(() => {
    if (!clients.length)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        withCompany: 0,
        withoutCompany: 0,
      };

    return clients.reduce(
      (acc, client) => {
        acc.total += 1;
        if (client.is_active) {
          acc.active += 1;
        } else {
          acc.inactive += 1;
        }
        if (client.company_name) {
          acc.withCompany += 1;
        } else {
          acc.withoutCompany += 1;
        }
        return acc;
      },
      { total: 0, active: 0, inactive: 0, withCompany: 0, withoutCompany: 0 }
    );
  }, [clients]);

  const getStatusColor = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
  };

  const getStatusIcon = (isActive) => {
    return isActive ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;

    return clients.filter(
      (client) =>
        `${client.first_name} ${client.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  // Export columns configuration
  const exportColumns = [
    { header: "Company", accessorKey: "company_name" },
    {
      header: "Contact Person",
      accessor: (client) => `${client.first_name} ${client.last_name}`,
    },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phone_number" },
    { header: "Address", accessorKey: "address" },
    {
      header: "Status",
      accessor: (client) => (client.is_active ? "Active" : "Inactive"),
    },
    {
      header: "Created Date",
      accessor: (client) => new Date(client.created_at).toLocaleDateString(),
    },
  ];

  const handleRowClick = (client) => {
    router.push(`/clients/${client.id}`);
  };

  // Toast handler for Add/Edit
  const handleDialogSuccess = (action = "add") => {
    mutate(["/client"]);
    if (action === "edit") {
      toast.success("Success", "Client updated successfully.");
    } else {
      toast.success("Success", "Client added successfully.");
    }
  };

  const handleDialogError = () => {
    toast.error("Error", "Failed to save client.");
  };

  if (loading) {
    return <Loader variant="bars" text="Loading clients..." />;
  }
  if (error) {
    toast.error("Error", "Failed to load clients data.");
    return <div className="p-8 text-red-600">Failed to load clients data.</div>;
  }

  const allColumns = [
    {
      accessorKey: "name",
      header: "Client Details",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {row.original.company_name}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone_number",
      header: "Contact",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">
              {row.original.email}
            </span>
          </div>
          {row.original.phone_number && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-slate-400">
                {row.original.phone_number}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Joined on",
      cell: ({ row }) => {
        const raw = row.original.created_at;
        let formatted = "—";
        if (raw) {
          const d = new Date(raw);
          const day = String(d.getDate()).padStart(2, "0");
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const year = d.getFullYear();
          formatted = `${day}/${month}/${year}`;
        }
        return (
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">
              {formatted}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-slate-400">
            {row.original.address || "—"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          {getStatusIcon(row.original.is_active)}
          <span
            className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(
              row.original.is_active
            )}`}
          >
            {row.original.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    // Removed actions column
  ];

  // Stats cards data for Header component
  const statsCards = [
    {
      label: "Total Clients",
      value: clientStats.total,
      desc: "Business accounts",
      icon: Building2,
      color: "blue",
      trend: TrendingUp,
    },
    {
      label: "Active Accounts",
      value: clientStats.active,
      desc: "Currently engaged",
      icon: UserCheck,
      color: "green",
      trend: TrendingUp,
    },
    {
      label: "Inactive Accounts",
      value: clientStats.inactive,
      desc: "Need attention",
      icon: UserX,
      color: "red",
      trend: TrendingDown,
    },
    {
      label: "With Company",
      value: clientStats.withCompany,
      desc: "Business clients",
      icon: Building2,
      color: "purple",
      trend: Minus,
    },
    {
      label: "Without Company",
      value: clientStats.withoutCompany,
      desc: "Individual clients",
      icon: UserCheck,
      color: "orange",
      trend: Minus,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Page Header with Stats */}
      <Header
        title={
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900"></div>
            </div>
            <span>Client Management</span>
          </div>
        }
        stats={
          <p className="text-gray-600 dark:text-slate-400">
            Manage your business relationships and contacts
          </p>
        }
        actions={
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        }
        statsCards={statsCards}
      />

      {/* Content */}
      <div className="space-y-6">
        {/* Clients Table */}
        <div className="w-full">
          <DataTable
            columns={allColumns}
            data={filteredClients}
            onRowClick={handleRowClick}
            searchEnabled={true}
            searchTerm={searchTerm}
            onSearch={(e) => setSearchTerm(e.target.value)}
            searchPlaceholder="Search clients..."
            exportEnabled={true}
            exportData={filteredClients}
            exportColumns={exportColumns}
            exportFilename="clients-export"
            exportTitle="Clients Report"
          />
        </div>
      </div>

      <AddClientDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => handleDialogSuccess("add")}
        onError={handleDialogError}
      />
    </div>
  );
}
