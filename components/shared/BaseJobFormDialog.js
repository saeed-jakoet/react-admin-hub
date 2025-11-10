/**
 * BaseJobFormDialog
 * Shared base component for job form dialogs
 * Contains common logic for create/edit operations
 */

import { useState, useEffect } from "react";

export const useJobFormLogic = ({
  mode,
  open,
  jobData,
  jobConfig,
  clientName,
}) => {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [week, setWeek] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Initialize form data when dialog opens or mode/jobData changes
  useEffect(() => {
    if (!open) {
      setInitialized(false);
      return;
    }

    // Only initialize once when dialog opens
    if (initialized) return;

    if (mode === "edit" && jobData && Object.keys(jobData).length > 0) {
      const companyName =
        jobData?.clients?.company_name || jobData?.client || clientName || "";
      
      // Convert notes from JSON array to readable string
      let notesText = "";
      if (jobData?.notes) {
        try {
          const notesArray = typeof jobData.notes === "string" 
            ? JSON.parse(jobData.notes) 
            : jobData.notes;
          
          if (Array.isArray(notesArray) && notesArray.length > 0) {
            notesText = notesArray
              .map((note) => {
                const date = new Date(note.timestamp).toLocaleString();
                return `[${date}] ${note.text}`;
              })
              .join("\n\n");
          }
        } catch (err) {
          console.error("Failed to parse notes:", err);
          notesText = "";
        }
      }
      
      setFormData({ ...jobData, client: companyName, notes: notesText });
      setWeek(jobData.week || "");
      setInitialized(true);
    } else if (mode === "create") {
      // Initialize with default values for create mode
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
      setFormData(initialData);
      setWeek("");
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, jobData, clientName, initialized]);

  const handleInputChange = (field, value) => {
    // Sanitize additional cost fields
    if (field === "additonal_cost") {
      const cleaned = String(value)
        .replace(/\s+/g, "")
        .replace(/[^0-9.]/g, "")
        .replace(/(\..*)\./g, "$1");
      value = cleaned;
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return {
    formData,
    setFormData,
    saving,
    setSaving,
    errorMsg,
    setErrorMsg,
    week,
    setWeek,
    handleInputChange,
  };
};

export const validateForm = (formData, jobConfig) => {
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

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  for (const name of emailFields) {
    const rawVal = formData[name];
    const val =
      typeof rawVal === "string" ? rawVal.trim() : String(rawVal || "").trim();
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
