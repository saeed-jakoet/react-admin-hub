"use client";

import * as React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Plus,
  MoreVertical,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  MapPin,
  Truck,
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
import { AddInventoryDialog } from "@/components/inventory/AddInventoryDialog";
import { InventoryGridView } from "@/components/inventory/InventoryGridView";
import { Loader } from "@/components/shared/Loader";
import { TableControls } from "@/components/shared/TableControls";

export default function InventoryPage() {
  const [inventory, setInventory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState("table"); // table, grid
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await get("/inventory");
      setInventory(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  // Stock status calculations
  const stockStats = React.useMemo(() => {
    if (!inventory.length)
      return {
        total: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0,
      };

    return inventory.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.quantity === 0) {
          acc.outOfStock += 1;
        } else if (item.quantity <= item.minimum_quantity) {
          acc.lowStock += 1;
        } else {
          acc.inStock += 1;
        }
        acc.totalValue += (item.cost_price || 0) * item.quantity;
        return acc;
      },
      { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalValue: 0 }
    );
  }, [inventory]);

  const getCategoryColor = (category) => {
    const colors = {
      cables:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      tools:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      connectors:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      networking_equipment:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
      accessories:
        "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400",
    };
    return (
      colors[category?.toLowerCase()] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    );
  };

  const getCategoryDotColor = (category) => {
    const colors = {
      cables: "bg-blue-500",
      tools: "bg-green-500",
      connectors: "bg-purple-500",
      networking_equipment: "bg-orange-500",
      accessories: "bg-pink-500",
    };
    return colors[category?.toLowerCase()] || "bg-gray-500";
  };

  const getStockIcon = (quantity, minQuantity) => {
    if (quantity === 0) return <XCircle className="w-4 h-4 text-red-500" />;
    if (quantity <= minQuantity)
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  };

  // Filter inventory based on search term
  const filteredInventory = React.useMemo(() => {
    if (!searchTerm) return inventory;

    return inventory.filter(
      (item) =>
        item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  // Export columns configuration
  const exportColumns = [
    { header: "Item Name", accessorKey: "item_name" },
    { header: "Item Code", accessorKey: "item_code" },
    { header: "Category", accessorKey: "category" },
    { header: "Quantity", accessorKey: "quantity" },
    { header: "Unit", accessorKey: "unit" },
    { header: "Minimum Quantity", accessorKey: "minimum_quantity" },
    { header: "Location", accessorKey: "location" },
    { header: "Supplier", accessorKey: "supplier_name" },
    {
      header: "Cost Price",
      accessor: (item) => (item.cost_price ? `R ${item.cost_price}` : "—"),
    },
    {
      header: "Stock Status",
      accessor: (item) => {
        const status = getStockStatus(item.quantity, item.minimum_quantity);
        return status.label;
      },
    },
    {
      header: "Created Date",
      accessor: (item) => new Date(item.created_at).toLocaleDateString(),
    },
  ];

  const getStockStatus = (quantity, minQuantity) => {
    if (quantity === 0)
      return {
        label: "Out of Stock",
        color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      };
    if (quantity <= minQuantity)
      return {
        label: "Low Stock",
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
      };
    return {
      label: "In Stock",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    };
  };

  if (loading) return <Loader variant="bars" text="Loading inventory system..." />;

  const allColumns = [
    {
      accessorKey: "item_name",
      header: "Item Details",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${getCategoryDotColor(
              row.original.category
            )}`}
          ></div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {row.original.item_name}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {row.original.item_code}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${getCategoryColor(
            row.original.category
          )}`}
        >
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Stock Status",
      cell: ({ row }) => {
        const { quantity, minimum_quantity, unit } = row.original;
        const status = getStockStatus(quantity, minimum_quantity);
        return (
          <div className="flex items-center space-x-3">
            {getStockIcon(quantity, minimum_quantity)}
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {quantity} {unit}
              </div>
              <div
                className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${status.color}`}
              >
                {status.label}
              </div>
            </div>
          </div>
        );
      },
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
      accessorKey: "supplier_name",
      header: "Supplier",
      cell: ({ row }) => (
        <span className="text-gray-600 dark:text-slate-400">
          {row.original.supplier_name || "—"}
        </span>
      ),
    },
    {
      accessorKey: "cost_price",
      header: "Unit Price",
      cell: ({ row }) =>
        row.original.cost_price ? (
          <span className="font-semibold text-gray-900 dark:text-white">
            R {row.original.cost_price}
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
              { icon: Edit, label: "Edit Item" },
              { icon: Package, label: "Update Stock" },
              { icon: Truck, label: "Reorder" },
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
            Inventory Management
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Track and manage your stock levels
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="space-y-6">
        {/* Inventory Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            {
              label: "Total Items",
              value: stockStats.total,
              desc: "Across all categories",
              icon: Package,
              color: "blue",
              trend: TrendingUp,
            },
            {
              label: "In Stock",
              value: stockStats.inStock,
              desc: "Items available",
              icon: CheckCircle,
              color: "green",
              trend: TrendingUp,
            },
            {
              label: "Low Stock",
              value: stockStats.lowStock,
              desc: "Need reorder",
              icon: AlertTriangle,
              color: "orange",
              trend: TrendingDown,
            },
            {
              label: "Out of Stock",
              value: stockStats.outOfStock,
              desc: "Critical items",
              icon: XCircle,
              color: "red",
              trend: Minus,
            },
            {
              label: "Total Value",
              value: `R${(stockStats.totalValue / 1000).toFixed(1)}K`,
              desc: "Stock valuation",
              icon: Truck,
              color: "purple",
              trend: TrendingUp,
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
                        : stat.color === "orange"
                        ? "text-orange-500"
                        : "text-green-500"
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
                        : stat.color === "orange"
                        ? "text-orange-600 dark:text-orange-400"
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

        <TableControls
          searchTerm={searchTerm}
          onSearch={(e) => setSearchTerm(e.target.value)}
          exportData={filteredInventory}
          exportColumns={exportColumns}
          exportFilename="inventory-export"
          exportTitle="Inventory Report"
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchPlaceholder="Search inventory..."
        />

        {/* Inventory Display */}
        {viewMode === "grid" ? (
          <InventoryGridView
            items={filteredInventory}
            getCategoryColor={getCategoryColor}
            getCategoryDotColor={getCategoryDotColor}
            getStockIcon={getStockIcon}
            getStockStatus={getStockStatus}
          />
        ) : (
          // Table View
          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6">
              <DataTable
                showToolbar={false}
                columns={allColumns}
                data={filteredInventory}
              />
            </div>
          </Card>
        )}
      </div>

      <AddInventoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchInventory}
      />
    </>
  );
}
