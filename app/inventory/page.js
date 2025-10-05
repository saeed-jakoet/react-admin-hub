"use client";

import * as React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Filter,
  Download,
  Plus,
  Search,
  Settings2,
  ChevronDown,
  MoreVertical,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Grid3X3,
  List,
  ArrowUpDown,
  Calendar,
  MapPin,
  Truck,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { get } from "@/lib/api/fetcher";
import { AddInventoryDialog } from "@/components/inventory/AddInventoryDialog";
import { Loader } from "@/components/shared/Loader";

export default function InventoryPage() {
  const [inventory, setInventory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState("table"); // table, grid
  const [searchTerm, setSearchTerm] = React.useState("");
  const [columnVisibility, setColumnVisibility] = React.useState({
    item_name: true,
    category: true,
    quantity: true,
    min_quantity: true,
    unit_price: true,
    total_value: true,
    supplier_name: true,
    location: true,
    actions: true
  });

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
    if (!inventory.length) return { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalValue: 0 };
    
    return inventory.reduce((acc, item) => {
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
    }, { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalValue: 0 });
  }, [inventory]);

  const getCategoryColor = (category) => {
    const colors = {
      cables: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      tools: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      connectors: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      networking_equipment: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
      accessories: "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400",
    };
    return colors[category?.toLowerCase()] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
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
    if (quantity <= minQuantity) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  };

  // Filter inventory based on search term
  const filteredInventory = React.useMemo(() => {
    if (!searchTerm) return inventory;
    
    return inventory.filter(item => 
      item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  // Export functions
  const exportToCSV = () => {
    const headers = [
      'Item Name',
      'Category', 
      'Quantity',
      'Min Quantity',
      'Unit Price',
      'Total Value',
      'Supplier',
      'Location',
      'Status'
    ].join(',');
    
    const rows = filteredInventory.map(item => [
      `"${item.item_name || ''}"`,
      `"${item.category || ''}"`,
      item.quantity || 0,
      item.min_quantity || 0,
      item.unit_price || 0,
      (item.quantity * item.unit_price) || 0,
      `"${item.supplier_name || ''}"`,
      `"${item.location || ''}"`,
      `"${item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.min_quantity ? 'Low Stock' : 'In Stock'}"`
    ].join(','));
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple PDF export using window.print() with proper styling
    const printWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inventory Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1f2937; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
          th { background-color: #f9fafb; font-weight: 600; }
          .status-in { color: #059669; }
          .status-low { color: #d97706; }
          .status-out { color: #dc2626; }
        </style>
      </head>
      <body>
        <h1>Inventory Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <p>Total Items: ${filteredInventory.length}</p>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Min Qty</th>
              <th>Unit Price</th>
              <th>Total Value</th>
              <th>Supplier</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredInventory.map(item => `
              <tr>
                <td>${item.item_name || ''}</td>
                <td>${item.category || ''}</td>
                <td>${item.quantity || 0}</td>
                <td>${item.min_quantity || 0}</td>
                <td>$${item.unit_price || 0}</td>
                <td>$${(item.quantity * item.unit_price) || 0}</td>
                <td>${item.supplier_name || ''}</td>
                <td>${item.location || ''}</td>
                <td class="${item.quantity === 0 ? 'status-out' : item.quantity <= item.min_quantity ? 'status-low' : 'status-in'}">
                  ${item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.min_quantity ? 'Low Stock' : 'In Stock'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const getStockStatus = (quantity, minQuantity) => {
    if (quantity === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" };
    if (quantity <= minQuantity) return { label: "Low Stock", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" };
    return { label: "In Stock", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" };
  };

  if (loading) {
    return <Loader text="Loading inventory system..." />;
  }

  // Define all possible columns
  const allColumns = [
    {
      accessorKey: "item_name",
      header: "Item Details",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${getCategoryDotColor(row.original.category)}`}></div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">{row.original.item_name}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{row.original.item_code}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${getCategoryColor(row.original.category)}`}>
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
              <div className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${status.color}`}>
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
          <MapPin className="w-4 h-4 text-gray-400 dark:text-slate-400" />
          <span className="text-gray-900 dark:text-white font-medium">{row.original.location}</span>
        </div>
      )
    },
    { 
      accessorKey: "supplier_name", 
      header: "Supplier",
      cell: ({ row }) => (
        <span className="text-gray-600 dark:text-slate-400">{row.original.supplier_name || "—"}</span>
      )
    },
    {
      accessorKey: "cost_price",
      header: "Unit Price",
      cell: ({ row }) =>
        row.original.cost_price ? (
          <span className="font-semibold text-gray-900 dark:text-white">R {row.original.cost_price}</span>
        ) : (
          <span className="text-gray-400 dark:text-slate-400">—</span>
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
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit Item
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Package className="h-4 w-4 mr-2" />
              Update Stock
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Truck className="h-4 w-4 mr-2" />
              Reorder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Filter columns based on visibility settings
  const visibleColumns = allColumns.filter(column => {
    if (column.accessorKey === "item_name") return columnVisibility.item_name;
    if (column.accessorKey === "category") return columnVisibility.category;
    if (column.accessorKey === "quantity") return columnVisibility.quantity;
    if (column.accessorKey === "location") return columnVisibility.location;
    if (column.accessorKey === "supplier_name") return columnVisibility.supplier_name;
    if (column.accessorKey === "cost_price") return columnVisibility.unit_price;
    if (column.id === "actions") return columnVisibility.actions;
    return true;
  });

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-gray-600 dark:text-slate-400">Track and manage your stock levels</p>
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
          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-1">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stockStats.total}</p>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Across all categories</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-1">In Stock</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stockStats.inStock}</p>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Items available</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <TrendingDown className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-1">Low Stock</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stockStats.lowStock}</p>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Need reorder</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <Minus className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-1">Out of Stock</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stockStats.outOfStock}</p>
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">Critical items</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-1">Total Value</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">R{(stockStats.totalValue / 1000).toFixed(1)}K</p>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Stock valuation</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Comprehensive Inventory Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Left Side - Search & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[300px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                <Input
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <Button variant="outline" className="px-4 py-2 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              
              <Button 
                variant="outline" 
                onClick={exportToCSV}
                className="px-4 py-2 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>

              <Button 
                variant="outline" 
                onClick={exportToPDF}
                className="px-4 py-2 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>

            {/* Right Side - View Options */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">View as:</span>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1 border border-gray-200 dark:border-slate-600">
                <Button
                  size="sm"
                  variant={viewMode === "table" ? "default" : "ghost"}
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-2 ${
                    viewMode === "table"
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600"
                  } border-0`}
                >
                  <List className="w-4 h-4 mr-2" />
                  Table
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 ${
                    viewMode === "grid"
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600"
                  } border-0`}
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Grid
                </Button>
              </div>

              {/* Column Visibility Control - only show for table view */}
              {viewMode === "table" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="px-3 py-2 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700">
                      <Settings2 className="mr-2 h-4 w-4" />
                      Columns
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.item_name}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, item_name: checked }))
                      }
                    >
                      Item Details
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.category}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, category: checked }))
                      }
                    >
                      Category
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.quantity}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, quantity: checked }))
                      }
                    >
                      Stock Status
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.location}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, location: checked }))
                      }
                    >
                      Location
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.supplier_name}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, supplier_name: checked }))
                      }
                    >
                      Supplier
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.unit_price}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, unit_price: checked }))
                      }
                    >
                      Unit Price
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.actions}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, actions: checked }))
                      }
                    >
                      Actions
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Inventory Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredInventory.map((item) => {
              const status = getStockStatus(item.quantity, item.minimum_quantity);
              return (
                <Card key={item.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                          {item.item_name}
                        </h3>
                        <p className="text-gray-500 dark:text-slate-400 text-sm">
                          {item.item_code}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-slate-400 text-sm">Category</span>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-slate-400 text-sm">Stock Level</span>
                        <div className="flex items-center space-x-2">
                          {getStockIcon(item.quantity, item.minimum_quantity)}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-slate-400 text-sm">Location</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {item.location}
                        </span>
                      </div>
                      
                      {item.cost_price && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-slate-400 text-sm">Unit Price</span>
                          <span className="text-gray-900 dark:text-white font-semibold">
                            R {item.cost_price}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                        {item.supplier_name && (
                          <span className="text-gray-500 dark:text-slate-400 text-xs">
                            {item.supplier_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          // Table View
          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6">
              <DataTable
                showToolbar={false}
                columns={visibleColumns}
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