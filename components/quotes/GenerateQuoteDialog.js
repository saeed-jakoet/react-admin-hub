"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, FileText } from "lucide-react";
import { post } from "@/lib/api/fetcher";
import { useToast } from "@/components/shared/Toast";
import DropCableQuote from "./DropCableQuote";

export default function GenerateQuoteDialog({ open, onOpenChange, clientId, clientInfo }) {
  const [selectedOrderType, setSelectedOrderType] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState(null);
  const { error } = useToast();

  const orderTypeOptions = [
    { value: "drop_cable", label: "Drop Cable" },
    { value: "link_build", label: "Link Build" },
  ];

  const handleGenerate = async () => {
    if (!selectedOrderType) {
      error("Error", "Please select an order type");
      return;
    }
    if (!selectedWeek) {
      error("Error", "Please select a week");
      return;
    }

    try {
      setLoading(true);
      const endpoint = selectedOrderType === "drop_cable" 
        ? "/drop-cable/weekly-totals"
        : "/link-build/weekly-totals";
      
      const response = await post(endpoint, {
        client_id: clientId,
        order_type: selectedOrderType,
        week: selectedWeek,
      });

      if (response.status === "success" && response.data) {
        setQuoteData({
          ...response.data,
          week: selectedWeek,
          orderType: selectedOrderType,
        });
      } else {
        error("Error", "Failed to fetch quote data");
      }
    } catch (err) {
      console.error("Error generating quote:", err);
      error("Error", err.message || "Failed to generate quote");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuoteData(null);
    setSelectedOrderType("");
    setSelectedWeek("");
    onOpenChange(false);
  };

  if (quoteData) {
    return (
      <DropCableQuote
        quoteData={quoteData}
        clientInfo={clientInfo}
        onClose={handleClose}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">Generate Quote</DialogTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Select order type and week to generate an invoice
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderType" className="text-sm font-medium">
              Order Type
            </Label>
            <select
              id="orderType"
              value={selectedOrderType}
              onChange={(e) => setSelectedOrderType(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select order type</option>
              {orderTypeOptions.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="week" className="text-sm font-medium">
              Week Number
            </Label>
            <select
              id="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              disabled={!selectedOrderType}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select a week</option>
              {Array.from({ length: 52 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Week {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> The quote will include all{" "}
              {selectedOrderType ? (
                <strong>
                  {orderTypeOptions.find((t) => t.value === selectedOrderType)?.label}
                </strong>
              ) : (
                "selected"
              )}{" "}
              jobs for <strong>{clientInfo?.company_name || "this client"}</strong> in
              the selected week.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading || !selectedWeek || !selectedOrderType}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate Quote
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
