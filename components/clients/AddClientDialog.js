"use client";

import * as React from "react";
import { AddItemDialog } from "@/components/shared/AddItemDialog";
import { 
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  UserPlus
} from "lucide-react";

export function AddClientDialog({ open, onOpenChange, onSuccess }) {
  const clientConfig = {
    title: "Add New Client",
    entityName: "Client",
    titleIcon: UserPlus,
    apiEndpoint: "/client",
    initialFormData: { 
      first_name: "", 
      last_name: "", 
      email: "", 
      phone_number: "", 
      company_name: "", 
      address: "", 
      notes: "", 
      is_active: true 
    },
    steps: [
      {
        id: 1,
        title: "Personal Details",
        description: "Basic client information",
        icon: User,
        requiredFields: ["first_name", "last_name", "email"],
        fields: [
          {
            id: "first_name",
            type: "text",
            label: "First Name *",
            placeholder: "Enter first name",
            grid: true
          },
          {
            id: "last_name",
            type: "text",
            label: "Last Name *",
            placeholder: "Enter last name",
            grid: true
          },
          {
            id: "email",
            type: "email",
            label: "Email Address *",
            placeholder: "Enter email address",
            icon: Mail
          },
          {
            id: "phone_number",
            type: "text",
            label: "Phone Number",
            placeholder: "Enter phone number",
            icon: Phone
          }
        ]
      },
      {
        id: 2,
        title: "Company & Location",
        description: "Business and address details",
        icon: Building2,
        fields: [
          {
            id: "company_name",
            type: "text",
            label: "Company Name",
            placeholder: "Enter company name",
            icon: Building2
          },
          {
            id: "address",
            type: "textarea",
            label: "Address",
            placeholder: "Enter full address",
            icon: MapPin,
            rows: 3
          }
        ]
      },
      {
        id: 3,
        title: "Additional Info",
        description: "Notes and preferences",
        icon: FileText,
        fields: [
          {
            id: "notes",
            type: "textarea",
            label: "Notes",
            placeholder: "Enter any additional notes about this client",
            icon: FileText,
            rows: 4
          },
          {
            id: "is_active",
            type: "checkbox",
            label: "Active Client"
          }
        ]
      }
    ]
  };

  return (
    <AddItemDialog 
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      config={clientConfig}
    />
  );
}