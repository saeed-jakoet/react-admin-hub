"use client";

import { AddItemDialog } from "@/components/shared/AddItemDialog";
import { useToast } from "@/components/shared/Toast";
import {
  Package,
  Zap,
  MapPin,
  Building2,
  DollarSign,
  Hash,
  FileText,
  AlertTriangle,
  Truck,
  Plus,
  Layers,
} from "lucide-react";

export function AddInventoryDialog({
  open,
  onOpenChange,
  onSuccess,
  mode = "add",
  initialData = null,
}) {
  const { success, error } = useToast();

  // Custom data transformation for inventory (if needed, similar to fleet)
  const handleBeforeSubmit = (data) => {
    // Add any inventory-specific transformations here if needed
    return data;
  };

  const handleSuccess = () => {
    // Parent page handles the toast notification
    onSuccess?.();
  };

  const handleError = (err) => {
    error(
      "Error",
      mode === "edit" ? "Failed to update inventory item. Please try again." : "Failed to add inventory item. Please try again."
    );
  };

  const inventoryConfig = {
    title: mode === "edit" ? "Edit Inventory Item" : "Add New Inventory Item",
    entityName: "Item",
    titleIcon: Plus,
    apiEndpoint:
      mode === "edit" &&
      initialData &&
      (initialData.id || initialData._id || initialData.item_id)
        ? `inventory/${initialData.id || initialData._id || initialData.item_id}`
        : "/inventory",
    mode: mode,
    initialFormData: initialData
      ? {
          item_name: initialData.item_name || "",
          item_code: initialData.item_code || "",
          description: initialData.description || "",
          category: initialData.category || "",
          quantity: initialData.quantity || "",
          unit: initialData.unit || "",
          minimum_quantity: initialData.minimum_quantity || "",
          reorder_level: initialData.reorder_level || "",
          location: initialData.location || "",
          supplier_name: initialData.supplier_name || "",
          supplier_contact: initialData.supplier_contact || "",
          cost_price: initialData.cost_price || "",
          selling_price: initialData.selling_price || "",
        }
      : {
          item_name: "",
          item_code: "",
          description: "",
          category: "",
          quantity: "",
          unit: "",
          minimum_quantity: "",
          reorder_level: "",
          location: "",
          supplier_name: "",
          supplier_contact: "",
          cost_price: "",
          selling_price: "",
        },
    steps: [
      {
        id: 1,
        title: "Item Information",
        description: "Basic details of your inventory item",
        icon: Package,
        requiredFields: ["item_name", "item_code", "category"],
        fields: [
          {
            id: "item_name",
            type: "text",
            label: "Item Name *",
            placeholder: "e.g., Fiber Optic Splice Tray",
            grid: true,
          },
          {
            id: "item_code",
            type: "text",
            label: "Item Code *",
            placeholder: "e.g., FO-TRAY-12",
            grid: true,
          },
          {
            id: "description",
            type: "textarea",
            label: "Description",
            placeholder: "Brief description of the item...",
            icon: FileText,
            rows: 3,
          },
          {
            id: "category",
            type: "select-buttons",
            label: "Category *",
            options: [
              { value: "cables", label: "Cables", icon: Zap },
              { value: "tools", label: "Tools", icon: Package },
              { value: "connectors", label: "Connectors", icon: Layers },
              {
                value: "networking_equipment",
                label: "Network Equipment",
                icon: Building2,
              },
              { value: "accessories", label: "Accessories", icon: FileText },
            ],
          },
        ],
      },
      {
        id: 2,
        title: "Stock Details",
        description: "Quantity and stock management",
        icon: Hash,
        requiredFields: ["quantity", "unit", "minimum_quantity"],
        fields: [
          {
            id: "quantity",
            type: "number",
            label: "Current Quantity *",
            placeholder: "25",
            min: "0",
            grid: true,
          },
          {
            id: "unit",
            type: "text",
            label: "Unit *",
            placeholder: "pieces, meters, boxes",
            grid: true,
          },
          {
            id: "minimum_quantity",
            type: "number",
            label: "Minimum Quantity *",
            placeholder: "5",
            min: "0",
            icon: AlertTriangle,
            grid: true,
          },
          {
            id: "reorder_level",
            type: "number",
            label: "Reorder Level",
            placeholder: "10",
            min: "0",
            grid: true,
          },
          {
            id: "location",
            type: "text",
            label: "Storage Location",
            placeholder: "e.g., Warehouse C - Shelf 3",
            icon: MapPin,
          },
        ],
      },
      {
        id: 3,
        title: "Supplier & Pricing",
        description: "Supplier information and pricing",
        icon: Building2,
        fields: [
          {
            id: "supplier_name",
            type: "text",
            label: "Supplier Name",
            placeholder: "e.g., FiberGear SA",
            icon: Truck,
          },
          {
            id: "supplier_contact",
            type: "text",
            label: "Supplier Contact",
            placeholder: "e.g., +27123456789 or email@supplier.com",
          },
          {
            id: "cost_price",
            type: "number",
            label: "Cost Price (R)",
            placeholder: "150.00",
            step: "0.01",
            min: "0",
            icon: DollarSign,
            grid: true,
          },
          {
            id: "selling_price",
            type: "number",
            label: "Selling Price (R)",
            placeholder: "250.00",
            step: "0.01",
            min: "0",
            icon: DollarSign,
            grid: true,
          },
        ],
      },
    ],
  };

  return (
    <AddItemDialog
      key={`${mode}-${initialData?.id || initialData?._id || initialData?.item_id || "new"}`}
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={handleSuccess}
      onError={handleError}
      config={inventoryConfig}
      onBeforeSubmit={handleBeforeSubmit}
    />
  );
}
