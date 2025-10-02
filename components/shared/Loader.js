"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

/**
 * Reusable loading component
 *
 * @param {Object} props
 * @param {string} props.size - Size variant: "sm", "md", "lg" (default: "md")
 * @param {string} props.text - Optional loading text
 * @param {boolean} props.fullScreen - Whether to show as full screen loader
 */
export function Loader({ size = "md", text, fullScreen = false }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    : "flex items-center justify-center h-full min-h-[400px]";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Outer ring */}
          <div className={`${sizeClasses[size]} rounded-full border-4 border-muted`} />

          {/* Spinning inner ring */}
          <Loader2
            className={`${sizeClasses[size]} absolute top-0 left-0 animate-spin text-primary`}
            strokeWidth={2.5}
          />
        </div>

        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Inline loader for buttons and small spaces
 */
export function InlineLoader({ size = "sm", className = "" }) {
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
  };

  return (
    <Loader2
      className={`${sizeClasses[size]} animate-spin ${className}`}
      strokeWidth={2.5}
    />
  );
}

/**
 * Skeleton loader for content placeholders
 */
export function SkeletonLoader({ count = 1, height = "h-4" }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-muted rounded-lg`}
          style={{
            width: `${Math.random() * 30 + 70}%`,
          }}
        />
      ))}
    </div>
  );
}
