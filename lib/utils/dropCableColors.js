/**
 * Drop Cable Status Color Utilities
 * Centralized color definitions for drop cable statuses across the application
 */

// Unified status/event color map (snake_case only)
const STATUS_COLOR_MAP = {
  awaiting_client_confirmation_date: {
    class:
      "text-yellow-800 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700",
    hex: "#FDE68A",
  },
  survey_required: {
    class:
      "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700",
    hex: "#DDD6FE",
  },
  survey_scheduled: {
    class:
      "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-700",
    hex: "#C7D2FE",
  },
  survey_completed: {
    class:
      "text-cyan-700 bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-700",
    hex: "#A5F3FC",
  },
  lla_required: {
    class:
      "text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700",
    hex: "#FEF08A",
  },
  awaiting_lla_approval: {
    class:
      "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700",
    hex: "#FDE68A",
  },
  lla_received: {
    class:
      "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700",
    hex: "#D1FAE5",
  },
  installation_scheduled: {
    class:
      "text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-700",
    hex: "#99F6E4",
  },
  installation_completed: {
    class:
      "text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700",
    hex: "#BBF7D0",
  },
  as_built_submitted: {
    class:
      "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700",
    hex: "#BFDBFE",
  },
  issue_logged: {
    class:
      "text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700",
    hex: "#FECACA",
  },
  on_hold: {
    class:
      "text-yellow-800 bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700",
    hex: "#FEF9C3",
  },
  awaiting_health_and_safety: {
    class:
      "text-pink-700 bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-700",
    hex: "#FCE7F3",
  },
  planning_document_submitted: {
    class:
      "text-lime-700 bg-lime-50 border-lime-200 dark:bg-lime-900/20 dark:text-lime-300 dark:border-lime-700",
    hex: "#ECFCCB",
  },
  awaiting_service_provider: {
    class:
      "text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-700",
    hex: "#E0F2FE",
  },
  adw_required: {
    class:
      "text-amber-800 bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700",
    hex: "#FEF3C7",
  },
  site_not_ready: {
    class:
      "text-gray-700 bg-gray-200 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700",
    hex: "#E5E7EB",
  },
};

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
