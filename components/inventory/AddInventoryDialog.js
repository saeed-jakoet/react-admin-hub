"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  X,
  CheckCircle,
  Layers,
} from "lucide-react";
import { post } from "@/lib/api/fetcher";

const categories = [
  { value: "cables", label: "Cables", icon: Zap },
  { value: "tools", label: "Tools", icon: Package },
  { value: "connectors", label: "Connectors", icon: Layers },
  { value: "networking_equipment", label: "Network Equipment", icon: Building2 },
  { value: "accessories", label: "Accessories", icon: FileText },
];

export function AddInventoryDialog({ open, onOpenChange, onSuccess }) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    item_name: "",
    item_code: "",
    description: "",
    category: "",
    quantity: "",
    unit: "",
    minimum_quantity: "",
    reorder_level: "",
    location: "",
    supplier_name: "",
    supplier_contact: "",
    cost_price: "",
    selling_price: "",
  });

  const totalSteps = 3;

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Convert numeric fields
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        minimum_quantity: parseInt(formData.minimum_quantity, 10),
        reorder_level: formData.reorder_level ? parseInt(formData.reorder_level, 10) : undefined,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
        selling_price: formData.selling_price ? parseFloat(formData.selling_price) : undefined,
      };

      await post("/inventory", payload);

      // Success
      onOpenChange(false);
      setCurrentStep(1);
      setFormData({
        item_name: "",
        item_code: "",
        description: "",
        category: "",
        quantity: "",
        unit: "",
        minimum_quantity: "",
        reorder_level: "",
        location: "",
        supplier_name: "",
        supplier_contact: "",
        cost_price: "",
        selling_price: "",
      });
      if (onSuccess) {
        onSuccess();
      }
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
    setFormData({
      item_name: "",
      item_code: "",
      description: "",
      category: "",
      quantity: "",
      unit: "",
      minimum_quantity: "",
      reorder_level: "",
      location: "",
      supplier_name: "",
      supplier_contact: "",
      cost_price: "",
      selling_price: "",
    });
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
              step === currentStep
                ? "bg-blue-600 text-white shadow-sm"
                : step < currentStep
                ? "bg-green-600 text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
            }`}
          >
            {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 3 && (
            <div
              className={`w-12 h-1 mx-2 rounded-full ${
                step < currentStep
                  ? "bg-green-600"
                  : "bg-gray-200 dark:bg-slate-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Item Information</h3>
        <p className="text-slate-600 dark:text-slate-400">Let's start with the basic details of your inventory item</p>
      </div>

      <Card className="p-6 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.item_name}
              onChange={(e) => updateFormData("item_name", e.target.value)}
              placeholder="e.g., Fiber Optic Splice Tray"
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Item Code *
            </label>
            <input
              type="text"
              value={formData.item_code}
              onChange={(e) => updateFormData("item_code", e.target.value)}
              placeholder="e.g., FO-TRAY-12"
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              placeholder="Brief description of the item..."
              rows={3}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Category *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => updateFormData("category", category.value)}
                  className={`p-4 rounded-lg border-2 ${
                    formData.category === category.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 shadow-sm"
                      : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.category === category.value
                        ? "bg-blue-100 dark:bg-blue-800"
                        : "bg-gray-100 dark:bg-slate-700"
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        formData.category === category.value 
                          ? "text-blue-600 dark:text-blue-300" 
                          : "text-gray-600 dark:text-slate-400"
                      }`} />
                    </div>
                    <span className={`font-semibold ${
                      formData.category === category.value 
                        ? "text-white" 
                        : "text-slate-900 dark:text-white"
                    }`}>
                      {category.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Hash className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Stock Details</h3>
        <p className="text-slate-600 dark:text-slate-400">Configure quantity, units, and stock management settings</p>
      </div>

      <Card className="p-6 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Current Quantity *
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => updateFormData("quantity", e.target.value)}
              placeholder="25"
              min="0"
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Unit *
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => updateFormData("unit", e.target.value)}
              placeholder="e.g., pieces, meters, boxes"
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <AlertTriangle className="w-4 h-4 inline mr-1 text-amber-500" />
              Minimum Quantity *
            </label>
            <input
              type="number"
              value={formData.minimum_quantity}
              onChange={(e) => updateFormData("minimum_quantity", e.target.value)}
              placeholder="5"
              min="0"
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Alert when stock falls below this level</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Reorder Level
            </label>
            <input
              type="number"
              value={formData.reorder_level}
              onChange={(e) => updateFormData("reorder_level", e.target.value)}
              placeholder="10"
              min="0"
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Quantity at which to reorder stock</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-1 text-blue-500" />
            Storage Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateFormData("location", e.target.value)}
            placeholder="e.g., Warehouse C - Shelf 3"
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Supplier & Pricing</h3>
        <p className="text-slate-600 dark:text-slate-400">Optional supplier information and pricing details</p>
      </div>

      <Card className="p-6 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Truck className="w-4 h-4 inline mr-1 text-purple-500" />
              Supplier Name
            </label>
            <input
              type="text"
              value={formData.supplier_name}
              onChange={(e) => updateFormData("supplier_name", e.target.value)}
              placeholder="e.g., FiberGear SA"
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Supplier Contact
            </label>
            <input
              type="text"
              value={formData.supplier_contact}
              onChange={(e) => updateFormData("supplier_contact", e.target.value)}
              placeholder="e.g., +27123456789 or email@supplier.com"
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1 text-green-500" />
              Cost Price (R)
            </label>
            <input
              type="number"
              value={formData.cost_price}
              onChange={(e) => updateFormData("cost_price", e.target.value)}
              placeholder="150.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1 text-blue-500" />
              Selling Price (R)
            </label>
            <input
              type="number"
              value={formData.selling_price}
              onChange={(e) => updateFormData("selling_price", e.target.value)}
              placeholder="250.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.item_name && formData.item_code && formData.category;
      case 2:
        return formData.quantity && formData.unit && formData.minimum_quantity;
      case 3:
        return true; // All fields optional in step 3
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            Add New Inventory Item
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Step {currentStep} of {totalSteps} - Create a new inventory item with detailed information
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {renderStepIndicator()}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6"
            >
              Previous
            </Button>

            <div className="flex items-center space-x-3">
              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceed()}
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Item
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
