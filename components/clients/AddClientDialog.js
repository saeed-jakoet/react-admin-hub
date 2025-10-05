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
import { 
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Check
} from "lucide-react";
import { post } from "@/lib/api/fetcher";

export function AddClientDialog({ open, onOpenChange, onSuccess }) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const initialFormData = { first_name: "", last_name: "", email: "", phone_number: "", company_name: "", address: "", notes: "", is_active: true };
  const [formData, setFormData] = React.useState(initialFormData);

  const steps = [
    { id: 1, title: "Personal Details", description: "Basic client information", icon: User },
    { id: 2, title: "Company & Location", description: "Business and address details", icon: Building2 },
    { id: 3, title: "Additional Info", description: "Notes and preferences", icon: FileText }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const validateStep = (stepId) => stepId === 1 ? ["first_name", "last_name", "email"].every(field => formData[field]?.trim()) : true;
  const handleNext = () => validateStep(currentStep) && setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    try {
      await post("/client", formData);
      setFormData(initialFormData);
      setCurrentStep(1);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setCurrentStep(1);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="w-6 h-6 text-blue-600" />
            Add New Client
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6 px-4">
          {steps.map((step, index) => (
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
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? "bg-green-600" : "bg-gray-300"
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-1">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <currentStepData.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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

            <div className="space-y-4">
              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {[{id: "first_name", label: "First Name *", placeholder: "Enter first name"}, {id: "last_name", label: "Last Name *", placeholder: "Enter last name"}].map(field => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</Label>
                        <Input id={field.id} value={formData[field.id]} onChange={(e) => handleInputChange(field.id, e.target.value)} placeholder={field.placeholder} />
                      </div>
                    ))}
                  </div>
                  {[{id: "email", label: "Email Address *", type: "email", icon: Mail, placeholder: "Enter email address"}, {id: "phone_number", label: "Phone Number", icon: Phone, placeholder: "Enter phone number"}].map(field => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</Label>
                      <div className="relative">
                        <field.icon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input id={field.id} type={field.type} value={formData[field.id]} onChange={(e) => handleInputChange(field.id, e.target.value)} placeholder={field.placeholder} className="pl-10" />
                      </div>
                    </div>
                  ))}
                </>
              )}
              {currentStep === 2 && (
                <>
                  {[{id: "company_name", label: "Company Name", icon: Building2, placeholder: "Enter company name"}].map(field => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</Label>
                      <div className="relative">
                        <field.icon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input id={field.id} value={formData[field.id]} onChange={(e) => handleInputChange(field.id, e.target.value)} placeholder={field.placeholder} className="pl-10" />
                      </div>
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</Label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <textarea id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} placeholder="Enter full address" className="pl-10 w-full min-h-[80px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none" rows={3} />
                    </div>
                  </div>
                </>
              )}
              {currentStep === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</Label>
                    <div className="relative">
                      <FileText className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <textarea id="notes" value={formData.notes} onChange={(e) => handleInputChange("notes", e.target.value)} placeholder="Enter any additional notes about this client" className="pl-10 w-full min-h-[100px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none" rows={4} />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => handleInputChange("is_active", e.target.checked)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <Label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Client</Label>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Navigation Footer */}
        <DialogFooter className="flex items-center justify-between pt-4 border-t">
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
            
            {currentStep < steps.length ? (
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
                    Create Client
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