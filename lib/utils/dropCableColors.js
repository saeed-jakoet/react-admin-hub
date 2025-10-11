/**
 * Drop Cable Status Color Utilities
 * Centralized color definitions for drop cable statuses across the application
 */

// Unified status/event color map (snake_case only)
const STATUS_COLOR_MAP = {
  awaiting_client_confirmation_date: {
    class:
      "text-yellow-800 bg-yellow-200 border-yellow-300 dark:bg-yellow-800/40 dark:text-yellow-200 dark:border-yellow-600",
    hex: "#FACC15", // mid yellow
  },
  survey_required: {
    class:
      "text-purple-800 bg-purple-200 border-purple-300 dark:bg-purple-800/40 dark:text-purple-200 dark:border-purple-600",
    hex: "#A78BFA",
  },
  survey_scheduled: {
    class:
      "text-indigo-800 bg-indigo-200 border-indigo-300 dark:bg-indigo-800/40 dark:text-indigo-200 dark:border-indigo-600",
    hex: "#818CF8",
  },
  survey_completed: {
    class:
      "text-cyan-800 bg-cyan-200 border-cyan-300 dark:bg-cyan-800/40 dark:text-cyan-200 dark:border-cyan-600",
    hex: "#22D3EE",
  },
  lla_required: {
    class:
      "text-yellow-800 bg-yellow-200 border-yellow-300 dark:bg-yellow-800/40 dark:text-yellow-200 dark:border-yellow-600",
    hex: "#FDE047",
  },
  awaiting_lla_approval: {
    class:
      "text-amber-800 bg-amber-200 border-amber-300 dark:bg-amber-800/40 dark:text-amber-200 dark:border-amber-600",
    hex: "#FBBF24",
  },
  lla_received: {
    class:
      "text-emerald-800 bg-emerald-200 border-emerald-300 dark:bg-emerald-800/40 dark:text-emerald-200 dark:border-emerald-600",
    hex: "#34D399",
  },
  installation_scheduled: {
    class:
      "text-teal-800 bg-teal-200 border-teal-300 dark:bg-teal-800/40 dark:text-teal-200 dark:border-teal-600",
    hex: "#2DD4BF",
  },
  installation_completed: {
    class:
      "text-green-800 bg-green-200 border-green-300 dark:bg-green-800/40 dark:text-green-200 dark:border-green-600",
    hex: "#4ADE80",
  },
  as_built_submitted: {
    class:
      "text-blue-800 bg-blue-200 border-blue-300 dark:bg-blue-800/40 dark:text-blue-200 dark:border-blue-600",
    hex: "#60A5FA",
  },
  issue_logged: {
    class:
      "text-red-800 bg-red-200 border-red-300 dark:bg-red-800/40 dark:text-red-200 dark:border-red-600",
    hex: "#F87171",
  },
  on_hold: {
    class:
      "text-yellow-800 bg-yellow-300 border-yellow-400 dark:bg-yellow-800/50 dark:text-yellow-200 dark:border-yellow-600",
    hex: "#FACC15",
  },
  awaiting_health_and_safety: {
    class:
      "text-pink-800 bg-pink-200 border-pink-300 dark:bg-pink-800/40 dark:text-pink-200 dark:border-pink-600",
    hex: "#F472B6",
  },
  planning_document_submitted: {
    class:
      "text-lime-800 bg-lime-200 border-lime-300 dark:bg-lime-800/40 dark:text-lime-200 dark:border-lime-600",
    hex: "#A3E635",
  },
  awaiting_service_provider: {
    class:
      "text-sky-800 bg-sky-200 border-sky-300 dark:bg-sky-800/40 dark:text-sky-200 dark:border-sky-600",
    hex: "#38BDF8",
  },
  adw_required: {
    class:
      "text-amber-800 bg-amber-300 border-amber-400 dark:bg-amber-800/50 dark:text-amber-200 dark:border-amber-600",
    hex: "#F59E0B",
  },
  site_not_ready: {
    class:
      "text-gray-800 bg-gray-300 border-gray-400 dark:bg-gray-800/50 dark:text-gray-200 dark:border-gray-600",
    hex: "#9CA3AF",
  },
}


/**
 * Get status color as Tailwind class or hex value.
 * Accepts any status/event string (snake_case or Title Case) and normalizes to snake_case.
 * @param {string} status - Status or event type
 * @param {"class"|"hex"} [mode="class"] - Return Tailwind class string or hex color
 */
export function getDropCableStatusColor(status, mode = "class") {
  if (!status) {
    return mode === "hex"
      ? "#E5E7EB"
      : "text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700";
  }
  // Normalize: Title Case or spaced to snake_case
  let key = status;
  if (typeof key === "string") {
    // Convert to lower, replace spaces and dashes with underscores, remove non-word chars
    key = key
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  }
  const entry = STATUS_COLOR_MAP[key];
  if (!entry) {
    return mode === "hex"
      ? "#E5E7EB"
      : "text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700";
  }
  if (mode === "hex") return entry.hex || "#E5E7EB";
  return entry.class || "";
}

// Deprecated: use getDropCableStatusColor(status, "hex") instead
export const getDropCableStatusHexColor = (status) =>
  getDropCableStatusColor(status, "hex");

// Deprecated: use getDropCableStatusColor(eventType, "hex") instead
export const getEventTypeColor = (eventType) =>
  getDropCableStatusColor(eventType, "hex");

// Helper function to format status text for display
export const formatStatusText = (status) => {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};
