"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { post } from "@/lib/api/fetcher";

export function AddItemDialog({ open, onOpenChange, onSuccess, config }) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState(config.initialFormData);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepId) => {
    const step = config.steps.find((s) => s.id === stepId);
    if (step?.requiredFields) {
      return step.requiredFields.every((field) =>
        formData[field]?.toString().trim()
      );
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, config.steps.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    try {
      // Check if we have any file fields
      const hasFiles = Object.values(formData).some(
        (value) => value instanceof File
      );
      if (hasFiles) {
        // Use FormData for multipart upload
        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          } else if (value !== null && value !== undefined && value !== "") {
            formDataToSend.append(key, String(value));
          }
        });
        // Log FormData payload
        const formDataLog = {};
        formDataToSend.forEach((value, key) => {
          formDataLog[key] =
            value instanceof File ? `[File: ${value.name}]` : value;
        });
        await post(config.apiEndpoint, formDataToSend);
      } else {
        // Sanitize JSON payload: drop empty strings and nulls so optional/nullable fields pass schema
        const sanitized = Object.entries(formData).reduce(
          (acc, [key, value]) => {
            if (value === null || value === undefined) return acc;
            if (typeof value === "string") {
              const trimmed = value.trim();
              if (trimmed === "") return acc; // drop empty strings
              acc[key] = trimmed;
            } else {
              acc[key] = value;
            }
            return acc;
          },
          {}
        );

        // Log JSON payload
        console.log("[AddItemDialog] POST payload (JSON):", sanitized);
        await post(config.apiEndpoint, sanitized);
      }
      setFormData(config.initialFormData);
      setCurrentStep(1);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error(
        `Error creating ${config.entityName.toLowerCase()}:`,
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <Label
              htmlFor={field.id}
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {field.label}
            </Label>
            <div className="relative">
              {field.icon && (
                <field.icon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              )}
              <Input
                id={field.id}
                type={field.type}
                value={formData[field.id] || ""}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={field.icon ? "pl-10" : ""}
                step={field.step}
                min={field.min}
              />
            </div>
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label
              htmlFor={field.id}
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {field.label}
            </Label>
            <div className="relative">
              {field.icon && (
                <field.icon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              )}
              <textarea
                id={field.id}
                value={formData[field.id] || ""}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={`${
                  field.icon ? "pl-10" : ""
                } w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none`}
                rows={field.rows || 3}
                style={{ minHeight: `${(field.rows || 3) * 20 + 16}px` }}
              />
            </div>
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              checked={formData[field.id] || false}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <Label
              htmlFor={field.id}
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {field.label}
            </Label>
          </div>
        );

      case "select-buttons":
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {field.options.map((option) => {
                const Icon = option.icon;
                const isSelected = formData[field.id] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange(field.id, option.value)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? "bg-blue-100 dark:bg-blue-800"
                            : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            isSelected
                              ? "text-blue-600 dark:text-blue-300"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        />
                      </div>
                      <span
                        className={`font-medium text-sm ${
                          isSelected
                            ? "text-blue-900 dark:text-blue-100"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {option.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "file":
        return (
          <div key={field.id} className="space-y-2">
            <Label
              htmlFor={field.id}
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {field.label}
            </Label>
            <div className="space-y-3">
              {field.documentType && (
                <div>
                  <Label
                    htmlFor={`${field.id}_type`}
                    className="text-xs font-medium text-gray-600 dark:text-gray-400"
                  >
                    Document Type
                  </Label>
                  <select
                    id={`${field.id}_type`}
                    value={formData[`${field.id}_type`] || ""}
                    onChange={(e) =>
                      handleInputChange(`${field.id}_type`, e.target.value)
                    }
                    className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 dark:focus:border-blue-400"
                  >
                    <option value="">Select document type</option>
                    <option value="id">ID Document</option>
                    <option value="medical">Medical Certificate</option>
                    <option value="employment_contract">
                      Employment Contract
                    </option>
                  </select>
                </div>
              )}
              <div className="relative">
                {field.icon && (
                  <field.icon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                )}
                <input
                  id={field.id}
                  type="file"
                  accept={field.accept || "*/*"}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleInputChange(field.id, file);
                  }}
                  className={`${
                    field.icon ? "pl-10" : ""
                  } w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white file:mr-4 file:py-1 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300`}
                />
              </div>
              {formData[field.id] && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Selected: {formData[field.id].name}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStepContent = () => {
    const currentStepConfig = config.steps.find(
      (step) => step.id === currentStep
    );
    if (!currentStepConfig) return null;

    // Separate grid and non-grid fields
    const gridFields = currentStepConfig.fields.filter((field) => field.grid);
    const fullWidthFields = currentStepConfig.fields.filter(
      (field) => !field.grid
    );

    return (
      <div className="space-y-4">
        {/* Grid fields */}
        {gridFields.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {gridFields.map(renderField)}
          </div>
        )}

        {/* Full-width fields */}
        {fullWidthFields.map(renderField)}
      </div>
    );
  };

  React.useEffect(() => {
    if (!open) {
      setFormData(config.initialFormData);
      setCurrentStep(1);
    }
  }, [open, config.initialFormData]);

  const currentStepData = config.steps.find((step) => step.id === currentStep);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <config.titleIcon className="w-6 h-6 text-blue-600" />
            {config.title}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6 px-4 flex-shrink-0">
          {config.steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep === step.id
                      ? "border-blue-600 bg-blue-600 text-white"
                      : currentStep > step.id
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < config.steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-colors ${
                    currentStep > step.id ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-1">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                {React.createElement(currentStepData.icon, {
                  className: "w-6 h-6 text-blue-600 dark:text-blue-400",
                })}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentStepData.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentStepData.description}
                </p>
              </div>
            </div>

            <div className="space-y-4">{renderStepContent()}</div>
          </Card>
        </div>

        {/* Navigation Footer */}
        <DialogFooter className="flex items-center justify-between pt-4 border-t flex-shrink-0">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {currentStep < config.steps.length ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(currentStep) || isSubmitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Create {config.entityName}
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
