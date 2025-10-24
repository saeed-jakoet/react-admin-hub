"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, FileText, CheckCircle, ChevronRight } from "lucide-react";

export default function TechnicianOrderOptionsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params || { id: "12345" };

  const options = [
    {
      title: "View Planning Document",
      description: "Access installation planning and technical specifications",
      icon: FileText,
      disabled: false,
      action: () => router.push(`/technician/order/${id}/planning`),
      gradient: "from-purple-600 to-purple-700",
    },
    {
      title: "View Client Satisfaction Letter",
      description: "Click to open happy letter.",
      icon: CheckCircle,
      disabled: false,
      action: () => router.push(`/technician/order/${id}/happy-letter`),
      gradient: "from-blue-600 to-blue-700",
    },
  ];

  return (
    <>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      />
      <div className="fixed inset-0 flex flex-col bg-gray-50 overflow-hidden touch-pan-y">
        {/* Header */}
        <div className="flex-shrink-0 px-4 pt-4 pb-2">
          <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4">
              {/* Back Button and Title */}
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => router.back()}
                  className="w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-gray-900">
                    Order Actions
                  </h1>
                  <p className="text-sm text-gray-500">
                    Choose what you want to view for this order
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-8">
          <div className="max-w-2xl mx-auto space-y-3 pt-2">
            {options.map((option, index) => (
              <OptionCard key={index} option={option} />
            ))}
          </div>
        </div>

        <style jsx global>{`
          html,
          body {
            touch-action: pan-y pinch-zoom;
            overscroll-behavior-x: none;
            overflow-x: hidden;
          }

          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          @supports (padding-bottom: env(safe-area-inset-bottom)) {
            .safe-bottom {
              padding-bottom: calc(env(safe-area-inset-bottom) + 1rem);
            }
          }
        `}</style>
      </div>
    </>
  );
}

function OptionCard({ option }) {
  const Icon = option.icon;
  const isDisabled = option.disabled;

  return (
    <div
      onClick={!isDisabled ? option.action : undefined}
      className={`group p-4 bg-white border border-gray-200 rounded-xl relative overflow-hidden transition-all ${
        isDisabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:border-blue-400 hover:shadow-lg cursor-pointer"
      }`}
    >
      {/* Blue accent bar - only show on hover for enabled items */}
      {!isDisabled && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-blue-700 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
      )}

      <div className="pl-3">
        <div className="flex items-start justify-between gap-4">
          {/* Icon and Content */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Icon Circle */}
            <div
              className={`w-12 h-12 bg-gradient-to-br ${option.gradient} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="text-base font-bold text-gray-900 mb-1">
                {option.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {option.description}
              </p>

              {/* Disabled Reason */}
              {isDisabled && option.disabledReason && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 italic">
                    {option.disabledReason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chevron - only show for enabled items */}
          {!isDisabled && (
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-3" />
          )}
        </div>
      </div>
    </div>
  );
}
