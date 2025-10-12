"use client";

import * as React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MoreVertical,
  Truck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { get } from "@/lib/api/fetcher";
import { AddFleetDialog } from "@/components/fleet/AddFleetDialog";
import { FleetGridView } from "@/components/fleet/FleetGridView";
import { Loader } from "@/components/shared/Loader";
import Header from "@/components/shared/Header";

export default function FleetPage() {
  const [fleet, setFleet] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState("table"); // table, grid
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    try {
      setLoading(true);
      // Replace with your actual endpoint when ready
      // const response = await get("/fleet");
      // setFleet(response.data);
      setFleet([]); // Placeholder
    } catch (error) {
      console.error("Error fetching fleet:", error);
    } finally {
      setLoading(false);
    }
  };

  // Example fleet stats (replace with real logic)
  const fleetStats = React.useMemo(() => {
    if (!fleet.length)
      return {
        total: 0,
        active: 0,
        maintenance: 0,
        outOfService: 0,
      };

    return fleet.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.status === "active") acc.active += 1;
        else if (item.status === "maintenance") acc.maintenance += 1;
        else acc.outOfService += 1;
        return acc;
      },
      { total: 0, active: 0, maintenance: 0, outOfService: 0 }
    );
  }, [fleet]);

  // Filter fleet based on search term
  const filteredFleet = React.useMemo(() => {
    if (!searchTerm) return fleet;
    return fleet.filter(
      (item) =>
        item.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.driver_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [fleet, searchTerm]);

  // Export columns configuration
  const exportColumns = [
    { header: "Vehicle Name", accessorKey: "vehicle_name" },
    { header: "License Plate", accessorKey: "license_plate" },
    { header: "Type", accessorKey: "type" },
    { header: "Status", accessorKey: "status" },
    { header: "Driver", accessorKey: "driver_name" },
    { header: "Location", accessorKey: "location" },
    { header: "Last Service", accessorKey: "last_service_date" },
    { header: "Next Service", accessorKey: "next_service_date" },
  ];

  const getStatusIcon = (status) => {
    if (status === "active")
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (status === "maintenance")
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  if (loading)
    return <Loader variant="bars" text="Loading fleet management..." />;

  const allColumns = [
    {
      accessorKey: "vehicle_name",
      header: "Vehicle",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Truck className="w-5 h-5 text-blue-500" />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {row.original.vehicle_name}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {row.original.license_plate}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-gray-600 dark:text-slate-400">
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(row.original.status)}
          <span className="text-gray-900 dark:text-white font-medium">
            {row.original.status}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "driver_name",
      header: "Driver",
      cell: ({ row }) => (
        <span className="text-gray-600 dark:text-slate-400">
          {row.original.driver_name || "—"}
        </span>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-medium">
            {row.original.location}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "last_service_date",
      header: "Last Service",
      cell: ({ row }) =>
        row.original.last_service_date ? (
          <span className="text-gray-900 dark:text-white">
            {new Date(row.original.last_service_date).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-slate-400">—</span>
        ),
    },
    {
      accessorKey: "next_service_date",
      header: "Next Service",
      cell: ({ row }) =>
        row.original.next_service_date ? (
          <span className="text-gray-900 dark:text-white">
            {new Date(row.original.next_service_date).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-slate-400">—</span>
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
              { icon: Edit, label: "Edit Vehicle" },
              { icon: Truck, label: "Assign Driver" },
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

  // Stats cards data for Header component
  const statsCards = [
    {
      label: "Total Vehicles",
      value: fleetStats.total,
      desc: "All fleet vehicles",
      icon: Truck,
      color: "blue",
      trend: TrendingUp,
    },
    {
      label: "Active",
      value: fleetStats.active,
      desc: "Currently in use",
      icon: CheckCircle,
      color: "green",
      trend: TrendingUp,
    },
    {
      label: "Maintenance",
      value: fleetStats.maintenance,
      desc: "In maintenance",
      icon: AlertTriangle,
      color: "orange",
      trend: TrendingDown,
    },
    {
      label: "Out of Service",
      value: fleetStats.outOfService,
      desc: "Unavailable",
      icon: XCircle,
      color: "red",
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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900"></div>
            </div>
            <span>Fleet Management</span>
          </div>
        }
        stats={
          <p className="text-gray-600 dark:text-slate-400">
            Track and manage your fleet vehicles
          </p>
        }
        actions={
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        }
        statsCards={statsCards}
      />

      {/* Content */}
      <div className="space-y-6">
        {viewMode === "grid" ? (
          <FleetGridView
            items={filteredFleet}
            getStatusIcon={getStatusIcon}
            onViewModeChange={setViewMode}
          />
        ) : (
          <DataTable
            columns={allColumns}
            data={filteredFleet}
            searchEnabled={true}
            searchTerm={searchTerm}
            onSearch={(e) => setSearchTerm(e.target.value)}
            searchPlaceholder="Search fleet..."
            exportEnabled={true}
            exportData={filteredFleet}
            exportColumns={exportColumns}
            exportFilename="fleet-export"
            exportTitle="Fleet Report"
            viewModeEnabled={true}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        )}
      </div>

      <AddFleetDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchFleet}
      />
    </div>
  );
}
