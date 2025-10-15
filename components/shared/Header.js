import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

/**
 * Enhanced Header component for consistent page headers
 * Props:
 * - title: string | ReactNode
 * - subtitle: string | ReactNode (optional)
 * - stats: ReactNode (optional)
 * - onBack: function (optional)
 * - actions: ReactNode (optional)
 * - children: ReactNode (optional, for extra content)
 * - showStatsCards: boolean (optional, shows stats cards below header)
 * - statsCards: array (optional, array of stat card objects)
 *
 * NEW PROPS:
 * - logo: object (optional) - { src: string, alt: string, fallbackIcon: Component, onError: function }
 * - badge: object (optional) - { label: string, active: boolean, variant: string }
 * - statusIndicator: boolean (optional) - shows green/gray dot on logo
 * - tabs: array (optional) - [{ id, label, icon }]
 * - activeTab: string (optional) - current active tab id
 * - onTabChange: function (optional) - callback when tab changes
 */
export default function Header({
  title,
  subtitle,
  stats,
  onBack,
  actions,
  children,
  showStatsCards = false,
  statsCards = [],
  logo = null,
  badge = null,
  statusIndicator = false,
  tabs = [],
  activeTab = "",
  onTabChange = null,
}) {
  return (
    <>
      <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 mb-4">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 group"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
                </Button>
              )}

              <div className="flex items-center gap-4">
                {/* Optional Logo */}
                {logo && (
                  <div className="relative">
                    {logo.src ? (
                      <div className="w-16 h-16 flex items-center justify-center">
                        <Image
                          src={logo.src}
                          alt={logo.alt || "Logo"}
                          width={56}
                          height={56}
                          style={{ objectFit: "contain" }}
                          priority
                          onError={logo.onError}
                        />
                      </div>
                    ) : logo.fallbackIcon ? (
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <logo.fallbackIcon className="w-8 h-8 text-white" />
                      </div>
                    ) : null}

                    {/* Status Indicator */}
                    {statusIndicator !== false && (
                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 ${
                          statusIndicator ? "bg-emerald-500" : "bg-slate-400"
                        } rounded-full border-4 border-white dark:border-slate-900`}
                      ></div>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                    {title}
                  </h1>

                  {/* Subtitle or Stats */}
                  {(subtitle || stats || badge) && (
                    <div className="flex items-center gap-3 text-sm">
                      {subtitle && (
                        <span className="text-slate-600 dark:text-slate-400">
                          {subtitle}
                        </span>
                      )}
                      {stats}
                      {badge && (
                        <>
                          {(subtitle || stats) && (
                            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                          )}
                          <Badge
                            variant={badge.active ? "default" : "secondary"}
                            className={`${
                              badge.active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                            } font-medium`}
                          >
                            {badge.label}
                          </Badge>
                        </>
                      )}
                    </div>
                  )}
                  {children}
                </div>
              </div>
            </div>

            {actions && (
              <div className="flex items-center gap-3">{actions}</div>
            )}
          </div>
        </div>

        {/* Optional Tab Navigation */}
        {tabs.length > 0 && (
          <div className="px-8">
            <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange && onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    } rounded-t-lg`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Optional Stats Cards */}
      {showStatsCards && statsCards.length > 0 && (
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {statsCards.map((stat, i) => {
              const gradientMap = {
                blue: "from-blue-500/10 to-blue-600/10",
                green: "from-emerald-500/10 to-emerald-600/10",
                emerald: "from-emerald-500/10 to-emerald-600/10",
                orange: "from-orange-500/10 to-orange-600/10",
                amber: "from-amber-500/10 to-amber-600/10",
                red: "from-red-500/10 to-red-600/10",
                purple: "from-purple-500/10 to-purple-600/10",
              };

              const iconBgMap = {
                blue: "bg-blue-500",
                green: "bg-emerald-500",
                emerald: "bg-emerald-500",
                orange: "bg-orange-500",
                amber: "bg-amber-500",
                red: "bg-red-500",
                purple: "bg-purple-500",
              };

              const bgGradient =
                gradientMap[stat.color] || "from-gray-500/10 to-gray-600/10";
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
