"use client";

import { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Truck, Edit, TrendingUp } from "lucide-react";
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
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // 'add' or 'edit'
  const [editVehicle, setEditVehicle] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // table, grid
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    try {
      setLoading(true);
      const response = await get("/fleet");
      setFleet(response.data || []);
    } catch (error) {
      console.error("Error fetching fleet:", error);
    } finally {
      setLoading(false);
    }
  };

  // Example fleet stats (replace with real logic)
  // Example fleet stats (replace with real logic)
  const fleetStats = useMemo(() => {
    if (!fleet.length)
      return {
        total: 0,
      };
    return {
      total: fleet.length,
    };
  }, [fleet]);

  // Filter fleet based on search term
  const filteredFleet = useMemo(() => {
    if (!searchTerm) return fleet;
    return fleet.filter(
      (item) =>
        item.registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.technician?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [fleet, searchTerm]);

  // Export columns configuration
  const exportColumns = [
    { header: "Registration", accessorKey: "registration" },
    { header: "Make", accessorKey: "make" },
    { header: "Model", accessorKey: "model" },
    { header: "VIN", accessorKey: "vin" },
    { header: "Type", accessorKey: "vehicle_type" },
    { header: "Technician", accessorKey: "technician" },
  ];

  // Optionally, you can add a status icon if you add a status field to the schema
  const getStatusIcon = () => null;

  if (loading)
    return <Loader variant="bars" text="Loading fleet management..." />;

  const handleEditVehicle = (vehicle) => {
    setEditVehicle(vehicle);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const allColumns = [
    {
      accessorKey: "registration",
      header: "Registration",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Truck className="w-5 h-5 text-blue-500" />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {row.original.registration}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {row.original.vin}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "make",
      header: "Make",
      cell: ({ row }) => (
        <span className="text-gray-600 dark:text-slate-400">
          {row.original.make}
        </span>
      ),
    },
    {
      accessorKey: "model",
      header: "Model",
      cell: ({ row }) => (
        <span className="text-gray-600 dark:text-slate-400">
          {row.original.model}
        </span>
      ),
    },
    {
      accessorKey: "vin",
      header: "VIN",
      cell: ({ row }) => (
        <span className="text-gray-600 dark:text-slate-400">
          {row.original.vin}
        </span>
      ),
    },
    {
      accessorKey: "vehicle_type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-gray-600 dark:text-slate-400">
          {row.original.vehicle_type}
        </span>
      ),
    },
    {
      accessorKey: "technician",
      header: "Technician",
      cell: ({ row }) => (
        <span className="text-gray-600 dark:text-slate-400">
          {row.original.technician}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditVehicle(row.original)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Vehicle
            </DropdownMenuItem>
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
            onClick={() => {
              setDialogMode("add");
              setEditVehicle(null);
              setIsDialogOpen(true);
            }}
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
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditVehicle(null);
            setDialogMode("add");
          }
        }}
        onSuccess={fetchFleet}
        mode={dialogMode}
        initialData={editVehicle}
      />
    </div>
  );
}
