"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { get, post } from "@/lib/api/fetcher";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/shared/Toast";
import {
  Package,
  Plus,
  Minus,
  Search,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function InventoryUsageDialog({
  open,
  onOpenChange,
  jobType,
  jobId,
  onSuccess,
}) {
  const toast = useToast();
  const { data, isLoading } = useSWR(
    open ? ["/inventory"] : null,
    () => get("/inventory"),
    {
      revalidateOnFocus: false,
    }
  );
  const inventory = useMemo(() => data?.data || [], [data]);

  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState({}); // id -> { quantity, item_name, unit }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelection({});
      setSearch("");
      setSaving(false);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search) return inventory;
    const s = search.toLowerCase();
    return inventory.filter((i) =>
      [i.item_name, i.item_code, i.category, i.description].some((v) =>
        String(v || "")
          .toLowerCase()
          .includes(s)
      )
    );
  }, [inventory, search]);

  const selectedItems = useMemo(() => {
    return Object.entries(selection)
      .filter(([_, v]) => Number(v.quantity || 0) > 0)
      .map(([id, v]) => {
        const item = inventory.find((i) => i.id === id);
        return {
          id,
          ...v,
          stock: item?.quantity ?? 0,
        };
      });
  }, [selection, inventory]);

  const handleQuantityChange = (itemId, delta) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    setSelection((prev) => {
      const current = prev[itemId] || {
        quantity: 0,
        item_name: item.item_name,
        unit: item.unit,
      };
      const newQty = Math.max(
        0,
        Math.min(item.quantity, Number(current.quantity || 0) + delta)
      );

      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [itemId]: {
          ...current,
          quantity: newQty,
        },
      };
    });
  };

  const handleQuantityInput = (itemId, value) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    const numValue =
      value === ""
        ? ""
        : Math.max(0, Math.min(item.quantity, Number(value) || 0));

    setSelection((prev) => ({
      ...prev,
      [itemId]: {
        quantity: numValue,
        item_name: item.item_name,
        unit: item.unit,
      },
    }));
  };

  async function handleApply() {
    try {
      setSaving(true);
      const items = Object.entries(selection)
        .map(([id, v]) => ({
          inventory_id: id,
          quantity: Number((v && v.quantity) || 0),
          item_name: v && v.item_name,
          unit: v && v.unit,
        }))
        .filter((x) => x.quantity > 0);

      if (items.length === 0) {
        toast.warning(
          "No items selected",
          "Please enter at least one usage quantity."
        );
        setSaving(false);
        return;
      }

      if (!jobId) {
        toast.error("Missing job", "Job ID is required to apply usage.");
        setSaving(false);
        return;
      }

      const payload = { jobType: jobType, jobId, items };

      const res = await post("/inventory/usage", payload);

      // Check for success in response
      if (res && res.success !== false) {
        // Call onSuccess callback (parent will show toast)
        if (onSuccess) {
          onSuccess(res.data || res);
        }

        // Close dialog
        onOpenChange(false);
      } else {
        throw new Error(res?.message || "Failed to apply usage");
      }
    } catch (e) {
      console.error("Error applying inventory usage:", e);
      const msg = e && e.message ? e.message : "Failed to apply usage";
      toast.error("Error", msg);
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Package className="w-5 h-5 text-white" />
            </div>
            Apply Inventory Usage
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Select items and quantities used for this job
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
          {/* Search */}
          <div className="relative flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search inventory by name, code, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected items summary */}
          {selectedItems.length > 0 && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-slate-900 dark:text-white">
                    {selectedItems.length} item
                    {selectedItems.length !== 1 ? "s" : ""} selected
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selectedItems.map((item) => (
                    <Badge
                      key={item.id}
                      variant="outline"
                      className="bg-white dark:bg-slate-800"
                    >
                      {item.item_name}: {item.quantity} {item.unit}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Inventory list */}
          <div className="flex-1 min-h-0 overflow-y-auto border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center h-48 text-slate-500">
                Loading inventory...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                <Package className="w-12 h-12 mb-2 text-slate-300" />
                <p>No inventory items found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {filtered.map((item) => {
                  const selected = selection[item.id];
                  const qty = Number(selected?.quantity || 0);
                  const isSelected = qty > 0;
                  const lowStock =
                    item.quantity <= (item.minimum_quantity || 0);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* Item info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                                {item.item_name}
                              </h4>
                              {lowStock && (
                                <Badge
                                  variant="outline"
                                  className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20"
                                >
                                  Low Stock
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {item.item_code && (
                                <span>Code: {item.item_code}</span>
                              )}
                              {item.category && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">
                                    {item.category}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stock info */}
                        <div className="text-center flex-shrink-0">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            In Stock
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              lowStock
                                ? "border-amber-300 text-amber-700 dark:text-amber-400"
                                : ""
                            }
                          >
                            {item.quantity ?? 0} {item.unit || "units"}
                          </Badge>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            disabled={!selected || qty <= 0}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            min={0}
                            max={item.quantity}
                            placeholder="0"
                            className="w-20 text-center"
                            value={selected?.quantity || ""}
                            onChange={(e) =>
                              handleQuantityInput(item.id, e.target.value)
                            }
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0"
                            onClick={() => handleQuantityChange(item.id, 1)}
                            disabled={qty >= item.quantity}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            {!jobId ? (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span>Job not selected</span>
              </div>
            ) : selectedItems.length === 0 ? (
              <span>No items selected</span>
            ) : (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {selectedItems.length} item
                  {selectedItems.length !== 1 ? "s" : ""} ready to apply
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={saving || !jobId || selectedItems.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? "Applying..." : "Apply Usage"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
