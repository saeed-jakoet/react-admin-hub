"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

// Toast Context
const ToastContext = React.createContext(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = React.useCallback(
    (options) => {
      const id = Date.now() + Math.random();
      const toast = {
        id,
        type: options.type || "info",
        title: options.title,
        message: options.message,
        duration: options.duration ?? 5000,
        action: options.action,
        onAction: options.onAction,
        onCancel: options.onCancel,
      };

      setToasts((prev) => [...prev, toast]);

      if (toast.duration > 0 && !toast.action) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = React.useCallback(
    (title, message, options = {}) => {
      return showToast({ ...options, type: "success", title, message });
    },
    [showToast]
  );

  const error = React.useCallback(
    (title, message, options = {}) => {
      return showToast({ ...options, type: "error", title, message });
    },
    [showToast]
  );

  const warning = React.useCallback(
    (title, message, options = {}) => {
      return showToast({ ...options, type: "warning", title, message });
    },
    [showToast]
  );

  const info = React.useCallback(
    (title, message, options = {}) => {
      return showToast({ ...options, type: "info", title, message });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
};

// Individual Toast Component
const Toast = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = React.useState(false);
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    if (toast.duration > 0 && !toast.action) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
        setProgress(remaining);
      }, 50);

      return () => clearInterval(interval);
    }
  }, [toast.duration, toast.action]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleAction = () => {
    if (toast.onAction) {
      toast.onAction();
    }
    handleClose();
  };

  const handleCancel = () => {
    if (toast.onCancel) {
      toast.onCancel();
    }
    handleClose();
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "info":
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case "success":
        return {
          border: "border-l-green-500",
          iconColor: "text-green-600 dark:text-green-500",
          progress: "bg-green-500",
        };
      case "error":
        return {
          border: "border-l-red-500",
          iconColor: "text-red-600 dark:text-red-500",
          progress: "bg-red-500",
        };
      case "warning":
        return {
          border: "border-l-amber-500",
          iconColor: "text-amber-600 dark:text-amber-500",
          progress: "bg-amber-500",
        };
      case "info":
      default:
        return {
          border: "border-l-blue-500",
          iconColor: "text-blue-600 dark:text-blue-500",
          progress: "bg-blue-500",
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={`
        pointer-events-auto w-96 bg-white dark:bg-gray-800 
        rounded-lg border border-gray-200 dark:border-gray-700 
        border-l-4 ${colors.border}
        shadow-lg 
        transition-all duration-300 ease-out
        ${isExiting ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"}
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${colors.iconColor}`}>{getIcon()}</div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
              {toast.title}
            </h4>
            {toast.message && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {toast.message}
              </p>
            )}

            {toast.action && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAction}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  {toast.action}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </button>
        </div>
      </div>

      {toast.duration > 0 && !toast.action && (
        <div className="h-1 bg-gray-100 dark:bg-gray-700">
          <div
            className={`h-full ${colors.progress} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Demo Component
export default function ToastDemo() {
  return (
    <ToastProvider>
      <DemoContent />
    </ToastProvider>
  );
}

function DemoContent() {
  const toast = useToast();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Toast Notifications
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Try the toasts
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                toast.success(
                  "Success",
                  "Your changes have been saved successfully."
                )
              }
              className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Show Success
            </button>

            <button
              onClick={() =>
                toast.error("Error", "Something went wrong. Please try again.")
              }
              className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Show Error
            </button>

            <button
              onClick={() =>
                toast.warning(
                  "Warning",
                  "Please review your settings before continuing."
                )
              }
              className="px-4 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
            >
              Show Warning
            </button>

            <button
              onClick={() =>
                toast.info(
                  "Info",
                  "New updates are available for your application."
                )
              }
              className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Show Info
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() =>
                toast.showToast({
                  type: "info",
                  title: "Confirm Action",
                  message: "Are you sure you want to proceed with this action?",
                  action: "Confirm",
                  duration: 0,
                  onAction: () => console.log("Confirmed"),
                  onCancel: () => console.log("Cancelled"),
                })
              }
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Show Toast with Actions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
