"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

/**
 * Reusable form dialog component
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onOpenChange - Callback when dialog open state changes
 * @param {string} props.title - Dialog title
 * @param {string} props.description - Dialog description
 * @param {Array} props.fields - Array of field configurations
 * @param {Function} props.onSubmit - Submit handler that receives form data
 * @param {string} props.submitLabel - Label for submit button (default: "Submit")
 * @param {boolean} props.isSubmitting - Whether form is currently submitting
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields = [],
  onSubmit,
  submitLabel = "Submit",
  isSubmitting = false,
}) {
  const [formData, setFormData] = React.useState({});

  React.useEffect(() => {
    if (open) {
      // Initialize form data with default values
      const initialData = {};
      fields.forEach((field) => {
        initialData[field.name] = field.defaultValue || "";
      });
      setFormData(initialData);
    }
  }, [open, fields]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b shrink-0">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="mt-1.5">{description}</DialogDescription>
          )}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-6 overflow-y-auto">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={field.type === "textarea" ? "col-span-2" : "col-span-1"}
                >
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-medium mb-2 block"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  {field.type === "textarea" ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={3}
                      className="flex w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={field.name}
                      name={field.name}
                      type={field.type || "text"}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      step={field.step}
                      min={field.min}
                      className="h-10 rounded-lg"
                    />
                  )}
                  {field.hint && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {field.hint}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="min-w-24"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-24">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
