"use client";

import * as React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Package,
  Plus,
  AlertTriangle,
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
import { AddInventoryDialog } from "@/components/inventory/AddInventoryDialog";
import { Loader } from "@/components/shared/Loader";

const columns = [
  {
    accessorKey: "item_name",
    header: "Item Name",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.item_name}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.item_code}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const getCategoryColor = (category) => {
        const colors = {
          cables: "border-blue-500/20 bg-blue-500/10 text-blue-500",
          tools: "border-green-500/20 bg-green-500/10 text-green-500",
          connectors: "border-purple-500/20 bg-purple-500/10 text-purple-500",
          networking_equipment:
            "border-orange-500/20 bg-orange-500/10 text-orange-500",
          accessories: "border-red-500/20 bg-red-500/10 text-red-500",
        };
        return (
          colors[category?.toLowerCase().replace(/\s+/g, "_")] ||
          "border-gray-500/20 bg-gray-500/10 text-gray-500"
        );
      };

      return (
        <Badge
          variant="outline"
          className={getCategoryColor(row.original.category)}
        >
          {row.original.category}
        </Badge>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Stock",
    cell: ({ row }) => {
      const { quantity, minimum_quantity, unit } = row.original;
      const isLowStock = quantity <= minimum_quantity;
      const isOutOfStock = quantity === 0;

      return (
        <div className="flex items-center gap-2">
          {isOutOfStock ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : isLowStock ? (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <span
            className={`font-medium ${
              isOutOfStock
                ? "text-red-600"
                : isLowStock
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {quantity} {unit}
          </span>
        </div>
      );
    },
  },
  { accessorKey: "location", header: "Location" },
  { accessorKey: "supplier_name", header: "Supplier" },
  {
    accessorKey: "cost_price",
    header: "Cost",
    cell: ({ row }) =>
      row.original.cost_price ? `R ${row.original.cost_price}` : "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { quantity, minimum_quantity } = row.original;
      const isOutOfStock = quantity === 0;
      const isLowStock = quantity <= minimum_quantity;

      if (isOutOfStock) {
        return <Badge variant="destructive">Out of Stock</Badge>;
      } else if (isLowStock) {
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
          >
            Low Stock
          </Badge>
        );
      } else {
        return (
          <Badge
            variant="default"
            className="bg-green-500/10 text-green-600 border-green-500/20"
          >
            In Stock
          </Badge>
        );
      }
    },
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
          <DropdownMenuItem>Edit Item</DropdownMenuItem>
          <DropdownMenuItem>Update Stock</DropdownMenuItem>
          <DropdownMenuItem>Reorder</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function InventoryPage() {
  const [inventory, setInventory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

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

  if (loading) {
    return <Loader text="Loading inventory..." />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">
            Manage stock levels and equipment
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={inventory}
        searchKey="item_name"
        searchPlaceholder="Search inventory..."
      />

      <AddInventoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchInventory}
      />
    </div>
  );
}
