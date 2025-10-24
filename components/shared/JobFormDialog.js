"use client";

import {useEffect, useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Save, RefreshCw, Plus, AlertCircle, UserCircle, LogIn } from "lucide-react";
import { post, put, get } from "@/lib/api/fetcher";
import { getDropCableStatusColor } from "@/lib/utils/dropCableColors";
import { useToast } from "@/components/shared/Toast";

/**
 * JobFormDialog
 * Universal form dialog for creating and editing jobs
 * Props:
 * - mode: "create" | "edit"
 * - open: boolean
 * - onOpenChange: (open: boolean) => void
 * - jobData?: object - existing job data (for edit mode)
 * - jobConfig: object - config from jobTypeConfigs
 * - clientId?: string - client ID (for create mode)
 * - clientName?: string - client name (for create mode)
 * - onSuccess: (jobData: object) => void
 * - onError?: (error: string) => void
 * - saving?: boolean
 */
export default function JobFormDialog({
  mode = "create",
  open,
  onOpenChange,
  jobData = {},
  jobConfig,
  clientId,
  clientName,
  onSuccess,
  onError,
  saving: externalSaving = false,
}) {
  const { success, error: toastError } = useToast();
  // Initialize form data based on mode
  const getInitialData = () => {
    if (mode === "edit") {
      // Prefer clients.company_name, fallback to client, fallback to clientName prop
      let companyName =
        jobData?.clients?.company_name || jobData?.client || clientName || "";

      return { ...jobData, client: companyName };
    }

    // Create mode - initialize with defaults
    const initialData = { client: clientName || "" };
    jobConfig?.sections?.forEach((section) => {
      section.fields?.forEach((field) => {
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        } else if (field.type === "checkbox") {
          initialData[field.name] = false;
        } else {
          initialData[field.name] = "";
        }
      });
    });
    return initialData;
  };

  const [formData, setFormData] = useState(getInitialData);
  const [internalSaving, setInternalSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // Install completion percent override (0-100)
  const [installPercentEnabled, setInstallPercentEnabled] = useState(
    Boolean(jobData?.install_completion_percent)
  );
  // New note input (used in edit mode to append without overwriting)
  const [newNote, setNewNote] = useState("");
  // Add week state
  const [week, setWeek] = useState(jobData?.week || "");
  
  // Technician state
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(jobData?.technician_id || "");

  // Link Manager state
  const [linkManagers, setLinkManagers] = useState([]);
  const [loadingLinkManagers, setLoadingLinkManagers] = useState(false);
  const [selectedLinkManagerId, setSelectedLinkManagerId] = useState(jobData?.link_manager_id || "");

  const saving = externalSaving || internalSaving;

  // Fetch staff from /staff (for both technicians and link managers)
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoadingTechnicians(true);
        setLoadingLinkManagers(true);
        const response = await get("/staff");
        if (response?.status === "success" && Array.isArray(response.data)) {
          // Filter for technicians
          const technicianList = response.data.filter(
            (staff) => staff.role?.toLowerCase() === "technician"
          );
          setTechnicians(technicianList);
          
          // Filter for link managers: only Operations Manager or General Manager positions
          const linkManagerList = response.data.filter((staff) => {
            const position = (staff.position || "").toLowerCase();
            return position.includes("operations manager") || position.includes("general manager");
          });
          setLinkManagers(linkManagerList);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
        toastError("Error", "Failed to load staff");
      } finally {
        setLoadingTechnicians(false);
        setLoadingLinkManagers(false);
      }
    };

    if (open) {
      fetchStaff();
    }
  }, [open, toastError]);

  // Update form data when jobData changes (edit mode)
  useEffect(() => {
    if (mode === "edit" && jobData) {
      setFormData({ ...jobData });
      setNewNote("");
      setSelectedTechnicianId(jobData?.technician_id || "");
      setSelectedLinkManagerId(jobData?.link_manager_id || "");
      setWeek(jobData?.week || "");
    }
  }, [jobData, mode]);

  // Update client name when prop changes (create mode)
  useEffect(() => {
    if (mode === "create" && clientName && clientName !== formData.client) {
      setFormData((prev) => ({
        ...prev,
        client: clientName,
      }));
    }
  }, [clientName, mode, formData.client]);

  const handleInputChange = (field, value) => {
    if (errorMsg) setErrorMsg("");
    // Sanitize additional cost fields
    if (field === "additonal_cost") {
      // Keep digits and a single dot, strip whitespace
      const cleaned = String(value)
        .replace(/\s+/g, "")
        .replace(/[^0-9.]/g, "")
        .replace(/(\..*)\./g, "$1");
      value = cleaned;
    }
    // Do not collapse or trim whitespace for additonal_cost_reason
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Keep local flag in sync if editing an existing job with a value
  useEffect(() => {
    if (mode === "edit" && jobData) {
      setInstallPercentEnabled(Boolean(jobData.install_completion_percent));
    }
  }, [mode, jobData]);

  // Ensure installation is enabled if user enables the completion % override
  useEffect(() => {
    if (installPercentEnabled && !Boolean(formData.installation)) {
      setFormData((prev) => ({ ...prev, installation: true }));
    }
  }, [installPercentEnabled, formData.installation]);

  // If user unchecks Installation, disable the completion % override to avoid confusion
  useEffect(() => {
    if (!Boolean(formData.installation) && installPercentEnabled) {
      setInstallPercentEnabled(false);
    }
  }, [formData.installation, installPercentEnabled]);

  const handleTechnicianChange = (technicianId) => {
    setSelectedTechnicianId(technicianId);
    
    // Find the selected technician and update the technician field (name)
    const selectedTech = technicians.find((t) => t.id === technicianId);
    if (selectedTech) {
      const technicianName = `${selectedTech.first_name || ""} ${selectedTech.surname || ""}`.trim();
      // Update both possible field names
      handleInputChange("technician", technicianName);
      handleInputChange("technician_name", technicianName);
    } else {
      handleInputChange("technician", "");
      handleInputChange("technician_name", "");
    }
  };

  const handleLinkManagerChange = (linkManagerId) => {
    setSelectedLinkManagerId(linkManagerId);
    
    // Find the selected link manager and update the link_manager field (name)
    const selectedLM = linkManagers.find((lm) => lm.id === linkManagerId);
    if (selectedLM) {
      const linkManagerName = `${selectedLM.first_name || ""} ${selectedLM.surname || ""}`.trim();
      handleInputChange("link_manager", linkManagerName);
    } else {
      handleInputChange("link_manager", "");
    }
  };

  const validateForm = () => {
    // Get required fields based on job type
    const requiredFields =
      jobConfig?.apiEndpoint === "/drop-cable"
        ? ["circuit_number", "site_b_name"]
        : [];

    const missing = requiredFields.filter(
      (f) => !formData[f] || String(formData[f]).trim() === "",
    );

    if (missing.length) {
      const fieldLabels = missing.map(
        (f) =>
          jobConfig?.sections
            ?.flatMap((s) => s.fields)
            ?.find((x) => x.name === f)?.label || f,
      );
      return `Please fill all required fields: ${fieldLabels.join(", ")}`;
    }

    // Validate email fields
    const emailFields =
      jobConfig?.sections
        ?.flatMap((s) => s.fields)
        ?.filter((f) => f.type === "email")
        ?.map((f) => f.name) || [];

    // More permissive email regex to allow all valid TLDs and subdomains
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    for (const name of emailFields) {
      const rawVal = formData[name];
      const val =
        typeof rawVal === "string"
          ? rawVal.trim()
          : String(rawVal || "").trim();
      if (val && !emailRegex.test(val)) {
        const label =
          jobConfig?.sections
            ?.flatMap((s) => s.fields)
            ?.find((x) => x.name === name)?.label || name;
        return `${label} must be a valid email address.`;
      }
    }

    return null;
  };

  const preparePayload = () => {
    // Only include fields defined in the config
    let allowedFields =
      jobConfig?.sections?.flatMap((s) => s.fields?.map((f) => f.name)) || [];

    // In edit mode, we don't want to accidentally replace the notes array;
    // we append via separate newNote field. So exclude 'notes' from auto payload in edit mode.
    if (mode === "edit") {
      allowedFields = allowedFields.filter((n) => n !== "notes");
    }

    const payload = {};

    if (mode === "edit" && jobData?.id) {
      payload.id = jobData.id;
    }

    // Include client_id (create mode) if available
    let resolvedClientId = clientId;
    if (mode === "create") {
      if (!resolvedClientId && typeof window !== "undefined") {
        const match = window.location.pathname.match(/\/clients\/([^/]+)/);
        if (match && match[1]) resolvedClientId = match[1];
      }
      if (resolvedClientId) payload.client_id = resolvedClientId;
    } else if (formData.client_id) {
      // Keep client_id on edit only if present
      payload.client_id = formData.client_id;
    }

    // Build payload from allowed fields only
    for (const name of allowedFields) {
      const fieldConfig = jobConfig.sections
        .flatMap((s) => s.fields)
        .find((f) => f.name === name);

      let value = formData[name];

      // For checkboxes (boolean), always include explicit true/false.
      if (fieldConfig?.type === "checkbox") {
        payload[name] = Boolean(value);
        continue;
      }

      // For other types, if cleared to empty string/undefined/null, send null to explicitly clear on backend (in edit mode)
      if (value === "" || typeof value === "undefined" || value === null) {
        // Only send null in edit mode to avoid failing create requireds; create validation handles requireds separately
        if (mode === "edit") {
          payload[name] = null;
        }
        continue;
      }

      // Special: transform end_client_contact_phone to +27 format
      if (name === "end_client_contact_phone") {
        // Remove all non-digit characters
        let digits = String(value).replace(/\D/g, "");
        // If starts with 0 and is 10 digits, replace with +27
        if (digits.length === 10 && digits.startsWith("0")) {
          value = "+27" + digits.slice(1);
        } else if (digits.length === 9 && !digits.startsWith("0")) {
          // If 9 digits and doesn't start with 0, assume missing 0, add +27
          value = "+27" + digits;
        } else if (!String(value).startsWith("+27")) {
          // If not already +27, just prefix +27
          value = "+27" + digits.replace(/^0+/, "");
        }
      }

      // Coerce by type
      if (fieldConfig?.type === "number") {
        const n = name === "additonal_cost" ? parseFloat(value) : parseInt(value);
        if (!Number.isNaN(n)) value = n;
        else if (mode === "edit") { payload[name] = null; continue; }
        else { continue; }
      }

      if (fieldConfig?.type === "date") {
        // Keep simple YYYY-MM-DD, strip timezone/space if present
        if (typeof value === "string") {
          value = value.includes("T")
            ? value.split("T")[0]
            : value.includes(" ")
              ? value.split(" ")[0]
              : value;
        }
      }

      if (fieldConfig?.type === "time") {
        // Keep simple HH:MM (strip seconds if present)
        if (
          typeof value === "string" &&
          value.length === 8 &&
          value[2] === ":" &&
          value[5] === ":"
        ) {
          value = value.slice(0, 5);
        }
      }

      // Normalize email: trim and remove zero-width chars
      if (fieldConfig?.type === "email" && typeof value === "string") {
        value = value.trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
      }

      payload[name] = value;
    }

  // When submitting, include week in the payload; allow clearing to null in edit mode
  if (week) payload.week = week;
  else if (mode === "edit") payload.week = null;

    // Include install completion percent if enabled; coerce 0-100
    if (installPercentEnabled) {
      const raw = Number(formData.install_completion_percent);
      if (!Number.isNaN(raw)) {
        payload.install_completion_percent = Math.max(0, Math.min(100, raw));
      }
    } else {
      // Explicitly clear if user disabled it in edit mode
      if (mode === "edit") payload.install_completion_percent = null;
    }

    // Include technician_id if selected or explicitly clear when unselected in edit mode
    if (selectedTechnicianId) {
      payload.technician_id = selectedTechnicianId;
    } else if (mode === "edit") {
      payload.technician_id = null;
    }

    return payload;
  };

  const handleSubmit = async () => {
    try {
      // Validation
      const validationError = validateForm();
      if (validationError) {
        setErrorMsg(validationError);
        // Do not block further edits/submission; just show error
        return;
      }

      if (mode === "create" && !clientId && typeof window !== "undefined") {
        const match = window.location.pathname.match(/\/clients\/([^/]+)/);
        if (!match) {
          setErrorMsg("Missing client ID. Please navigate from a client page.");
          return;
        }
      }

      setInternalSaving(true);
      const payload = preparePayload();

      // Notes handling
      if (mode === "edit") {
        // Append behavior: send string to let backend append a timestamped note
        if (newNote && newNote.trim().length > 0) {
          payload.notes = newNote.trim();
        }
      } else {
        // Create: if notes happens to be an array (unlikely), reduce to a string;
        // otherwise keep as text - backend will wrap with timestamp
        if (Array.isArray(payload.notes)) {
          const combined = payload.notes
            .map((n) => (typeof n === "string" ? n : n?.text))
            .filter(Boolean)
            .join("\n");
          payload.notes = combined || undefined;
        }
      }

      let result;
      if (mode === "create") {
        result = await post(jobConfig.apiEndpoint, payload);
      } else {
        result = await put(jobConfig.apiEndpoint, payload);
      }

      // Notify parent of success (toast will be shown in parent component)
      onSuccess?.(result.data || payload);

      // Close dialog and reset after success
      handleCancel();
    } catch (error) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} job:`,
        error,
      );
      const msg =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        `An unexpected error occurred while ${
          mode === "create" ? "creating" : "updating"
        } the job.`;
      setErrorMsg(msg);
      // Show error toast
      toastError(
        "Error",
        mode === "create"
          ? `Failed to create ${jobConfig.shortName || "Order"}. Please try again.`
          : `Failed to update ${jobConfig.shortName || "Order"}. Please try again.`
      );
      // Keep dialog open to allow user to fix and resubmit
      onError?.(msg);
    } finally {
      setInternalSaving(false);
    }
  };

  const handleCancel = () => {
    setErrorMsg("");
    setFormData(getInitialData());
    onOpenChange(false);
  };

  const renderField = (field) => {
    const fieldId = `${mode}_${field.name}`;
    const LabelIcon = field.icon;
    const value = formData[field.name] || "";
    const isRequired =
      mode === "create" &&
      jobConfig?.apiEndpoint === "/drop-cable" &&
      ["circuit_number", "site_b_name"].includes(field.name);

    const renderInput = () => {
      const baseClasses = "w-full mt-2 transition-colors duration-200";
      const focusClasses =
        "focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

      // Special handling for technician field
      if (field.name === "technician_name" || field.name === "technician") {
        return (
          <div className="space-y-2">
            {loadingTechnicians ? (
              <div className="flex items-center gap-2 p-3 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading technicians...
              </div>
            ) : (
              <select
                id={fieldId}
                value={selectedTechnicianId}
                onChange={(e) => handleTechnicianChange(e.target.value)}
                className={`${baseClasses} p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 ${focusClasses}`}
              >
                <option value="">Select a technician</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.first_name} {tech.surname}
                  </option>
                ))}
              </select>
            )}
            {selectedTechnicianId && (formData.technician || formData.technician_name) && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Assigned: {formData.technician || formData.technician_name}
              </p>
            )}
          </div>
        );
      }

      // Special handling for link_manager field
      if (field.name === "link_manager") {
        return (
          <div className="space-y-2">
            {loadingLinkManagers ? (
              <div className="flex items-center gap-2 p-3 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading staff...
              </div>
            ) : (
              <select
                id={fieldId}
                value={selectedLinkManagerId}
                onChange={(e) => handleLinkManagerChange(e.target.value)}
                className={`${baseClasses} p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 ${focusClasses}`}
              >
                <option value="">Select a link manager</option>
                {linkManagers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.first_name} {staff.surname}
                  </option>
                ))}
              </select>
            )}
            {selectedLinkManagerId && formData.link_manager && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Assigned: {formData.link_manager}
              </p>
            )}
          </div>
        );
      }

      switch (field.type) {
        case "checkbox":
          return (
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
              <input
                id={fieldId}
                type="checkbox"
                checked={Boolean(formData[field.name])}
                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                {field.checkboxLabel || field.label}
              </span>
            </label>
          );
        case "select":
          return (
            <select
              id={fieldId}
              value={value}
              onChange={(e) =>
                handleInputChange(field.name, e.target.value || null)
              }
              className={`${baseClasses} p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 ${focusClasses}`}
            >
              {(field.options || []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case "textarea":
          // Custom handling: if this is the 'notes' field, we render a specialized section elsewhere
          if (field.name === "notes") {
            return null;
          }
          return (
            <textarea
              id={fieldId}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={`${baseClasses} p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 ${focusClasses} resize-none min-h-[80px]`}
              rows={3}
            />
          );

        case "number":
          // Allow decimals for additonal_cost
          if (field.name === "additonal_cost") {
            return (
              <Input
                id={fieldId}
                type="number"
                step="any"
                value={value}
                onChange={(e) =>
                  handleInputChange(field.name, e.target.value)
                }
                placeholder={field.placeholder}
                className={`${baseClasses} h-12`}
              />
            );
          }
          return (
            <Input
              id={fieldId}
              type="number"
              value={value}
              onChange={(e) =>
                handleInputChange(field.name, parseInt(e.target.value) || null)
              }
              placeholder={field.placeholder}
              className={`${baseClasses} h-12`}
            />
          );

        case "date":
          return (
            <Input
              id={fieldId}
              type="date"
              value={
                value && typeof value === "string"
                  ? value.includes("T")
                    ? value.split("T")[0]
                    : value.includes(" ")
                      ? value.split(" ")[0]
                      : value
                  : value || ""
              }
              onChange={(e) =>
                handleInputChange(field.name, e.target.value || undefined)
              }
              className={`${baseClasses} h-12`}
            />
          );

        case "time":
          return (
            <Input
              id={fieldId}
              type="time"
              value={
                typeof value === "string" &&
                value.length === 8 &&
                value[2] === ":" &&
                value[5] === ":"
                  ? value.slice(0, 5)
                  : value || ""
              }
              onChange={(e) =>
                handleInputChange(field.name, e.target.value || undefined)
              }
              className={`${baseClasses} h-12`}
            />
          );

        case "email":
          return (
            <Input
              id={fieldId}
              type="email"
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              onBlur={(e) =>
                handleInputChange(field.name, e.target.value.trim())
              }
              placeholder={field.placeholder}
              autoComplete="email"
              inputMode="email"
              className={`${baseClasses} h-12`}
            />
          );

        default: // text
          return (
            <Input
              id={fieldId}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={`${baseClasses} h-12`}
            />
          );
      }
    };

    // Dynamic label for PM field based on client
    const getFieldLabel = () => {
      if (field.name === "pm") {
        const client = formData.client || "";
        if (client.toLowerCase().includes("britelinkmct") || client.toLowerCase().includes("gio")) {
          return "DFA PM";
        }
        return "PM";
      }
      return field.label;
    };

    return (
      <div key={field.name} className={`space-y-1 ${field.gridCols || ""}`}>
        <Label
          htmlFor={fieldId}
          className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${
            LabelIcon ? "flex items-center gap-2" : ""
          }`}
        >
          {LabelIcon && <LabelIcon className="w-4 h-4 text-gray-500" />}
          {getFieldLabel()}
          {isRequired && (
            <Badge variant="destructive" className="ml-2 text-xs px-1.5 py-0.5">
              Required
            </Badge>
          )}
        </Label>
        {renderInput()}
      </div>
    );
  };

  if (!jobConfig) return null;

  // Get display title
  const getTitle = () => {
    // For drop-cable jobs, show dynamic title/subtitle for create/edit
    if (jobConfig.apiEndpoint === "/drop-cable") {
      let displayName;
      let subtitle;
      if (mode === "create") {
        displayName = "New Order";
        subtitle = `Create ${jobConfig.shortName || "installation"} details`;
      } else {
        displayName =
          formData.circuit_number ||
          formData.project_id ||
          formData.ticket_number ||
          formData.link_id ||
          formData.access_id ||
          formData.relocation_id ||
          "Edit Installation";
        subtitle = `Edit ${jobConfig.shortName || "installation"} details`;
      }
      return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Save className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="truncate">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                {displayName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                {subtitle}
              </p>
            </div>
          </div>
          {/* Status dropdown on the right */}
          {statusFieldConfig && (
            <div className="flex gap-2 min-w-[400px]">
              {/* Week Number Dropdown (left) */}
              <div className="relative w-1/2">
                <select
                  id="week"
                  value={week}
                  onChange={(e) => setWeek(e.target.value)}
                  aria-label="Week Number"
                  className="block w-full appearance-none pl-4 pr-12 py-3 rounded-lg text-sm font-medium border-0 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select week</option>
                  {Array.from({ length: 52 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Week {i + 1}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg
                    className="h-4 w-4 text-current opacity-60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              {/* Status Dropdown (right) */}
              <div className="relative w-[340px] min-w-[240px]">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      getDropCableStatusColor(
                        formData.status || statusFieldConfig.defaultValue || "",
                      )
                        .split(" ")
                        .find((cls) => cls.startsWith("bg-"))
                        ?.replace("bg-", "bg-") || "bg-gray-400"
                    }`}
                  ></div>
                </div>
                <select
                  id="status"
                  value={
                    formData.status || statusFieldConfig.defaultValue || ""
                  }
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  aria-label="Status"
                  className={`block w-full appearance-none pl-10 pr-12 py-3 rounded-lg text-sm font-medium border-0 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getDropCableStatusColor(
                    formData.status || statusFieldConfig.defaultValue || "",
                  )}`}
                >
                  {(statusFieldConfig.options || []).map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg
                    className="h-4 w-4 text-current opacity-60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    // Default for other job types
    const displayName =
      formData.circuit_number ||
      formData.project_id ||
      formData.ticket_number ||
      formData.link_id ||
      formData.access_id ||
      formData.relocation_id ||
      "Edit Job";
    return (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
          <Save className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {displayName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Edit {jobConfig.shortName || "job"} details
          </p>
        </div>
      </div>
    );
  };

  // Find the status field config (if any)
  const statusFieldConfig = jobConfig.sections
    ?.flatMap((section) => section.fields)
    ?.find((f) => f.name === "status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="sr-only">Job Form</DialogTitle>
          {getTitle()}
        </DialogHeader>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                  {mode === "create" ? "Creation Error" : "Update Error"}
                </h4>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {errorMsg}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status field is now in the header for drop-cable jobs */}

        <div className="space-y-6">
          {jobConfig.sections?.map((section, index) => {
            // For drop-cable jobs, render status next to circuit_number in Job Details section
            if (
              jobConfig.apiEndpoint === "/drop-cable" &&
              section.title === "Job Details" &&
              statusFieldConfig
            ) {
              // Find the circuit_number field
              const circuitField = section.fields.find(
                (f) => f.name === "circuit_number",
              );
              // Render both fields in a flex row
              return (
                <Card
                  key={index}
                  className="p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-6">
                    {section.icon && (
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <section.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {section.title}
                    </h3>
                  </div>
                  {/* Circuit Number and County side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-1">{renderField(circuitField)}</div>
                    <div className="space-y-1">
                      {renderField(
                        section.fields.find((f) => f.name === "county"),
                      )}
                    </div>
                  </div>
                  {/* Render the rest of the fields except circuit_number, county and status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.fields
                      .filter(
                        (f) =>
                          f.name !== "circuit_number" &&
                          f.name !== "county" &&
                          f.name !== "status",
                      )
                      .map(renderField)}
                  </div>
                </Card>
              );
            }
            // For all other sections, render as before, but filter out status for drop-cable
            return (
              <Card
                key={index}
                className="p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 mb-6">
                  {section.icon && (
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <section.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {section.title}
                  </h3>
                </div>
                <div
                  className={`grid ${
                    section.gridCols ||
                    "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  } gap-6`}
                >
                  {section.fields
                    ?.filter((f) =>
                      jobConfig.apiEndpoint === "/drop-cable"
                        ? f.name !== "status" &&
                          f.name !== "circuit_number" &&
                          f.name !== "notes"
                        : f.name !== "status" && f.name !== "notes",
                    )
                    ?.map(renderField)}

                  {/* Show installation completion % only in Services section */}
                  {jobConfig.apiEndpoint === "/drop-cable" && 
                   section.title === "Services" && (
                    <div className="space-y-2 col-span-full">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Installation Completion Override
                      </Label>
                      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                        <input
                          type="checkbox"
                          checked={installPercentEnabled}
                          onChange={(e) => setInstallPercentEnabled(e.target.checked)}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 mt-0.5"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              step="1"
                              disabled={!installPercentEnabled}
                              value={formData.install_completion_percent || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "install_completion_percent",
                                  e.target.value === "" ? "" : parseInt(e.target.value)
                                )
                              }
                              placeholder="e.g. 60"
                              className="w-32 h-10"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              % of installation completed
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            If the installation wasn&apos;t completed 100%, enter the completion percentage here. Leave unchecked to bill full installation amount.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}

          {/* Notes Section */}
          {jobConfig.sections?.some((s) =>
            s.fields?.some((f) => f.name === "notes"),
          ) && (
            <Card className="p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {/* Simple notes icon */}
                  <svg
                    className="w-4 h-4 text-gray-600 dark:text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15V5a2 2 0 0 0-2-2H7l-4 4v12a2 2 0 0 0 2 2h9" />
                    <path d="M17 21l4-4" />
                    <path d="M16 3v4a2 2 0 0 1-2 2H8" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Notes
                </h3>
              </div>

              {/* Existing notes list (edit mode) */}
              {mode === "edit" &&
                Array.isArray(formData?.notes) &&
                formData.notes.length > 0 && (
                  <div className="mb-6 space-y-3">
                    {formData.notes.map((note, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                            {note.text}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {note.timestamp
                              ? new Date(note.timestamp).toLocaleString()
                              : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Create mode: initial note textarea */}
              {mode === "create" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Initial Note (optional)
                  </Label>
                  <textarea
                    value={formData.notes || ""}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Add an initial note for this job"
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              )}

              {/* Edit mode: append a new note */}
              {mode === "edit" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Add Note
                  </Label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Write a new note..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    When you save, this note will be timestamped and appended.
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>

        <DialogFooter className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 sm:flex-none h-11 px-6"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 sm:flex-none h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : (
                <>
                  {mode === "create" ? (
                    <Plus className="w-4 h-4 mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {mode === "create"
                    ? `Create ${jobConfig.shortName || "Job"}`
                    : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
