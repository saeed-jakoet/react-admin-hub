"use client";

import * as React from "react";
import { FormDialog } from "@/components/shared/FormDialog";
import { post } from "@/lib/api/fetcher";

const inventoryFields = [
  {
    name: "item_name",
    label: "Item Name",
    type: "text",
    placeholder: "e.g., Fiber Optic Splice Tray",
    required: true,
  },
  {
    name: "item_code",
    label: "Item Code",
    type: "text",
    placeholder: "e.g., FO-TRAY-12",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Brief description of the item",
    required: false,
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    options: [
      { value: "cables", label: "Cables" },
      { value: "tools", label: "Tools" },
      { value: "routers", label: "Routers" },
      { value: "equipment", label: "Equipment" },
      { value: "hardware", label: "Hardware" },
      { value: "accessories", label: "Accessories" },
    ],
  },
  {
    name: "quantity",
    label: "Quantity",
    type: "number",
    placeholder: "25",
    required: true,
    min: 0,
  },
  {
    name: "unit",
    label: "Unit",
    type: "text",
    placeholder: "e.g., pieces, meters, boxes",
    required: true,
  },
  {
    name: "minimum_quantity",
    label: "Minimum Quantity",
    type: "number",
    placeholder: "5",
    required: true,
    min: 0,
    hint: "Alert when stock falls below this level",
  },
  {
    name: "reorder_level",
    label: "Reorder Level",
    type: "number",
    placeholder: "10",
    required: false,
    min: 0,
    hint: "Quantity at which to reorder stock",
  },
  {
    name: "location",
    label: "Location",
    type: "text",
    placeholder: "e.g., Warehouse C - Shelf 3",
    required: false,
  },
  {
    name: "supplier_name",
    label: "Supplier Name",
    type: "text",
    placeholder: "e.g., FiberGear SA",
    required: false,
  },
  {
    name: "supplier_contact",
    label: "Supplier Contact",
    type: "text",
    placeholder: "e.g., +27123456705",
    required: false,
  },
  {
    name: "cost_price",
    label: "Cost Price",
    type: "number",
    placeholder: "150.00",
    required: false,
    step: "0.01",
    min: 0,
  },
  {
    name: "selling_price",
    label: "Selling Price",
    type: "number",
    placeholder: "250.00",
    required: false,
    step: "0.01",
    min: 0,
  },
];

export function AddInventoryDialog({ open, onOpenChange, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      // Convert numeric fields
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        minimum_quantity: parseInt(formData.minimum_quantity, 10),
        reorder_level: formData.reorder_level
          ? parseInt(formData.reorder_level, 10)
          : undefined,
        cost_price: formData.cost_price
          ? parseFloat(formData.cost_price)
          : undefined,
        selling_price: formData.selling_price
          ? parseFloat(formData.selling_price)
          : undefined,
      };

      await post("/inventory", payload);

      // Success - close dialog and refresh
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding inventory item:", error);
      alert("Failed to add inventory item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Inventory Item"
      description="Add a new item to your inventory. Fill in all required fields."
      fields={inventoryFields}
      onSubmit={handleSubmit}
      submitLabel="Add Item"
      isSubmitting={isSubmitting}
    />
  );
}
