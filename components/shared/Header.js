import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

/**
 * Header component for consistent page headers
 * Props:
 * - title: string | ReactNode
 * - stats: ReactNode (optional)
 * - onBack: function (optional)
 * - actions: ReactNode (optional)
 * - children: ReactNode (optional, for extra content)
 * - showStatsCards: boolean (optional, shows stats cards below header)
 * - statsCards: array (optional, array of stat card objects)
 */
export default function Header({ title, stats, onBack, actions, children, showStatsCards = false, statsCards = [] }) {
  return (
    <>
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 mb-4">
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
      
      {/* Optional Stats Cards */}
      {showStatsCards && statsCards.length > 0 && (
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {statsCards.map((stat, i) => {
              // Define gradient mappings for each color
              const gradientMap = {
                blue: "from-blue-500/10 to-blue-600/10",
                green: "from-emerald-500/10 to-emerald-600/10",
                emerald: "from-emerald-500/10 to-emerald-600/10",
                orange: "from-orange-500/10 to-orange-600/10",
                amber: "from-amber-500/10 to-amber-600/10",
                red: "from-red-500/10 to-red-600/10",
                purple: "from-purple-500/10 to-purple-600/10",
              };

              // Define icon background mappings
              const iconBgMap = {
                blue: "bg-blue-500",
                green: "bg-emerald-500",
                emerald: "bg-emerald-500",
                orange: "bg-orange-500",
                amber: "bg-amber-500",
                red: "bg-red-500",
                purple: "bg-purple-500",
              };

              const bgGradient = gradientMap[stat.color] || "from-gray-500/10 to-gray-600/10";
              const iconBg = iconBgMap[stat.color] || "bg-gray-500";
              
              return (
                <Card
                  key={i}
                  className="relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-50`}
                  ></div>
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shadow-lg shadow-${stat.color}-500/20`}
                      >
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <stat.trend className="w-5 h-5 text-slate-400 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}