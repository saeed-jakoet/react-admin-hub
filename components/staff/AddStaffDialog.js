"use client";

import { AddItemDialog } from "@/components/shared/AddItemDialog";
// import { useToast } from "@/components/shared/Toast";
import {
  User,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  Upload,
  UserPlus,
  Calendar,
} from "lucide-react";

// Custom Rand icon for South African currency
const RandIcon = (props) => (
  <span {...props} style={{ fontWeight: 700, fontSize: '1.1em', fontFamily: 'monospace' }}>R</span>
);

export function AddStaffDialog({ open, onOpenChange, onSuccess, disabled }) {
  // Toast logic moved to staff page. Just call onSuccess/onError.
  const handleSuccess = () => {
    onSuccess?.();
  };

  const handleError = () => {};

  const staffConfig = {
    title: "Add Staff Member",
    entityName: "Staff Member",
    titleIcon: UserPlus,
    apiEndpoint: "/staff",
    initialFormData: {
      first_name: "",
      surname: "",
      email: "",
      phone_number: "",
      position: "",
      department: "",
      role: "technician",
      date_of_birth: "",
      address: "",
      hire_date: "",
      salary: "",
      employment_type: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      national_id: "",
      notes: "",
      document: null,
      document_type: "",
    },
    steps: [
      {
        id: 1,
        title: "Personal Details",
        description: "Basic staff information",
        icon: User,
        requiredFields: ["first_name", "surname", "email"],
        fields: [
          {
            id: "first_name",
            type: "text",
            label: "First Name *",
            placeholder: "Enter first name",
            grid: true,
          },
          {
            id: "surname",
            type: "text",
            label: "Surname *",
            placeholder: "Enter surname",
            grid: true,
          },
          {
            id: "email",
            type: "email",
            label: "Email Address *",
            placeholder: "Enter email address",
            icon: Mail,
          },
          {
            id: "phone_number",
            type: "text",
            label: "Phone Number",
            placeholder: "Enter phone number",
            icon: Phone,
          },
        ],
      },
      {
        id: 2,
        title: "Employment Details",
        description: "Position and department information",
        icon: Briefcase,
        fields: [
          {
            id: "position",
            type: "text",
            label: "Position",
            placeholder: "Enter job position",
            icon: Briefcase,
            grid: true,
          },
          {
            id: "department",
            type: "text",
            label: "Department",
            placeholder: "Enter department",
            icon: Briefcase,
            grid: true,
          },
          {
            id: "role",
            type: "select-buttons",
            label: "System Role",
            options: [
              { value: "technician", label: "technician", icon: User },
              { value: "manager", label: "Manager", icon: Shield },
              { value: "admin", label: "Admin", icon: Shield },
              { value: "super_admin", label: "Super Admin", icon: Shield },
            ],
          },
          {
            id: "employment_type",
            type: "text",
            label: "Employment Type",
            placeholder: "e.g., Full-time, Part-time, Contract",
            icon: FileText,
            grid: true,
          },
          {
            id: "hire_date",
            type: "date",
            label: "Hire Date",
            icon: Calendar,
            grid: true,
          },
          {
            id: "salary",
            type: "number",
            label: "Salary (R)",
            placeholder: "Enter salary amount",
            icon: RandIcon,
            step: "0.01",
          },
        ],
      },
      {
        id: 3,
        title: "Personal Information",
        description: "Additional details and contacts",
        icon: User,
        fields: [
          {
            id: "date_of_birth",
            type: "date",
            label: "Date of Birth",
            icon: Calendar,
            grid: true,
          },
          {
            id: "national_id",
            type: "text",
            label: "National ID",
            placeholder: "Enter national ID number",
            icon: FileText,
            grid: true,
          },
          {
            id: "address",
            type: "textarea",
            label: "Address",
            placeholder: "Enter full address",
            icon: MapPin,
            rows: 3,
          },
          {
            id: "emergency_contact_name",
            type: "text",
            label: "Emergency Contact Name",
            placeholder: "Enter emergency contact name",
            icon: User,
            grid: true,
          },
          {
            id: "emergency_contact_phone",
            type: "text",
            label: "Emergency Contact Phone",
            placeholder: "Enter emergency contact phone",
            icon: Phone,
            grid: true,
          },
        ],
      },
      {
        id: 4,
        title: "Documents & Notes",
        description: "Optional document upload and additional notes",
        icon: Upload,
        fields: [
          {
            id: "document",
            type: "file",
            label: "Staff Document (Optional)",
            icon: Upload,
            accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
            documentType: true,
          },
          {
            id: "notes",
            type: "textarea",
            label: "Additional Notes",
            placeholder: "Enter any additional notes about this staff member",
            icon: FileText,
            rows: 4,
          },
        ],
      },
    ],
  };

  return (
    <AddItemDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={handleSuccess}
      onError={handleError}
      config={staffConfig}
      disabled={disabled}
    />
  );
}
