"use client";

import * as React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Package, Plus, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columns = [
  { 
    accessorKey: "item_name", 
    header: "Item Name",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.item_name}</div>
        <div className="text-sm text-muted-foreground">{row.original.item_code}</div>
      </div>
    )
  },
  { 
    accessorKey: "category", 
    header: "Category",
    cell: ({ row }) => {
      const getCategoryColor = (category) => {
        const colors = {
          'cables': 'border-blue-500/20 bg-blue-500/10 text-blue-500',
          'tools': 'border-green-500/20 bg-green-500/10 text-green-500',
          'routers': 'border-purple-500/20 bg-purple-500/10 text-purple-500',
          'equipment': 'border-orange-500/20 bg-orange-500/10 text-orange-500',
          'hardware': 'border-red-500/20 bg-red-500/10 text-red-500'
        };
        return colors[category?.toLowerCase()] || 'border-gray-500/20 bg-gray-500/10 text-gray-500';
      };
      
      return (
        <Badge variant="outline" className={getCategoryColor(row.original.category)}>
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
          <span className={`font-medium ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600'}`}>
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
    cell: ({ row }) => row.original.cost_price ? `R ${row.original.cost_price}` : "-"
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
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Low Stock</Badge>;
      } else {
        return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">In Stock</Badge>;
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

const clickButton = () => {
  console.log('add inventory item button clicked')
}

export default function InventoryPage() {
  const [inventory] = React.useState([
    {
      id: "inv-001",
      item_name: "Fiber Optic Cable - Single Mode",
      item_code: "FOC-SM-1000",
      description: "Single mode fiber optic cable for long distance installations",
      quantity: 500,
      unit: "meters",
      minimum_quantity: 100,
      reorder_level: 200,
      category: "cables",
      supplier_name: "FiberTech Solutions",
      supplier_contact: "support@fibertech.com",
      location: "Warehouse A",
      cost_price: 2.50,
      selling_price: 4.00,
      created_at: "2024-01-15",
      updated_at: "2024-09-28"
    },
    {
      id: "inv-002",
      item_name: "Fusion Splicer Kit",
      item_code: "FSK-PRO-2024",
      description: "Professional fusion splicer for fiber optic connections",
      quantity: 3,
      unit: "units",
      minimum_quantity: 2,
      reorder_level: 3,
      category: "tools",
      supplier_name: "Professional Tools Inc",
      supplier_contact: "orders@protools.com",
      location: "Equipment Room",
      cost_price: 1200.00,
      selling_price: 1800.00,
      created_at: "2024-02-20",
      updated_at: "2024-09-30"
    },
    {
      id: "inv-003",
      item_name: "Ethernet Router - Enterprise",
      item_code: "ETH-ENT-24P",
      description: "24-port enterprise grade ethernet router",
      quantity: 0,
      unit: "units",
      minimum_quantity: 5,
      reorder_level: 10,
      category: "routers",
      supplier_name: "NetworkPro Distributors",
      supplier_contact: "sales@networkpro.com",
      location: "Warehouse B",
      cost_price: 450.00,
      selling_price: 650.00,
      created_at: "2024-03-10",
      updated_at: "2024-09-25"
    },
    {
      id: "inv-004",
      item_name: "Cable Pulling Rope",
      item_code: "CPR-8MM-100",
      description: "8mm diameter cable pulling rope, 100m length",
      quantity: 15,
      unit: "rolls",
      minimum_quantity: 20,
      reorder_level: 25,
      category: "equipment",
      supplier_name: "Industrial Supply Co",
      supplier_contact: "info@industrialsupply.com",
      location: "Storage Yard",
      cost_price: 45.00,
      selling_price: 75.00,
      created_at: "2024-04-05",
      updated_at: "2024-09-29"
    },
    {
      id: "inv-005",
      item_name: "Fiber Optic Connectors - LC",
      item_code: "FOC-LC-100PK",
      description: "LC fiber optic connectors, 100 piece pack",
      quantity: 250,
      unit: "pieces",
      minimum_quantity: 50,
      reorder_level: 100,
      category: "hardware",
      supplier_name: "Connector Specialists",
      supplier_contact: "orders@connectorspec.com",
      location: "Parts Bin A",
      cost_price: 1.25,
      selling_price: 2.50,
      created_at: "2024-05-15",
      updated_at: "2024-09-30"
    }
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Manage stock levels and equipment</p>
        </div>
        <Button onClick={clickButton}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <DataTable columns={columns} data={inventory} searchKey="item_name" searchPlaceholder="Search inventory..." />
    </div>
  );
}
