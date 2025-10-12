"use client";

import * as React from "react";
import { AddItemDialog } from "@/components/shared/AddItemDialog";
import {
  Truck,
  User,
  MapPin,
  Calendar,
  AlertTriangle,
  Plus,
  Layers,
  Car,
  Wrench,
} from "lucide-react";

export function AddFleetDialog({ open, onOpenChange, onSuccess }) {
  const fleetConfig = {
    title: "Add Fleet Vehicle",
    entityName: "Vehicle",
    titleIcon: Plus,
    apiEndpoint: "/fleet",
    initialFormData: {
      vehicle_name: "",
      license_plate: "",
      type: "",
      status: "active",
      driver_name: "",
      location: "",
      last_service_date: "",
      next_service_date: "",
      notes: "",
    },
    steps: [
      {
        id: 1,
        title: "Vehicle Details",
        description: "Basic details of the fleet vehicle",
        icon: Truck,
        requiredFields: ["vehicle_name", "license_plate", "type"],
        fields: [
          {
            id: "vehicle_name",
            type: "text",
            label: "Vehicle Name *",
            placeholder: "e.g., Ford Transit",
            grid: true,
          },
          {
            id: "license_plate",
            type: "text",
            label: "License Plate *",
            placeholder: "e.g., ABC 1234",
            grid: true,
          },
          {
            id: "type",
            type: "select-buttons",
            label: "Type *",
            options: [
              { value: "van", label: "Van", icon: Truck },
              { value: "car", label: "Car", icon: Car },
              { value: "truck", label: "Truck", icon: Layers },
              { value: "other", label: "Other", icon: Wrench },
            ],
            grid: true,
          },
          {
            id: "status",
            type: "select-buttons",
            label: "Status",
            options: [
              { value: "active", label: "Active", icon: Truck },
              {
                value: "maintenance",
                label: "Maintenance",
                icon: AlertTriangle,
              },
              {
                value: "out_of_service",
                label: "Out of Service",
                icon: Wrench,
              },
            ],
            grid: true,
          },
        ],
      },
      {
        id: 2,
        title: "Assignment & Location",
        description: "Assign driver and location",
        icon: User,
        requiredFields: [],
        fields: [
          {
            id: "driver_name",
            type: "text",
            label: "Driver Name",
            placeholder: "e.g., John Doe",
            icon: User,
            grid: true,
          },
          {
            id: "location",
            type: "text",
            label: "Location",
            placeholder: "e.g., Depot A",
            icon: MapPin,
            grid: true,
          },
        ],
      },
      {
        id: 3,
        title: "Service & Notes",
        description: "Service dates and additional notes",
        icon: Calendar,
        fields: [
          {
            id: "last_service_date",
            type: "date",
            label: "Last Service Date",
            placeholder: "",
            icon: Calendar,
            grid: true,
          },
          {
            id: "next_service_date",
            type: "date",
            label: "Next Service Date",
            placeholder: "",
            icon: Calendar,
            grid: true,
          },
          {
            id: "notes",
            type: "textarea",
            label: "Notes",
            placeholder: "Any additional notes...",
            rows: 3,
            grid: false,
          },
        ],
      },
    ],
  };

  return (
    <AddItemDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      config={fleetConfig}
    />
  );
}
