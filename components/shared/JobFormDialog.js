"use client";

import React from "react";
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
import { X, Save, RefreshCw, Plus, AlertCircle } from "lucide-react";
import { post, put } from "@/lib/api/fetcher";

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
        } else {
          initialData[field.name] = "";
        }
      });
    });
    return initialData;
  };

  const [formData, setFormData] = React.useState(getInitialData);
  const [internalSaving, setInternalSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  // New note input (used in edit mode to append without overwriting)
  const [newNote, setNewNote] = React.useState("");

  const saving = externalSaving || internalSaving;

  // Update form data when jobData changes (edit mode)
  React.useEffect(() => {
    if (mode === "edit" && jobData) {
      setFormData({ ...jobData });
      setNewNote("");
    }
  }, [jobData, mode]);

  // Update client name when prop changes (create mode)
  React.useEffect(() => {
    if (mode === "create" && clientName && clientName !== formData.client) {
      setFormData((prev) => ({
        ...prev,
        client: clientName,
      }));
    }
  }, [clientName, mode, formData.client]);

  const handleInputChange = (field, value) => {
    if (errorMsg) setErrorMsg("");
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    // Get required fields based on job type
    const requiredFields =
      jobConfig?.apiEndpoint === "/drop-cable"
        ? ["circuit_number", "site_b_name"]
        : [];

    const missing = requiredFields.filter(
      (f) => !formData[f] || String(formData[f]).trim() === ""
    );

    if (missing.length) {
      const fieldLabels = missing.map(
        (f) =>
          jobConfig?.sections
            ?.flatMap((s) => s.fields)
            ?.find((x) => x.name === f)?.label || f
      );
      return `Please fill all required fields: ${fieldLabels.join(", ")}`;
    }

    // Validate email fields
    const emailFields =
      jobConfig?.sections
        ?.flatMap((s) => s.fields)
        ?.filter((f) => f.type === "email")
        ?.map((f) => f.name) || [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const name of emailFields) {
      const val = formData[name];
      if (val && !emailRegex.test(String(val))) {
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

      // Skip empty/undefined/null values
      if (value === "" || value === null || typeof value === "undefined") {
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
        const n = parseInt(value);
        if (!Number.isNaN(n)) value = n;
        else continue; // drop invalid numbers
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

      payload[name] = value;
    }

    return payload;
  };

  const handleSubmit = async () => {
    try {
      // Validation
      const validationError = validateForm();
      if (validationError) {
        setErrorMsg(validationError);
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

      console.log(`JobFormDialog ${mode} payload:`, payload);

      let result;
      if (mode === "create") {
        result = await post(jobConfig.apiEndpoint, payload);
      } else {
        result = await put(jobConfig.apiEndpoint, payload);
      }

      // Notify parent of success
      onSuccess?.(result.data || payload);

      // Close dialog and reset
      handleCancel();
    } catch (error) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} job:`,
        error
      );
      const msg =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        `An unexpected error occurred while ${
          mode === "create" ? "creating" : "updating"
        } the job.`;
      setErrorMsg(msg);
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

      switch (field.type) {
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
              placeholder={field.placeholder}
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

    return (
      <div key={field.name} className={`space-y-1 ${field.gridCols || ""}`}>
        <Label
          htmlFor={fieldId}
          className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${
            LabelIcon ? "flex items-center gap-2" : ""
          }`}
        >
          {LabelIcon && <LabelIcon className="w-4 h-4 text-gray-500" />}
          {field.label}
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
    // For drop-cable jobs, show circuit number left, status right
    if (jobConfig.apiEndpoint === "/drop-cable") {
      const displayName =
        formData.circuit_number ||
        formData.project_id ||
        formData.ticket_number ||
        formData.link_id ||
        formData.access_id ||
        formData.relocation_id ||
        "Edit Installation";
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
                Edit {jobConfig.shortName || "installation"} details
              </p>
            </div>
          </div>
          {/* Status dropdown on the right */}
          {statusFieldConfig && (
            <div className="relative min-w-[240px]">
              <div className="relative">
                {/* Status indicator */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      getDropCableStatusColor(
                        formData.status || statusFieldConfig.defaultValue || ""
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
                    formData.status || statusFieldConfig.defaultValue || ""
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

                {/* Simple dropdown arrow */}
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

  // Get status color for drop cable jobs (matching table colors)
  const getDropCableStatusColor = (status) => {
    const colors = {
      awaiting_client_installation_date:
        "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700",
      survey_required:
        "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700",
      survey_scheduled:
        "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-700",
      survey_completed:
        "text-cyan-700 bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-700",
      lla_required:
        "text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700",
      awaiting_lla_approval:
        "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700",
      lla_received:
        "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700",
      installation_scheduled:
        "text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-700",
      installation_completed:
        "text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700",
      as_built_submitted:
        "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700",
    };
    return (
      colors[status] ||
      "text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700"
    );
  };


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
                (f) => f.name === "circuit_number"
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
                        section.fields.find((f) => f.name === "county")
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
                          f.name !== "status"
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
                        ? f.name !== "status" && f.name !== "circuit_number" && f.name !== "notes"
                        : f.name !== "status" && f.name !== "notes"
                    )
                    ?.map(renderField)}
                </div>
              </Card>
            );
          })}

          {/* Notes Section */}
          {jobConfig.sections?.some((s) => s.fields?.some((f) => f.name === "notes")) && (
            <Card className="p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {/* Simple notes icon */}
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15V5a2 2 0 0 0-2-2H7l-4 4v12a2 2 0 0 0 2 2h9" />
                    <path d="M17 21l4-4" />
                    <path d="M16 3v4a2 2 0 0 1-2 2H8" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notes</h3>
              </div>

              {/* Existing notes list (edit mode) */}
              {mode === "edit" && Array.isArray(formData?.notes) && formData.notes.length > 0 && (
                <div className="mb-6 space-y-3">
                  {formData.notes.map((note, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{note.text}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {note.timestamp ? new Date(note.timestamp).toLocaleString() : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create mode: initial note textarea */}
              {mode === "create" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Initial Note (optional)</Label>
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
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Note</Label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Write a new note..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">When you save, this note will be timestamped and appended.</p>
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
