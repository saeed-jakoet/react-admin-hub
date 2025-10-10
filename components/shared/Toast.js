"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const showToast = React.useCallback((options) => {
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
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

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
    <>
      {/* Blurred overlay only when toast is open */}
      {toasts.length > 0 && (
        <div
          className="fixed inset-0 bg-transparent backdrop-blur-sm transition-all duration-300 pointer-events-none"
          style={{ zIndex: 2147483646 }}
        />
      )}
      <div 
        className="fixed top-0 left-0 right-0 flex items-start justify-center pointer-events-none" 
        style={{ 
          zIndex: 2147483647,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <div className="flex flex-col gap-3">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </div>
      </div>
    </>,
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
          bg: "bg-white dark:bg-slate-900",
          border: "border-emerald-200 dark:border-emerald-800",
          iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          progress: "bg-emerald-500",
        };
      case "error":
        return {
          bg: "bg-white dark:bg-slate-900",
          border: "border-red-200 dark:border-red-800",
          iconBg: "bg-red-50 dark:bg-red-900/20",
          iconColor: "text-red-600 dark:text-red-400",
          progress: "bg-red-500",
        };
      case "warning":
        return {
          bg: "bg-white dark:bg-slate-900",
          border: "border-amber-200 dark:border-amber-800",
          iconBg: "bg-amber-50 dark:bg-amber-900/20",
          iconColor: "text-amber-600 dark:text-amber-400",
          progress: "bg-amber-500",
        };
      case "info":
      default:
        return {
          bg: "bg-white dark:bg-slate-900",
          border: "border-blue-200 dark:border-blue-800",
          iconBg: "bg-blue-50 dark:bg-blue-900/20",
          iconColor: "text-blue-600 dark:text-blue-400",
          progress: "bg-blue-500",
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={
        `${colors.bg} ${colors.border} pointer-events-auto w-96 rounded-xl border shadow-lg overflow-hidden transition-all duration-200 ` +
        (isExiting
          ? "opacity-0 scale-95"
          : "opacity-100 scale-100"
        )
      }
      style={{
        backgroundColor: 'white',
        opacity: 1,
        zIndex: 2147483647,
        transformOrigin: 'center',
        transitionProperty: 'opacity, transform',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDuration: '200ms',
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`${colors.iconBg} ${colors.iconColor} rounded-lg p-2 flex-shrink-0`}>
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
              {toast.title}
            </h4>
            {toast.message && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {toast.message}
              </p>
            )}

            {toast.action && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleAction}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs"
                >
                  {toast.action}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-8 px-3 text-xs"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {toast.duration > 0 && !toast.action && (
        <div className="h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full ${colors.progress} transition-all duration-50 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
