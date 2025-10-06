"use client";

import * as React from "react";

/**
 * Modern animated loader with multiple variants
 *
 * @param {Object} props
 * @param {string} props.variant - Loader style: "spinner", "dots", "pulse", "bars" (default: "spinner")
 * @param {string} props.size - Size variant: "sm", "md", "lg" (default: "md")
 * @param {string} props.text - Optional loading text
 * @param {boolean} props.fullScreen - Whether to show as full screen loader
 */
export function Loader({
  variant = "spinner",
  size = "md",
  text,
  fullScreen = false,
}) {
  const sizeMap = {
    sm: { container: 32, spinner: 24, dots: 8, bars: 16 },
    md: { container: 48, spinner: 36, dots: 12, bars: 24 },
    lg: { container: 64, spinner: 48, dots: 16, bars: 32 },
  };

  const dimensions = sizeMap[size];

  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    : "flex items-center justify-center h-full min-h-[400px]";

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return <DotsLoader size={dimensions.dots} />;
      case "pulse":
        return <PulseLoader size={dimensions.spinner} />;
      case "bars":
        return <BarsLoader size={dimensions.bars} />;
      case "spinner":
      default:
        return <SpinnerLoader size={dimensions.spinner} />;
    }
  };

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        {renderLoader()}
        {text && (
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Gradient spinner loader
 */
function SpinnerLoader({ size }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="animate-spin"
        viewBox="0 0 50 50"
        style={{ width: size, height: size }}
      >
        <defs>
          <linearGradient
            id="spinnerGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="hsl(var(--primary))"
              stopOpacity="0.2"
            />
            <stop
              offset="50%"
              stopColor="hsl(var(--primary))"
              stopOpacity="0.8"
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--primary))"
              stopOpacity="1"
            />
          </linearGradient>
        </defs>
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="url(#spinnerGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="31.415, 31.415"
          transform="rotate(-90 25 25)"
        />
      </svg>
      <div
        className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse"
        style={{ width: size * 0.6, height: size * 0.6, margin: "auto" }}
      />
    </div>
  );
}

/**
 * Bouncing dots loader
 */
function DotsLoader({ size }) {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="rounded-full bg-primary animate-bounce"
          style={{
            width: size,
            height: size,
            animationDelay: `${index * 0.15}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Pulsing rings loader
 */
function PulseLoader({ size }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="absolute inset-0 rounded-full border-4 border-primary animate-ping"
          style={{
            animationDelay: `${index * 0.3}s`,
            animationDuration: "1.5s",
            opacity: 0.6 - index * 0.2,
          }}
        />
      ))}
      <div
        className="absolute inset-0 rounded-full bg-primary/30 blur-lg"
        style={{ margin: size * 0.15 }}
      />
    </div>
  );
}

/**
 * Animated bars loader
 */
function BarsLoader({ size }) {
  const barCount = 5;
  const barWidth = size / (barCount * 2);

  return (
    <div className="flex items-end gap-1" style={{ height: size }}>
      {Array.from({ length: barCount }).map((_, index) => (
        <div
          key={index}
          className="bg-primary rounded-full animate-pulse"
          style={{
            width: barWidth,
            height: size,
            animationDelay: `${index * 0.1}s`,
            animationDuration: "0.8s",
            transformOrigin: "bottom",
            animation: `barScale 0.8s ease-in-out ${index * 0.1}s infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes barScale {
          0%,
          100% {
            transform: scaleY(0.3);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Inline loader for buttons and small spaces
 */
export function InlineLoader({
  variant = "spinner",
  size = "sm",
  className = "",
}) {
  const sizeMap = {
    xs: 12,
    sm: 16,
    md: 20,
  };

  const loaderSize = sizeMap[size];

  if (variant === "dots") {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="rounded-full bg-current animate-bounce"
            style={{
              width: loaderSize / 3,
              height: loaderSize / 3,
              animationDelay: `${index * 0.15}s`,
              animationDuration: "0.6s",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <svg
      className={`animate-spin ${className}`}
      width={loaderSize}
      height={loaderSize}
      viewBox="0 0 50 50"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="31.415, 31.415"
        strokeDashoffset="0"
        opacity="0.25"
      />
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="31.415, 31.415"
        strokeDashoffset="10"
        transform="rotate(-90 25 25)"
      />
    </svg>
  );
}

/**
 * Skeleton loader for content placeholders
 */
export function SkeletonLoader({
  count = 1,
  height = "h-4",
  variant = "default",
}) {
  if (variant === "card") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-card p-6 space-y-3">
            <div className="h-6 bg-muted rounded-lg w-3/4 animate-pulse" />
            <div
              className="h-4 bg-muted rounded-lg w-full animate-pulse"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="h-4 bg-muted rounded-lg w-5/6 animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex gap-4 items-center">
            <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded-lg w-1/4 animate-pulse" />
              <div
                className="h-3 bg-muted rounded-lg w-1/3 animate-pulse"
                style={{ animationDelay: "0.1s" }}
              />
            </div>
            <div
              className="h-8 w-20 bg-muted rounded-lg animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-gradient-to-r from-muted via-muted/50 to-muted rounded-lg animate-shimmer bg-[length:200%_100%]`}
          style={{
            width: `${Math.random() * 30 + 70}%`,
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}

/**
 * Page loading component with progress
 */
export function PageLoader({ progress }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-50">
      <div className="text-center space-y-6 max-w-sm px-6">
        <SpinnerLoader size={64} />

        {progress !== undefined && (
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {progress}% complete
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
