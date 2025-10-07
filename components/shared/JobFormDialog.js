"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

  const saving = externalSaving || internalSaving;

  // Update form data when jobData changes (edit mode)
  React.useEffect(() => {
    if (mode === "edit" && jobData) {
      setFormData({ ...jobData });
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
    const allowedFields =
      jobConfig?.sections?.flatMap((s) => s.fields?.map((f) => f.name)) || [];

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
    if (mode === "create") {
      return (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {jobConfig.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {jobConfig.description}
            </p>
          </div>
        </div>
      );
    }

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

        <div className="space-y-6">
          {jobConfig.sections?.map((section, index) => (
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
                {section.fields?.map(renderField)}
              </div>
            </Card>
          ))}
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
