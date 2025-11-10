/**
 * Link Build Status Color Utilities
 * Centralized color definitions for link build statuses across the application
 */

// Unified status color map
const STATUS_COLOR_MAP = {
  not_started: {
    class:
      "text-gray-800 bg-gray-200 border-gray-300 dark:bg-gray-800/40 dark:text-gray-200 dark:border-gray-600",
    hex: "#9CA3AF",
  },
  work_in_progress: {
    class:
      "text-blue-800 bg-blue-200 border-blue-300 dark:bg-blue-800/40 dark:text-blue-200 dark:border-blue-600",
    hex: "#60A5FA",
  },
  completed: {
    class:
      "text-green-800 bg-green-200 border-green-300 dark:bg-green-800/40 dark:text-green-200 dark:border-green-600",
    hex: "#4ADE80",
  },
  completed_asbuild_outstanding: {
    class:
      "text-orange-800 bg-orange-200 border-orange-300 dark:bg-orange-800/40 dark:text-orange-200 dark:border-orange-600",
    hex: "#FB923C",
  },
  cancelled: {
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
};

/**
 * Get status color as Tailwind class or hex value.
 * Accepts any status string (snake_case or Title Case) and normalizes to snake_case.
 * @param {string} status - Status type
 * @param {"class"|"hex"} [mode="class"] - Return Tailwind class string or hex color
 */
export function getLinkBuildStatusColor(status, mode = "class") {
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

// Helper function to format status text for display
export const formatStatusText = (status) => {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};
