"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Calendar,
  Clock,
  FileText,
  Hash,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { post } from "@/lib/api/fetcher";

const JobCreationModal = ({
  isOpen,
  onClose,
  onJobCreated,
  jobType,
  jobConfig,
  clientId: propClientId,
  clientName,
  onError,
}) => {
  const [formData, setFormData] = useState(() => {
    const initialData = { client: clientName || "" };

    // Initialize form data based on job config
    jobConfig.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        } else {
          initialData[field.name] = "";
        }
      });
    });

    return initialData;
  });
  const [errorMsg, setErrorMsg] = useState("");

  const [isCreating, setIsCreating] = useState(false);

  // Update client name when prop changes
  useEffect(() => {
    if (clientName && clientName !== formData.client) {
      setFormData((prev) => ({
        ...prev,
        client: clientName,
      }));
    }
  }, [clientName]);

  const handleInputChange = (field, value) => {
    if (errorMsg) setErrorMsg("");
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsCreating(true);

      // Resolve client id: prefer prop, else parse from URL
      let resolvedClientId = propClientId;
      if (!resolvedClientId && typeof window !== "undefined") {
        const match = window.location.pathname.match(/\/clients\/([^/]+)/);
        if (match && match[1]) resolvedClientId = match[1];
      }

      if (!resolvedClientId) {
        setErrorMsg("Missing client ID in URL. Please navigate from a client page.");
        return;
      }

      // Validate required fields for drop-cable according to backend schema
      const requiredFields = jobConfig.apiEndpoint === "/drop-cable"
        ? ["circuit_number", "site_b_name"]
        : [];
      const missing = requiredFields.filter((f) => !formData[f] || String(formData[f]).trim() === "");
      if (missing.length) {
        const pretty = missing
          .map((f) => jobConfig.sections.flatMap((s) => s.fields).find((x) => x.name === f)?.label || f)
          .join(", ");
        setErrorMsg(`Please fill all required fields: ${pretty}`);
        return;
      }

      // Validate email fields present in config (e.g., end_client_contact_email)
      const emailFields = jobConfig.sections
        .flatMap((s) => s.fields)
        .filter((f) => f.type === "email")
        .map((f) => f.name);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const name of emailFields) {
        const val = formData[name];
        if (val && !emailRegex.test(String(val))) {
          const label = jobConfig.sections.flatMap((s) => s.fields).find((x) => x.name === name)?.label || name;
          setErrorMsg(`${label} must be a valid email address.`);
          return;
        }
      }

      // Prepare payload
      const payload = {
        ...formData,
        client_id: resolvedClientId,
      };

      // Clean up empty values and ensure proper data types
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || payload[key] === null) {
          delete payload[key];
        }

        const fieldConfig = jobConfig.sections
          .flatMap((s) => s.fields)
          .find((f) => f.name === key);

        if (fieldConfig) {
          // Convert distance to number if provided
          if (fieldConfig.type === "number" && payload[key]) {
            payload[key] = parseInt(payload[key]) || null;
          }
          // Keep time fields as simple HH:MM format
          if (fieldConfig.type === "time" && payload[key]) {
            // Don't add seconds - keep it as HH:MM
            payload[key] = payload[key];
          }
          // Keep date fields as simple YYYY-MM-DD format
          if (fieldConfig.type === "date" && payload[key]) {
            // Don't add timezone - keep it as YYYY-MM-DD
            payload[key] = payload[key];
          }
        }
      });

      // Log the payload before sending
      console.log("JobCreationModal payload:", payload);

      // Use the API endpoint from job config
      const result = await post(jobConfig.apiEndpoint, payload);

      // Notify parent component of successful creation
      if (onJobCreated) {
        onJobCreated(result.data);
      }

      // Close modal and reset form
      handleCancel();
    } catch (error) {
      console.error(`Error creating ${jobConfig.title}:`, error);
      const msg =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "An unexpected error occurred while creating the job.";
      setErrorMsg(msg);
      if (onError) onError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  // Compute whether required fields are present to enable submit
  const requiredForEndpoint = jobConfig.apiEndpoint === "/drop-cable"
    ? ["circuit_number", "site_b_name"]
    : [];
  const canSubmit = requiredForEndpoint.every(
    (f) => formData[f] && String(formData[f]).trim() !== ""
  ) && !isCreating;

  const handleCancel = () => {
    // Reset form data
    const resetData = { client: clientName || "" };
    jobConfig.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          resetData[field.name] = field.defaultValue;
        } else {
          resetData[field.name] = "";
        }
      });
    });
    setFormData(resetData);
    onClose();
  };

  const renderField = (field) => {
    const fieldId = `new_${field.name}`;
    const value = formData[field.name] || "";

    switch (field.type) {
      case "select":
        return (
          <div key={field.name}>
            <Label
              htmlFor={fieldId}
              className={field.icon ? "flex items-center gap-2" : ""}
            >
              {field.icon && <field.icon className="w-4 h-4" />}
              {field.label}
            </Label>
            <select
              id={fieldId}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "textarea":
        return (
          <div key={field.name}>
            <Label
              htmlFor={fieldId}
              className={field.icon ? "flex items-center gap-2" : ""}
            >
              {field.icon && <field.icon className="w-4 h-4" />}
              {field.label}
            </Label>
            <textarea
              id={fieldId}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              placeholder={field.placeholder}
            />
          </div>
        );

      default:
        return (
          <div key={field.name}>
            <Label
              htmlFor={fieldId}
              className={field.icon ? "flex items-center gap-2" : ""}
            >
              {field.icon && <field.icon className="w-4 h-4" />}
              {field.label}
            </Label>
            <Input
              id={fieldId}
              type={field.type || "text"}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className="mt-1"
              placeholder={field.placeholder}
            />
          </div>
        );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleCancel();
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            {jobConfig.title}
          </DialogTitle>
          <DialogDescription>{jobConfig.description}</DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="py-4 space-y-6">
          {jobConfig.sections.map((section, sectionIndex) => (
            <Card
              key={sectionIndex}
              className={`p-4 ${section.className || ""}`}
            >
              <div className="flex items-center gap-2 mb-4">
                {section.icon && (
                  <section.icon className="w-4 h-4 text-gray-600" />
                )}
                <h3 className="font-medium">{section.title}</h3>
              </div>
              <div
                className={`grid ${
                  section.gridCols || "grid-cols-1 md:grid-cols-3"
                } gap-4`}
              >
                {section.fields.map(renderField)}
              </div>
            </Card>
          ))}
        </div>

        <DialogFooter className="pt-6 border-t">
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating}
              className="flex-1 sm:flex-none"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 sm:flex-none"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create {jobConfig.shortName || "Job"}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobCreationModal;
