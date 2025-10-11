import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

/**
 * Header component for consistent page headers
 * Props:
 * - title: string | ReactNode
 * - stats: ReactNode (optional)
 * - onBack: function (optional)
 * - actions: ReactNode (optional)
 * - children: ReactNode (optional, for extra content)
 */
export default function Header({ title, stats, onBack, actions, children }) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h1>
              {stats && <div className="flex items-center gap-3 text-sm">{stats}</div>}
              {children}
            </div>
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
