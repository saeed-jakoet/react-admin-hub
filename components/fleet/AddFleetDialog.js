"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api/fetcher";
import { AddItemDialog } from "@/components/shared/AddItemDialog";
import { Truck, User, Plus, Edit, Layers, Car, Wrench } from "lucide-react";

export function AddFleetDialog({
  open,
  onOpenChange,
  onSuccess,
  mode = "add",
  initialData = null,
}) {
  const [staffOptions, setStaffOptions] = useState([]);
  useEffect(() => {
    if (open) {
      get("/staff")
        .then((data) => {
          console.log("/staff response", data);
          if (Array.isArray(data.data)) {
            const options = data.data.map((s) => ({
              value: s.id,
              label: `${s.first_name} ${s.surname}`,
            }));
            console.log("Mapped staff options", options);
            setStaffOptions(options);
          } else {
            setStaffOptions([]);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch staff", err);
          setStaffOptions([]);
        });
    }
  }, [open]);

  // For editing, map technician name to ID
  const getInitialTechnicianId = () => {
    if (mode === "edit" && initialData?.technician && staffOptions.length > 0) {
      const matchingOption = staffOptions.find(
        (opt) => opt.label === initialData.technician
      );
      return matchingOption
        ? matchingOption.value
        : initialData.technician_id || "";
    }
    return initialData?.technician_id || "";
  };

  // Custom data transformation for fleet technician field
  const handleBeforeSubmit = (data) => {
    const transformedData = { ...data };

    if (transformedData.technician) {
      const selectedOption = staffOptions.find(
        (opt) => opt.value === transformedData.technician
      );
      if (selectedOption) {
        transformedData.technician = selectedOption.label; // Set to name
        transformedData.technician_id = data.technician; // Keep original ID
      }
    }

    return transformedData;
  };

  const fleetConfig = {
    title: mode === "edit" ? "Edit Fleet Vehicle" : "Add Fleet Vehicle",
    entityName: "Vehicle",
    titleIcon: mode === "edit" ? Edit : Plus,
    apiEndpoint:
      mode === "edit" &&
      initialData &&
      (initialData.id || initialData._id || initialData.vehicle_id)
        ? `fleet/${initialData.id || initialData._id || initialData.vehicle_id}`
        : "/fleet",
    mode: mode,
    initialFormData: initialData
      ? {
          registration: initialData.registration || "",
          make: initialData.make || "",
          model: initialData.model || "",
          vin: initialData.vin || "",
          vehicle_type: initialData.vehicle_type || "",
          technician: getInitialTechnicianId(),
          technician_id: initialData.technician_id || "",
        }
      : {
          registration: "",
          make: "",
          model: "",
          vin: "",
          vehicle_type: "",
          technician: "",
          technician_id: "",
        },
    steps: [
      {
        id: 1,
        title: "Vehicle Details",
        description: "Basic details of the fleet vehicle",
        icon: Truck,
        requiredFields: ["registration", "make", "model"],
        fields: [
          {
            id: "registration",
            type: "text",
            label: "Registration (License Plate) *",
            placeholder: "e.g., ABC 1234",
            grid: true,
          },
          {
            id: "make",
            type: "text",
            label: "Make *",
            placeholder: "e.g., Toyota",
            grid: true,
          },
          {
            id: "model",
            type: "text",
            label: "Model *",
            placeholder: "e.g., 2020",
            grid: true,
          },
          {
            id: "vin",
            type: "text",
            label: "VIN",
            placeholder: "Vehicle Identification Number",
            grid: true,
          },
        ],
      },
      {
        id: 2,
        title: "Type & Technician",
        description: "Vehicle type and technician assignment",
        icon: User,
        requiredFields: [],
        fields: [
          {
            id: "vehicle_type",
            type: "select-buttons",
            label: "Vehicle Type",
            options: [
              { value: "car", label: "Car", icon: Car },
              { value: "truck", label: "Truck", icon: Truck },
              { value: "van", label: "Van", icon: Layers },
              { value: "other", label: "Other", icon: Wrench },
            ],
            grid: true,
          },
          {
            id: "technician",
            type: "dropdown",
            label: "Assign Technician",
            options: staffOptions,
            placeholder:
              staffOptions.length === 0
                ? "No staff found"
                : "Select technician...",
            icon: User,
            grid: true,
          },
        ],
      },
    ],
  };

  // Force re-render of AddItemDialog when staffOptions, initialData, or mode updates
  return (
    <AddItemDialog
      key={`${staffOptions.length}-${mode}-${initialData?.id || initialData?._id || initialData?.vehicle_id || "new"}`}
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      config={fleetConfig}
      onBeforeSubmit={handleBeforeSubmit}
    />
  );
}
