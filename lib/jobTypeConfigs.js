import {
  Building2,
  Calendar,
  Clock,
  FileText,
  Hash,
  MapPin,
  Phone,
  Users,
  Wrench,
  Cable,
  Waves,
  Link,
  Settings,
  Activity,
} from "lucide-react";

// Job type configurations for different job types
export const jobTypeConfigs = {
  "drop-cable": {
    title: "Drop Cable Installation",
    shortName: "Installation",
    description: "Add a new drop cable installation job for this client",
    apiEndpoint: "/drop-cable",
    sections: [
      {
        title: "Client Information",
        icon: Building2,
        className:
          "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields: [
          {
            name: "client",
            label: "Client Name",
            type: "text",
            placeholder: "Client name",
          },
          {
            name: "client_contact_name",
            label: "Client Contact",
            type: "text",
            placeholder: "Contact person name",
          },
        ],
      },
      {
        title: "Job Details",
        icon: MapPin,
        fields: [
          {
            name: "circuit_number",
            label: "Circuit Number",
            type: "text",
            icon: Hash,
            placeholder: "Circuit number",
          },
          {
            name: "site_b_name",
            label: "Site B Name",
            type: "text",
            placeholder: "Site B name",
          },
          {
            name: "county",
            label: "County",
            type: "select",
            icon: MapPin,
            options: [
              { value: "", label: "Select County" },
              { value: "tablebay", label: "Tablebay" },
              { value: "falsebay", label: "Falsebay" },
            ],
          },
          {
            name: "physical_address_site_b",
            label: "Physical Address (Site B)",
            type: "text",
            placeholder: "Physical address",
            gridCols: "md:col-span-2",
          },
          {
            name: "dpc_distance_meters",
            label: "DPC Distance (meters)",
            type: "number",
            placeholder: "Distance in meters",
          },
        ],
      },
      {
        title: "Project Management",
        icon: Users,
        fields: [
          {
            name: "pm",
            label: "PM",
            type: "text",
            placeholder: "Project manager name",
          },
          {
            name: "service_provider",
            label: "Service Provider",
            type: "text",
            placeholder: "Service provider",
          },
          {
            name: "technician_name",
            label: "Technician",
            type: "text",
            placeholder: "Technician name",
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            defaultValue: "awaiting_client_confirmation_date",
            options: [
              {
                value: "awaiting_client_confirmation_date",
                label: "Awaiting Client Confirmation Date",
              },
              { value: "survey_required", label: "Survey Required" },
              { value: "survey_scheduled", label: "Survey Scheduled" },
              { value: "survey_completed", label: "Survey Completed" },
              { value: "lla_required", label: "LLA Required" },
              {
                value: "awaiting_lla_approval",
                label: "Awaiting LLA Approval",
              },
              { value: "lla_received", label: "LLA Received" },
              {
                value: "installation_scheduled",
                label: "Installation Scheduled",
              },
              {
                value: "installation_completed",
                label: "Installation Completed",
              },
              { value: "as_built_submitted", label: "As-Built Submitted" },
              { value: "issue_logged", label: "Issue Logged" },
              { value: "on_hold", label: "On Hold" },
              {
                value: "awaiting_health_and_safety",
                label: "Awaiting Health and Safety",
              },
              {
                value: "awaiting_service_provider",
                label: "Awaiting Service provider",
              },
              {
                value: "planning_document_submitted",
                label: "Planning Document Submitted",
              },
              {
                value: "adw_required",
                label: "ADW Required",
              },
              {
                value: "site_not_ready",
                label: "Site Not Ready",
              },
            ],
          },
          {
            name: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Additional notes or comments",
          },
        ],
      },
      {
        title: "End Client Contact Information",
        icon: Phone,
        fields: [
          {
            name: "end_client_contact_name",
            label: "Contact Name",
            type: "text",
            placeholder: "End client contact name",
          },
          {
            name: "end_client_contact_email",
            label: "Email",
            type: "email",
            placeholder: "Email address",
          },
          {
            name: "end_client_contact_phone",
            label: "Phone",
            type: "text",
            placeholder: "Phone number",
          },
        ],
      },
      {
        title: "Scheduling Information",
        icon: Calendar,
        fields: [
          {
            name: "survey_scheduled_date",
            label: "Scheduled Survey Date",
            type: "date",
          },
          {
            name: "survey_scheduled_time",
            label: "Scheduled Survey Time",
            type: "time",
          },
          {
            name: "survey_completed_at",
            label: "Survey Completed Date",
            type: "date",
          },
          {
            name: "installation_scheduled_date",
            label: "Installation Date",
            type: "date",
          },
          {
            name: "installation_scheduled_time",
            label: "Installation Time",
            type: "time",
          },
          {
            name: "installation_completed_date",
            label: "Installation Completed Date",
            type: "date",
          },
          {
            name: "lla_sent_at",
            label: "LLA sent at Date",
            type: "date",
          },
          {
            name: "lla_received_at",
            label: "LLA received at Date",
            type: "date",
          },
          {
            name: "as_built_submitted_at",
            label: "As-Built Submitted",
            type: "date",
          },
        ],
      },
    ],
  },

};

export default jobTypeConfigs;
