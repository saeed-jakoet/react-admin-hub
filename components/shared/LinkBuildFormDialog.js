"use client";

import { useEffect, useState } from "react";
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
import { X, Save, RefreshCw, Plus, AlertCircle } from "lucide-react";
import { post, put, get } from "@/lib/api/fetcher";
import { getLinkBuildStatusColor } from "@/lib/utils/linkBuildColors";
import { useToast } from "@/components/shared/Toast";
import { useJobFormLogic, validateForm } from "./BaseJobFormDialog";

export default function LinkBuildFormDialog({
  mode = "create",
  open,
  onOpenChange,
  jobData = {},
  jobConfig,
  clientId,
  clientName,
  clientContactName,
  clientContactPhone,
  onSuccess,
  onError,
}) {
  const { success, error: toastError } = useToast();
  const {
    formData,
    setFormData,
    saving,
    setSaving,
    errorMsg,
    setErrorMsg,
    week,
    setWeek,
    handleInputChange,
  } = useJobFormLogic({ mode, open, jobData, jobConfig, clientName });

  // Link build specific states for technician dropdown
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(
    jobData?.technician_id || ""
  );

  // Load technicians
  useEffect(() => {
    if (!open) return;
    const loadTechnicians = async () => {
      setLoadingTechnicians(true);
      try {
        const res = await get("/staff?role=technician");
        setTechnicians(res.data || []);
      } catch (err) {
        console.error("Failed to load technicians:", err);
      } finally {
        setLoadingTechnicians(false);
      }
    };
    loadTechnicians();
  }, [open]);

  // Handler for technician change
  const handleTechnicianChange = (technicianId) => {
    setSelectedTechnicianId(technicianId);
    if (technicianId) {
      const selected = technicians.find((t) => t.id === technicianId);
      if (selected) {
        const technicianName = `${selected.first_name} ${selected.surname}`;
        handleInputChange("technician", technicianName);
        handleInputChange("technician_id", technicianId);
      }
    } else {
      handleInputChange("technician", "");
      handleInputChange("technician_id", "");
    }
  };

  // Auto-populate client fields in create mode
  useEffect(() => {
    if (mode === "create" && open) {
      const updates = {};
      if (clientName && !formData.client) {
        updates.client = clientName;
      }
      if (clientContactName && !formData.client_contact_name) {
        updates.client_contact_name = clientContactName;
      }
      if (Object.keys(updates).length > 0) {
        setFormData((prev) => ({
          ...prev,
          ...updates,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, open, clientName, clientContactName]);

  const preparePayload = () => {
    let allowedFields =
      jobConfig?.sections?.flatMap((s) => s.fields?.map((f) => f.name)) || [];

    const payload = {};

    if (mode === "edit" && jobData?.id) {
      payload.id = jobData.id;
    }

    let resolvedClientId = clientId;
    if (mode === "create") {
      if (!resolvedClientId && typeof window !== "undefined") {
        const match = window.location.pathname.match(/\/clients\/([^/]+)/);
        if (match && match[1]) resolvedClientId = match[1];
      }
      if (resolvedClientId) payload.client_id = resolvedClientId;
    } else if (formData.client_id) {
      payload.client_id = formData.client_id;
    }

    for (const name of allowedFields) {
      const fieldConfig = jobConfig.sections
        .flatMap((s) => s.fields)
        .find((f) => f.name === name);

      let value = formData[name];

      if (fieldConfig?.type === "checkbox") {
        payload[name] = Boolean(value);
        continue;
      }

      if (value === "" || typeof value === "undefined" || value === null) {
        if (mode === "edit") {
          payload[name] = null;
        }
        continue;
      }

      if (fieldConfig?.type === "number") {
        const n = parseInt(value);
        if (!Number.isNaN(n)) value = n;
        else if (mode === "edit") {
          payload[name] = null;
          continue;
        }
      }

      payload[name] = value;
    }

    if (week && week.trim()) {
      payload.week = week.trim();
    }

    return payload;
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    const validationError = validateForm(formData, jobConfig);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSaving(true);
    try {
      const payload = preparePayload();
      
      // Handle notes based on mode
      if (mode === "create" && formData.newNote?.trim()) {
        payload.notes = formData.newNote.trim();
      } else if (mode === "edit" && formData.newNote?.trim()) {
        payload.notes = formData.newNote.trim();
      }
      
      let result;

      console.log(payload);
      
      if (mode === "create") {
        result = await post(jobConfig.apiEndpoint, payload);
      } else {
        result = await put(jobConfig.apiEndpoint, payload);
      }

      onSuccess?.(result?.data || result);
      onOpenChange(false);
    } catch (err) {
      const msg = err?.message || "An error occurred";
      setErrorMsg(msg);
      onError?.(msg);
      toastError("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  const statusFieldConfig = jobConfig.sections
    ?.flatMap((section) => section.fields)
    ?.find((f) => f.name === "status");

  const getTitle = () => {
    let displayName;
    let subtitle;
    if (mode === "create") {
      displayName = "New Order";
      subtitle = `Create ${jobConfig.shortName || "link build"} details`;
    } else {
      displayName = formData.circuit_number || "Edit Link Build";
      subtitle = `Edit ${jobConfig.shortName || "link build"} details`;
    }

    return (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Save className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
        {statusFieldConfig && (
          <div className="flex gap-2 min-w-[600px]">
            <div className="relative w-1/3">
              <Input
                id="quote_no"
                type="text"
                value={formData.quote_no || ""}
                onChange={(e) => handleInputChange("quote_no", e.target.value)}
                placeholder="Quote #"
                className="w-full h-12 px-4 text-sm font-medium bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="relative w-1/3">
              {(() => {
                const currentYear = new Date().getFullYear();
                const weekRegex = /^(\d{4})-(\d{2})$/;
                const selectedYear =
                  typeof week === "string" && weekRegex.test(week)
                    ? parseInt(week.slice(0, 4), 10)
                    : currentYear;
                const makeValue = (w) =>
                  `${selectedYear}-${String(w).padStart(2, "0")}`;
                return (
                  <select
                    id="week"
                    value={week}
                    onChange={(e) => setWeek(e.target.value)}
                    aria-label="Week Number"
                    className="block w-full appearance-none pl-4 pr-12 py-3 rounded-lg text-sm font-medium border-0 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select week</option>
                    {Array.from({ length: 52 }, (_, i) => (
                      <option key={i + 1} value={makeValue(i + 1)}>
                        Week {i + 1}
                      </option>
                    ))}
                  </select>
                );
              })()}
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
            <div className="relative w-1/3">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    getLinkBuildStatusColor(
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
                value={formData.status || statusFieldConfig.defaultValue || ""}
                onChange={(e) => handleInputChange("status", e.target.value)}
                aria-label="Status"
                className={`block w-full appearance-none pl-10 pr-12 py-3 rounded-lg text-sm font-medium border-0 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${getLinkBuildStatusColor(
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
  };

  const renderField = (field) => {
    if (!field) return null;

    const fieldId = `field-${field.name}`;
    const value = formData[field.name] ?? "";
    const baseClasses =
      "w-full text-sm text-gray-900 dark:text-gray-100 focus:outline-none";
    const focusClasses = "focus:ring-2 focus:ring-purple-500 focus:border-purple-500";

    // Special handling for technician field
    if (field.name === "technician") {
      return (
        <div className="space-y-2">
          {loadingTechnicians ? (
            <div className="flex items-center gap-2 p-3 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading staff...
            </div>
          ) : technicians.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
              No technicians available
            </div>
          ) : (
            <select
              id={fieldId}
              value={selectedTechnicianId}
              onChange={(e) => handleTechnicianChange(e.target.value)}
              className={`${baseClasses} p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 ${focusClasses}`}
            >
              <option value="">Select a technician</option>
              {technicians.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.first_name} {staff.surname}
                </option>
              ))}
            </select>
          )}
          {selectedTechnicianId && formData.technician && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Assigned: {formData.technician}
            </p>
          )}
        </div>
      );
    }

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
        // Special handling for notes field to show previous notes as cards
        if (field.name === "notes") {
          const previousNotes = Array.isArray(formData.notes) ? formData.notes : [];
          const newNote = formData.newNote || "";
          
          return (
            <div className="space-y-4">
              {/* Display previous notes as read-only cards */}
              {previousNotes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Previous Notes
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {previousNotes.map((note, index) => (
                      <div
                        key={index}
                        className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg"
                      >
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                          {new Date(note.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {note.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Textarea for new note (only in edit mode) */}
              {mode === "edit" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="new-note"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                  </Label>
                  <textarea
                    id="new-note"
                    value={newNote}
                    onChange={(e) => handleInputChange("newNote", e.target.value)}
                    placeholder="Type a new note to append..."
                    className={`${baseClasses} p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 ${focusClasses} resize-none min-h-[120px]`}
                    rows={5}
                  />
                </div>
              )}
              
              {/* In create mode, just show a regular textarea */}
              {mode === "create" && (
                <textarea
                  id={fieldId}
                  value={newNote}
                  onChange={(e) => handleInputChange("newNote", e.target.value)}
                  placeholder={field.placeholder}
                  className={`${baseClasses} p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 ${focusClasses} resize-none min-h-[120px]`}
                  rows={5}
                />
              )}
            </div>
          );
        }
        
        return (
          <textarea
            id={fieldId}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseClasses} p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 ${focusClasses} resize-none min-h-[120px]`}
            rows={5}
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

      default:
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="sr-only">Link Build Form</DialogTitle>
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
          {jobConfig.sections?.map((section, index) => {
            // Skip status, week, and quote_no in sections since they're in header
            const sectionFields = section.fields.filter(
              (f) => f.name !== "status" && f.name !== "week" && f.name !== "quote_no"
            );
            if (sectionFields.length === 0) return null;

            return (
              <Card
                key={index}
                className={`p-6 shadow-sm border ${
                  section.className || "border-gray-200 dark:border-gray-700"
                }`}
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
                  className={`grid gap-6 ${
                    section.gridCols || "grid-cols-1 md:grid-cols-2"
                  }`}
                >
                  {sectionFields.map((field) => (
                    <div
                      key={field.name}
                      className={field.gridCols || "space-y-1"}
                    >
                      <Label
                        htmlFor={`field-${field.name}`}
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        {field.label}
                      </Label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        <DialogFooter className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === "create" ? "Create" : "Update"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
