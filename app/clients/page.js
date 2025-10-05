"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Plus,
  MoreVertical,
  Users,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
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
import { TableControls } from "@/components/shared/TableControls";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState("table"); // table, grid
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await get("/client");
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  // Client stats calculations
  const clientStats = React.useMemo(() => {
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
  const filteredClients = React.useMemo(() => {
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
    { header: "First Name", accessorKey: "first_name" },
    { header: "Last Name", accessorKey: "last_name" },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phone_number" },
    { header: "Company", accessorKey: "company_name" },
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

  if (loading) {
    return <Loader text="Loading clients..." />;
  }

  const allColumns = [
    {
      accessorKey: "name",
      header: "Client Details",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {row.original.first_name} {row.original.last_name}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {row.original.email}
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
          {row.original.phone_number && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white">
                {row.original.phone_number}
              </span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-slate-400">
              {row.original.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "company_name",
      header: "Company",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-medium">
            {row.original.company_name || "—"}
          </span>
        </div>
      ),
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
    {
      id: "actions",
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {[
              { icon: Eye, label: "View Details" },
              { icon: Edit, label: "Edit Client" },
              { icon: Mail, label: "Send Email" },
              { icon: Phone, label: "Call Client" },
            ].map((item, i) => (
              <DropdownMenuItem key={i}>
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Client Management
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Manage your client relationships and contacts
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="space-y-6">
        {/* Client Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            {
              label: "Total Clients",
              value: clientStats.total,
              desc: "Across all categories",
              icon: Users,
              color: "blue",
              trend: TrendingUp,
            },
            {
              label: "Active Clients",
              value: clientStats.active,
              desc: "Currently engaged",
              icon: UserCheck,
              color: "green",
              trend: TrendingUp,
            },
            {
              label: "Inactive Clients",
              value: clientStats.inactive,
              desc: "Need attention",
              icon: UserX,
              color: "red",
              trend: TrendingDown,
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center`}
                  >
                    <stat.icon
                      className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                    />
                  </div>
                  <stat.trend
                    className={`w-5 h-5 ${
                      stat.color === "red"
                        ? "text-red-500"
                        : stat.color === "green"
                        ? "text-green-500"
                        : "text-purple-500"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      stat.color === "green"
                        ? "text-green-600 dark:text-green-400"
                        : stat.color === "red"
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-slate-400"
                    }`}
                  >
                    {stat.desc}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Client Controls */}
        <TableControls
          searchTerm={searchTerm}
          onSearch={(e) => setSearchTerm(e.target.value)}
          exportData={filteredClients}
          exportColumns={exportColumns}
          exportFilename="clients-export"
          exportTitle="Clients Report"
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchPlaceholder="Search clients..."
        />

        {/* Clients Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredClients.map((client) => (
              <Card
                key={client.id}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md cursor-pointer transition-all"
                onClick={() => handleRowClick(client)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                        {client.first_name} {client.last_name}
                      </h3>
                      <p className="text-gray-500 dark:text-slate-400 text-sm">
                        {client.email}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(client);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Client
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3">
                    {client.phone_number && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-slate-400 text-sm">
                          Phone
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {client.phone_number}
                        </span>
                      </div>
                    )}

                    {client.company_name && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-slate-400 text-sm">
                          Company
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {client.company_name}
                        </span>
                      </div>
                    )}

                    {client.address && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-slate-400 text-sm">
                          Address
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium text-right">
                          {client.address}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(
                          client.is_active
                        )}`}
                      >
                        {client.is_active ? "Active" : "Inactive"}
                      </span>
                      <span className="text-gray-500 dark:text-slate-400 text-xs">
                        {new Date(client.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // Table View
          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6">
              <DataTable
                showToolbar={false}
                columns={allColumns}
                data={filteredClients}
                onRowClick={handleRowClick}
              />
            </div>
          </Card>
        )}
      </div>

      <AddClientDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchClients}
      />
    </>
  );
}
