"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react";

export function GridView({ 
  items, 
  renderCard, 
  onItemClick,
  className = "",
  emptyState 
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {items.length > 0 ? (
        items.map((item) => renderCard(item))
      ) : (
        emptyState || (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-slate-400">No items found</p>
          </div>
        )
      )}
    </div>
  );
}

export function GridCard({ 
  children, 
  onClick, 
  className = "",
  dropdownItems = []
}) {
  return (
    <Card
      className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-200 group cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="p-6">
        {children}
        
        {dropdownItems.length > 0 && (
          <div className="absolute top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {dropdownItems.map((item, i) => (
                  <DropdownMenuItem 
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onClick?.();
                    }}
                    className={item.className}
                  >
                    {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </Card>
  );
}

export function GridCardHeader({ icon, title, subtitle, className = "" }) {
  return (
    <div className={`flex items-center space-x-3 mb-4 ${className}`}>
      {icon && (
        <div className="flex-shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1 truncate">
          {title}
        </h3>
        {subtitle && (
          <p className="text-gray-500 dark:text-slate-400 text-sm truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export function GridCardSection({ children, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {children}
    </div>
  );
}

export function GridCardItem({ icon, label, value, className = "" }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {icon && (
        <div className="flex-shrink-0 text-gray-400">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{label}</p>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {value}
        </div>
      </div>
    </div>
  );
}

export function GridCardFooter({ children, className = "" }) {
  return (
    <div className={`mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 ${className}`}>
      {children}
    </div>
  );
}