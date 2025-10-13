import * as React from "react";
import { Truck, MapPin, Table } from "lucide-react";

export function FleetGridView({ items, getStatusIcon, onViewModeChange }) {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          className="inline-flex items-center px-3 py-2 bg-slate-100 dark:bg-slate-700 text-sm rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition"
          onClick={() => onViewModeChange && onViewModeChange("table")}
        >
          <Table className="w-4 h-4 mr-2" />
          Table View
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id || item.registration} className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-blue-500" />
              <div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">{item.registration}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400">{item.vin}</div>
              </div>
            </div>
            {item.make && item.model && (
              <div className="text-sm text-gray-600 dark:text-slate-400 font-medium">
                {item.make} {item.model}
              </div>
            )}
            {item.vehicle_type && (
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Type: {item.vehicle_type}
              </div>
            )}
            {item.technician && (
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Technician: {item.technician}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center text-gray-400 dark:text-slate-500 py-12">
            No fleet vehicles found.
          </div>
        )}
      </div>
    </div>
  );
}