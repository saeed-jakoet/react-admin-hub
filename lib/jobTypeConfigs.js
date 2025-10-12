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

  "floating-civils": {
    title: "Floating Civils (ADW)",
    shortName: "Civils",
    description: "Add a new floating civils job for this client",
    apiEndpoint: "/floating-civils",
    sections: [
      {
        title: "Client Information",
        icon: Building2,
        className:
          "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
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
        title: "Civils Details",
        icon: Waves,
        fields: [
          {
            name: "project_number",
            label: "Project Number",
            type: "text",
            icon: Hash,
            placeholder: "Project number",
          },
          {
            name: "location",
            label: "Location",
            type: "text",
            placeholder: "Project location",
          },
          {
            name: "work_type",
            label: "Work Type",
            type: "select",
            options: [
              { value: "", label: "Select Work Type" },
              { value: "excavation", label: "Excavation" },
              { value: "ducting", label: "Ducting" },
              { value: "restoration", label: "Restoration" },
              { value: "permitting", label: "Permitting" },
            ],
          },
          {
            name: "estimated_distance",
            label: "Estimated Distance (meters)",
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
            name: "project_manager",
            label: "Project Manager",
            type: "text",
            placeholder: "Project manager name",
          },
          {
            name: "contractor",
            label: "Contractor",
            type: "text",
            placeholder: "Contractor name",
          },
          {
            name: "supervisor",
            label: "Site Supervisor",
            type: "text",
            placeholder: "Supervisor name",
          },
        ],
      },
      {
        title: "Scheduling",
        icon: Calendar,
        fields: [
          {
            name: "start_date",
            label: "Start Date",
            type: "date",
          },
          {
            name: "estimated_completion",
            label: "Estimated Completion",
            type: "date",
          },
          {
            name: "permit_required_by",
            label: "Permit Required By",
            type: "date",
          },
        ],
      },
      {
        title: "Additional Information",
        icon: FileText,
        gridCols: "grid-cols-1",
        fields: [
          {
            name: "status",
            label: "Status",
            type: "select",
            defaultValue: "planning",
            options: [
              { value: "planning", label: "Planning" },
              { value: "permit_application", label: "Permit Application" },
              { value: "permit_approved", label: "Permit Approved" },
              { value: "work_in_progress", label: "Work in Progress" },
              { value: "completed", label: "Completed" },
              { value: "on_hold", label: "On Hold" },
            ],
          },
          {
            name: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Additional project notes",
          },
        ],
      },
    ],
  },

  "link-build": {
    title: "Link Build",
    shortName: "Link",
    description: "Add a new link build project for this client",
    apiEndpoint: "/link-build",
    sections: [
      {
        title: "Client Information",
        icon: Building2,
        className:
          "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700",
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
        title: "Link Details",
        icon: Link,
        fields: [
          {
            name: "link_id",
            label: "Link ID",
            type: "text",
            icon: Hash,
            placeholder: "Link identifier",
          },
          {
            name: "site_a",
            label: "Site A",
            type: "text",
            placeholder: "Source site",
          },
          {
            name: "site_b",
            label: "Site B",
            type: "text",
            placeholder: "Destination site",
          },
          {
            name: "link_type",
            label: "Link Type",
            type: "select",
            options: [
              { value: "", label: "Select Link Type" },
              { value: "fiber", label: "Fiber" },
              { value: "microwave", label: "Microwave" },
              { value: "copper", label: "Copper" },
            ],
          },
          {
            name: "capacity",
            label: "Capacity",
            type: "text",
            placeholder: "Link capacity",
          },
          {
            name: "distance_km",
            label: "Distance (km)",
            type: "number",
            placeholder: "Distance in kilometers",
          },
        ],
      },
      {
        title: "Technical Details",
        icon: Settings,
        fields: [
          {
            name: "equipment_required",
            label: "Equipment Required",
            type: "text",
            placeholder: "Required equipment",
          },
          {
            name: "bandwidth",
            label: "Bandwidth",
            type: "text",
            placeholder: "Required bandwidth",
          },
          {
            name: "redundancy",
            label: "Redundancy",
            type: "select",
            options: [
              { value: "", label: "Select Redundancy" },
              { value: "none", label: "None" },
              { value: "1+1", label: "1+1 Protected" },
              { value: "n+1", label: "N+1 Protected" },
            ],
          },
        ],
      },
      {
        title: "Scheduling",
        icon: Calendar,
        fields: [
          {
            name: "design_completion",
            label: "Design Completion",
            type: "date",
          },
          {
            name: "construction_start",
            label: "Construction Start",
            type: "date",
          },
          {
            name: "target_completion",
            label: "Target Completion",
            type: "date",
          },
        ],
      },
      {
        title: "Additional Information",
        icon: FileText,
        gridCols: "grid-cols-1",
        fields: [
          {
            name: "status",
            label: "Status",
            type: "select",
            defaultValue: "design",
            options: [
              { value: "design", label: "Design Phase" },
              { value: "procurement", label: "Procurement" },
              { value: "construction", label: "Construction" },
              { value: "testing", label: "Testing" },
              { value: "completed", label: "Completed" },
              { value: "on_hold", label: "On Hold" },
            ],
          },
          {
            name: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Additional project notes",
          },
        ],
      },
    ],
  },

  maintenance: {
    title: "Maintenance",
    shortName: "Maintenance",
    description: "Add a new maintenance job for this client",
    apiEndpoint: "/maintenance",
    sections: [
      {
        title: "Client Information",
        icon: Building2,
        className:
          "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700",
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
        title: "Maintenance Details",
        icon: Wrench,
        fields: [
          {
            name: "ticket_number",
            label: "Ticket Number",
            type: "text",
            icon: Hash,
            placeholder: "Maintenance ticket number",
          },
          {
            name: "equipment_type",
            label: "Equipment Type",
            type: "text",
            placeholder: "Type of equipment",
          },
          {
            name: "maintenance_type",
            label: "Maintenance Type",
            type: "select",
            options: [
              { value: "", label: "Select Maintenance Type" },
              { value: "preventive", label: "Preventive" },
              { value: "corrective", label: "Corrective" },
              { value: "emergency", label: "Emergency" },
              { value: "upgrade", label: "Upgrade" },
            ],
          },
          {
            name: "priority",
            label: "Priority",
            type: "select",
            options: [
              { value: "", label: "Select Priority" },
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" },
            ],
          },
          {
            name: "location",
            label: "Location",
            type: "text",
            placeholder: "Equipment location",
            gridCols: "md:col-span-2",
          },
        ],
      },
      {
        title: "Assignment",
        icon: Users,
        fields: [
          {
            name: "assigned_technician",
            label: "Assigned Technician",
            type: "text",
            placeholder: "Technician name",
          },
          {
            name: "supervisor",
            label: "Supervisor",
            type: "text",
            placeholder: "Supervisor name",
          },
          {
            name: "estimated_hours",
            label: "Estimated Hours",
            type: "number",
            placeholder: "Estimated work hours",
          },
        ],
      },
      {
        title: "Scheduling",
        icon: Calendar,
        fields: [
          {
            name: "scheduled_date",
            label: "Scheduled Date",
            type: "date",
          },
          {
            name: "scheduled_time",
            label: "Scheduled Time",
            type: "time",
          },
          {
            name: "completion_deadline",
            label: "Completion Deadline",
            type: "date",
          },
        ],
      },
      {
        title: "Additional Information",
        icon: FileText,
        gridCols: "grid-cols-1",
        fields: [
          {
            name: "status",
            label: "Status",
            type: "select",
            defaultValue: "scheduled",
            options: [
              { value: "scheduled", label: "Scheduled" },
              { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
              { value: "on_hold", label: "On Hold" },
            ],
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Detailed description of maintenance work",
          },
          {
            name: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Additional notes",
          },
        ],
      },
    ],
  },

  "access-build": {
    title: "Access Build",
    shortName: "Access",
    description: "Add a new access build project for this client",
    apiEndpoint: "/access-build",
    sections: [
      {
        title: "Client Information",
        icon: Building2,
        className:
          "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-700",
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
        title: "Access Details",
        icon: Cable,
        fields: [
          {
            name: "access_id",
            label: "Access ID",
            type: "text",
            icon: Hash,
            placeholder: "Access identifier",
          },
          {
            name: "access_type",
            label: "Access Type",
            type: "select",
            options: [
              { value: "", label: "Select Access Type" },
              { value: "last_mile", label: "Last Mile" },
              { value: "metro", label: "Metro Access" },
              { value: "long_haul", label: "Long Haul" },
            ],
          },
          {
            name: "service_level",
            label: "Service Level",
            type: "select",
            options: [
              { value: "", label: "Select Service Level" },
              { value: "basic", label: "Basic" },
              { value: "standard", label: "Standard" },
              { value: "premium", label: "Premium" },
              { value: "enterprise", label: "Enterprise" },
            ],
          },
          {
            name: "bandwidth_required",
            label: "Bandwidth Required",
            type: "text",
            placeholder: "Required bandwidth",
          },
          {
            name: "location",
            label: "Location",
            type: "text",
            placeholder: "Service location",
            gridCols: "md:col-span-2",
          },
        ],
      },
      {
        title: "Technical Requirements",
        icon: Settings,
        fields: [
          {
            name: "interface_type",
            label: "Interface Type",
            type: "text",
            placeholder: "Interface specification",
          },
          {
            name: "redundancy_required",
            label: "Redundancy Required",
            type: "select",
            options: [
              { value: "", label: "Select Redundancy" },
              { value: "none", label: "None" },
              { value: "dual_path", label: "Dual Path" },
              { value: "ring", label: "Ring Protection" },
            ],
          },
          {
            name: "sla_requirements",
            label: "SLA Requirements",
            type: "text",
            placeholder: "Service level agreement requirements",
          },
        ],
      },
      {
        title: "Scheduling",
        icon: Calendar,
        fields: [
          {
            name: "survey_date",
            label: "Survey Date",
            type: "date",
          },
          {
            name: "design_completion",
            label: "Design Completion",
            type: "date",
          },
          {
            name: "installation_date",
            label: "Installation Date",
            type: "date",
          },
        ],
      },
      {
        title: "Additional Information",
        icon: FileText,
        gridCols: "grid-cols-1",
        fields: [
          {
            name: "status",
            label: "Status",
            type: "select",
            defaultValue: "planning",
            options: [
              { value: "planning", label: "Planning" },
              { value: "survey", label: "Survey" },
              { value: "design", label: "Design" },
              { value: "construction", label: "Construction" },
              { value: "testing", label: "Testing" },
              { value: "completed", label: "Completed" },
            ],
          },
          {
            name: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Additional project notes",
          },
        ],
      },
    ],
  },

  "root-build": {
    title: "Root Build",
    shortName: "Root",
    description: "Add a new root build project for this client",
    apiEndpoint: "/root-build",
    sections: [
      {
        title: "Client Information",
        icon: Building2,
        className:
          "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700",
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
        title: "Root Build Details",
        icon: Activity,
        fields: [
          {
            name: "project_id",
            label: "Project ID",
            type: "text",
            icon: Hash,
            placeholder: "Project identifier",
          },
          {
            name: "network_tier",
            label: "Network Tier",
            type: "select",
            options: [
              { value: "", label: "Select Network Tier" },
              { value: "tier_1", label: "Tier 1" },
              { value: "tier_2", label: "Tier 2" },
              { value: "tier_3", label: "Tier 3" },
            ],
          },
          {
            name: "infrastructure_type",
            label: "Infrastructure Type",
            type: "select",
            options: [
              { value: "", label: "Select Infrastructure" },
              { value: "aerial", label: "Aerial" },
              { value: "underground", label: "Underground" },
              { value: "hybrid", label: "Hybrid" },
            ],
          },
          {
            name: "total_distance_km",
            label: "Total Distance (km)",
            type: "number",
            placeholder: "Total route distance",
          },
          {
            name: "route_description",
            label: "Route Description",
            type: "text",
            placeholder: "Route description",
            gridCols: "md:col-span-2",
          },
        ],
      },
      {
        title: "Project Management",
        icon: Users,
        fields: [
          {
            name: "project_manager",
            label: "Project Manager",
            type: "text",
            placeholder: "Project manager name",
          },
          {
            name: "design_engineer",
            label: "Design Engineer",
            type: "text",
            placeholder: "Design engineer name",
          },
          {
            name: "construction_manager",
            label: "Construction Manager",
            type: "text",
            placeholder: "Construction manager name",
          },
        ],
      },
      {
        title: "Milestones",
        icon: Calendar,
        fields: [
          {
            name: "design_start",
            label: "Design Start",
            type: "date",
          },
          {
            name: "permitting_completion",
            label: "Permitting Completion",
            type: "date",
          },
          {
            name: "construction_start",
            label: "Construction Start",
            type: "date",
          },
          {
            name: "target_completion",
            label: "Target Completion",
            type: "date",
          },
        ],
      },
      {
        title: "Additional Information",
        icon: FileText,
        gridCols: "grid-cols-1",
        fields: [
          {
            name: "status",
            label: "Status",
            type: "select",
            defaultValue: "planning",
            options: [
              { value: "planning", label: "Planning" },
              { value: "design", label: "Design" },
              { value: "permitting", label: "Permitting" },
              { value: "procurement", label: "Procurement" },
              { value: "construction", label: "Construction" },
              { value: "testing", label: "Testing" },
              { value: "completed", label: "Completed" },
            ],
          },
          {
            name: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Additional project notes",
          },
        ],
      },
    ],
  },

  relocations: {
    title: "Relocations",
    shortName: "Relocation",
    description: "Add a new relocation job for this client",
    apiEndpoint: "/relocations",
    sections: [
      {
        title: "Client Information",
        icon: Building2,
        className:
          "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700",
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
        title: "Relocation Details",
        icon: MapPin,
        fields: [
          {
            name: "relocation_id",
            label: "Relocation ID",
            type: "text",
            icon: Hash,
            placeholder: "Relocation identifier",
          },
          {
            name: "original_location",
            label: "Original Location",
            type: "text",
            placeholder: "Current location",
          },
          {
            name: "new_location",
            label: "New Location",
            type: "text",
            placeholder: "Target location",
          },
          {
            name: "reason",
            label: "Reason for Relocation",
            type: "select",
            options: [
              { value: "", label: "Select Reason" },
              { value: "road_works", label: "Road Works" },
              { value: "building_demolition", label: "Building Demolition" },
              { value: "upgrade", label: "Infrastructure Upgrade" },
              { value: "safety", label: "Safety Requirements" },
              { value: "customer_request", label: "Customer Request" },
            ],
          },
          {
            name: "equipment_to_relocate",
            label: "Equipment to Relocate",
            type: "text",
            placeholder: "List of equipment",
            gridCols: "md:col-span-2",
          },
        ],
      },
      {
        title: "Coordination",
        icon: Users,
        fields: [
          {
            name: "project_coordinator",
            label: "Project Coordinator",
            type: "text",
            placeholder: "Coordinator name",
          },
          {
            name: "field_technician",
            label: "Field Technician",
            type: "text",
            placeholder: "Technician name",
          },
          {
            name: "estimated_downtime_hours",
            label: "Estimated Downtime (hours)",
            type: "number",
            placeholder: "Expected downtime",
          },
        ],
      },
      {
        title: "Scheduling",
        icon: Calendar,
        fields: [
          {
            name: "survey_date",
            label: "Survey Date",
            type: "date",
          },
          {
            name: "planned_start",
            label: "Planned Start",
            type: "date",
          },
          {
            name: "planned_completion",
            label: "Planned Completion",
            type: "date",
          },
        ],
      },
      {
        title: "Additional Information",
        icon: FileText,
        gridCols: "grid-cols-1",
        fields: [
          {
            name: "status",
            label: "Status",
            type: "select",
            defaultValue: "planning",
            options: [
              { value: "planning", label: "Planning" },
              { value: "survey", label: "Survey" },
              { value: "approved", label: "Approved" },
              { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ],
          },
          {
            name: "special_requirements",
            label: "Special Requirements",
            type: "textarea",
            placeholder: "Any special requirements or considerations",
          },
          {
            name: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Additional notes",
          },
        ],
      },
    ],
  },
};

export default jobTypeConfigs;
