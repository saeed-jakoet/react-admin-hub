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
        gridCols: "grid-cols-1 md:grid-cols-3",
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
          {
            name: "quote_no",
            label: "Quote Number",
            type: "text",
            placeholder: "Quote number",
          },

        ],
      },
      {
        title: "Services",
        icon: Activity,
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
      {
        title: "Notes & Comments",
        icon: Activity,
        gridCols: "grid-cols-1",
        fields: [
          {
            name: "notes",
            type: "textarea",
            placeholder: "Additional notes, comments, or important information about this order...",
            gridCols: "col-span-1",
          },
        ],
      },
    ],
  },
  "link-build": {
    title: "Link Build",
    shortName: "Link Build Order",
    description: "Add a new link build job for this client",
    apiEndpoint: "/link-build",
    sections: [
      {
        title: "Client Information",
        icon: Building2,
        gridCols: "grid-cols-1 md:grid-cols-3",
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
        ],
      },
      {
        title: "Technical Details",
        icon: Activity,
        fields: [
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "", label: "Select Status" },
              { value: "not_started", label: "Not Started" },
              { value: "Work_in_progress", label: "Work in Progress" },
              { value: "completed", label: "Completed" },
              {
                value: "completed_asbuild_outstanding",
                label: "Completed Asbuild Outstanding",
              },
              { value: "cancelled", label: "Cancelled" },
              { value: "on_hold", label: "On Hold" },
              {
                value: "awaiting_health_and_safety",
                label: "Awaiting Health and Safety",
              },
              { value: "adw_required", label: "Adw Required" },
              { value: "special_access_required", label: "Special Access Required" }
            ],
          },
          {
            name: "quote_no",
            label: "Quote Number",
            type: "text",
            placeholder: "Quote number",
          },
          {
            name: "week",
            label: "Week",
            type: "text",
            placeholder: "e.g., 2024-W45",
          },
          {
            name: "technician",
            label: "Technician",
            type: "text",
            placeholder: "Technician name",
          },
          {
            name: "technician_id",
            label: "Technician ID",
            type: "hidden",
          },
          {
            name: "no_of_fiber_pairs",
            label: "Number of Fiber Pairs",
            type: "number",
            placeholder: "Number of fiber pairs",
          },
          {
            name: "link_distance",
            label: "Link Distance",
            type: "number",
            placeholder: "Distance in km",
          },
          {
            name: "no_of_splices_after_15km",
            label: "Number of Splices After 15km",
            type: "number",
            placeholder: "Number of splices",
          },
          {
          name: "service_type",
          label: "Service Type",
          type: "select",
          options: [
            { value: "", label: "Select Service Type" },
            { value: "splice", label: "Full Splice (R7,740)" },
            { value: "splice_and_float", label: "Full Splice + Float (R9,804)" },
            { value: "splice_broadband", label: "Full Splice Broadband (R3,250)" },
            { value: "access_float", label: "Access Float (R2,064)" },
            { value: "link_build_discount_15", label: "Link Build -15% (R6,579)" },
            { value: "link_build_broadband_discount_15", label: "Link Build Broadband -15% (R2,762.50)" },
            { value: "link_build_float_discount_15", label: "Link Build + Float -15% (R8,333.40)" },
          ],
        },
        {
          name: "splice_and_float",
          label: "Splice and Float (Legacy)",
          type: "select",
          options: [
            { value: "", label: "Select Option" },
            { value: "splice", label: "Splice" },
            { value: "splice_and_float", label: "Splice & Float" },
          ],
        },
        ],
      },
      {
        title: "Scheduling Information",
        icon: Calendar,
        fields: [
          {
            name: "atp_pack_submitted",
            label: "ATP Pack Submitted Date",
            type: "date",
          },
          {
            name: "check_date",
            label: "Check Date",
            type: "date",
          },
          {
            name: "submission_date",
            label: "Submission Date",
            type: "date",
          },
          {
            name: "atp_pack_loaded",
            label: "ATP Pack Loaded Date",
            type: "date",
          },
          {
            name: "atp_date",
            label: "ATP Date",
            type: "date",
          },
        ],
      },
      {
        title: "Additional Information",
        icon: Activity,
        gridCols: "grid-cols-1",
        fields: [
          {
            name: "notes",
            type: "textarea",
            placeholder: "Additional notes or important information about this link build...",
            gridCols: "col-span-1",
          },
        ],
      },
    ],
  },
};

export default jobTypeConfigs;
