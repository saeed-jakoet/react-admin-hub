"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Package,
  Zap,
  MapPin,
  Building2,
  DollarSign,
  Hash,
  FileText,
  AlertTriangle,
  Truck,
  Plus,
  Layers,
  Check,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { post } from "@/lib/api/fetcher";

export function AddInventoryDialog({ open, onOpenChange, onSuccess }) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const initialFormData = { item_name: "", item_code: "", description: "", category: "", quantity: "", unit: "", minimum_quantity: "", reorder_level: "", location: "", supplier_name: "", supplier_contact: "", cost_price: "", selling_price: "" };
  const [formData, setFormData] = React.useState(initialFormData);

  const categories = [
    { value: "cables", label: "Cables", icon: Zap },
    { value: "tools", label: "Tools", icon: Package },
    { value: "connectors", label: "Connectors", icon: Layers },
    { value: "networking_equipment", label: "Network Equipment", icon: Building2 },
    { value: "accessories", label: "Accessories", icon: FileText }
  ];

  const updateFormData = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const nextStep = () => currentStep < 3 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = { ...formData, quantity: parseInt(formData.quantity, 10), minimum_quantity: parseInt(formData.minimum_quantity, 10), reorder_level: formData.reorder_level ? parseInt(formData.reorder_level, 10) : undefined, cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined, selling_price: formData.selling_price ? parseFloat(formData.selling_price) : undefined };
      await post("/inventory", payload);
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Error adding inventory item:", error);
      alert("Failed to add inventory item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(1);
    setFormData(initialFormData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.item_name && formData.item_code && formData.category;
      case 2: return formData.quantity && formData.unit && formData.minimum_quantity;
      case 3: return true;
      default: return false;
    }
  };

  const stepConfig = [
    { icon: Package, title: "Item Information", desc: "Basic details of your inventory item" },
    { icon: Hash, title: "Stock Details", desc: "Quantity and stock management" },
    { icon: Building2, title: "Supplier & Pricing", desc: "Supplier information and pricing" }
  ];

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            {[{id: "item_name", label: "Item Name *", placeholder: "e.g., Fiber Optic Splice Tray"}, {id: "item_code", label: "Item Code *", placeholder: "e.g., FO-TRAY-12"}].map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</Label>
                <Input id={field.id} value={formData[field.id]} onChange={(e) => updateFormData(field.id, e.target.value)} placeholder={field.placeholder} className={field.id === "item_code" ? "font-mono" : ""} />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <textarea id="description" value={formData.description} onChange={(e) => updateFormData("description", e.target.value)} placeholder="Brief description of the item..." className="pl-10 w-full min-h-[80px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none" rows={3} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category *</Label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = formData.category === category.value;
                return (
                  <button key={category.value} type="button" onClick={() => updateFormData("category", category.value)} className={`p-3 rounded-lg border-2 transition-colors ${isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-600 hover:border-blue-300"}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-blue-100 dark:bg-blue-800" : "bg-gray-100 dark:bg-gray-700"}`}>
                        <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"}`} />
                      </div>
                      <span className={`font-medium text-sm ${isSelected ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-white"}`}>{category.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      );
    }
    
    if (currentStep === 2) {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            {[{id: "quantity", label: "Current Quantity *", placeholder: "25", type: "number"}, {id: "unit", label: "Unit *", placeholder: "pieces, meters, boxes"}].map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</Label>
                <Input id={field.id} type={field.type} value={formData[field.id]} onChange={(e) => updateFormData(field.id, e.target.value)} placeholder={field.placeholder} min={field.type === "number" ? "0" : undefined} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{id: "minimum_quantity", label: "Minimum Quantity *", placeholder: "5", type: "number", icon: AlertTriangle, desc: "Alert when stock falls below this level"}, {id: "reorder_level", label: "Reorder Level", placeholder: "10", type: "number", desc: "Quantity at which to reorder stock"}].map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.icon && <field.icon className="w-4 h-4 inline mr-1 text-amber-500" />}{field.label}
                </Label>
                <Input id={field.id} type={field.type} value={formData[field.id]} onChange={(e) => updateFormData(field.id, e.target.value)} placeholder={field.placeholder} min="0" />
                {field.desc && <p className="text-xs text-gray-500 dark:text-gray-400">{field.desc}</p>}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage Location</Label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input id="location" value={formData.location} onChange={(e) => updateFormData("location", e.target.value)} placeholder="e.g., Warehouse C - Shelf 3" className="pl-10" />
            </div>
          </div>
        </>
      );
    }
    
    if (currentStep === 3) {
      return (
        <>
          <div className="space-y-4">
            {[{id: "supplier_name", label: "Supplier Name", placeholder: "e.g., FiberGear SA", icon: Truck}, {id: "supplier_contact", label: "Supplier Contact", placeholder: "e.g., +27123456789 or email@supplier.com"}].map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</Label>
                <div className="relative">
                  {field.icon && <field.icon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />}
                  <Input id={field.id} value={formData[field.id]} onChange={(e) => updateFormData(field.id, e.target.value)} placeholder={field.placeholder} className={field.icon ? "pl-10" : ""} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{id: "cost_price", label: "Cost Price (R)", placeholder: "150.00", icon: DollarSign}, {id: "selling_price", label: "Selling Price (R)", placeholder: "250.00", icon: DollarSign}].map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</Label>
                <div className="relative">
                  <field.icon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input id={field.id} type="number" value={formData[field.id]} onChange={(e) => updateFormData(field.id, e.target.value)} placeholder={field.placeholder} step="0.01" min="0" className="pl-10" />
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="w-6 h-6 text-blue-600" />
            Add New Inventory Item
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6 px-4">
          {stepConfig.map((step, index) => (
            <React.Fragment key={index + 1}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep === index + 1
                      ? "border-blue-600 bg-blue-600 text-white"
                      : currentStep > index + 1
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {currentStep > index + 1 ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${
                    currentStep >= index + 1 ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {step.desc}
                  </p>
                </div>
              </div>
              {index < stepConfig.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > index + 1 ? "bg-green-600" : "bg-gray-300"
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
                {React.createElement(stepConfig[currentStep - 1].icon, {
                  className: "w-6 h-6 text-blue-600 dark:text-blue-400"
                })}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stepConfig[currentStep - 1].title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {stepConfig[currentStep - 1].desc}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {renderStepContent()}
            </div>
          </Card>
        </div>

        {/* Navigation Footer */}
        <DialogFooter className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
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
            
            {currentStep < 3 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
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
                    Create Item
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
