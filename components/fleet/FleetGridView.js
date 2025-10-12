import * as React from "react";
import { Truck, MapPin } from "lucide-react";

export function FleetGridView({ items, getStatusIcon, onViewModeChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-blue-500" />
            <div>
              <div className="font-bold text-lg text-gray-900 dark:text-white">{item.vehicle_name}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">{item.license_plate}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {getStatusIcon(item.status)}
            <span className="text-sm font-medium">{item.status}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
            <MapPin className="w-4 h-4" />
            {item.location}
          </div>
          <div className="text-xs text-gray-400 dark:text-slate-500 mt-2">
            Last Service: {item.last_service_date ? new Date(item.last_service_date).toLocaleDateString() : "—"}
          </div>
          <div className="text-xs text-gray-400 dark:text-slate-500">
            Next Service: {item.next_service_date ? new Date(item.next_service_date).toLocaleDateString() : "—"}
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="col-span-full text-center text-gray-400 dark:text-slate-500 py-12">
          No fleet vehicles found.
        </div>
      )}
    </div>
  );
}