import {
  Building2,
  Calendar,
  Hash,
  MapPin,
  Phone,
  Users,
  Activity,
} from "lucide-react";

// Job type configurations for different job types
export const jobTypeConfigs = {
  "drop-cable": {
    title: "Drop Cable Installation",
    shortName: "Order",
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
          {
            name: "pm",
            label: "PM",
            type: "text",
            placeholder: "Project manager name",
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
            name: "link_manager",
            label: "Link Manager",
            type: "text",
            placeholder: "Link manager name",
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
                label: "Awaiting Confirmation Date",
              },
              { value: "survey_scheduled", label: "Survey Scheduled" },
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
              {
                value: "installation_complete_as_built_outstanding",
                label: "Installation Complete - As-Built Outstanding",
              },
              // { value: "as_built_submitted", label: "As-Built Submitted" },
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
              {
                value: "to_be_cancelled",
                label: "To Be Cancelled",
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
            label: "Scheduled Installation Date",
            type: "date",
          },
          {
            name: "installation_scheduled_time",
            label: "Scheduled Installation Time",
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
      {
        title: "Services",
        icon: Activity,
        className:
          "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700",
        gridCols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        fields: [
          {
            name: "survey_planning",
            label: "Survey Planning",
            type: "checkbox",
            defaultValue: false,
          },
          {
            name: "callout",
            label: "Callout",
            type: "checkbox",
            defaultValue: false,
          },
          {
            name: "installation",
            label: "Installation",
            type: "checkbox",
            defaultValue: false,
          },
          {
            name: "spon_budi_opti",
            label: "SPON Budi Opti",
            type: "checkbox",
            defaultValue: false,
          },
          {
            name: "splitter_install",
            label: "Splitter Install",
            type: "checkbox",
            defaultValue: false,
          },
          {
            name: "mousepad_install",
            label: "Mousepad Install",
            type: "checkbox",
            defaultValue: false,
          },
        ],
      },
      {
        title: "Additional Charges",
        icon: Activity,
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields: [
          {
            name: "additonal_cost",
            label: "Additional Cost (optional)",
            type: "number",
            placeholder: "0.00",
          },
          {
            name: "additonal_cost_reason",
            label: "Reason for Additional Cost",
            type: "text",
            placeholder: "Brief reason (e.g., Cherry Picker Used)",
          },
        ],
      },
    ],
  },
};

export default jobTypeConfigs;
