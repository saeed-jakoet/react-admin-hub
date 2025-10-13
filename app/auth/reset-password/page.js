"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Lock, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { post } from "@/lib/api/fetcher";

function ResetPasswordPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Supabase may send access_token as hash fragment (#access_token=...) or as query (?access_token=...)
    let t = searchParams.get("access_token") || searchParams.get("token");
    if (!t && typeof window !== "undefined") {
      const hash = window.location.hash?.startsWith("#")
        ? window.location.hash.substring(1)
        : "";
      if (hash) {
        const h = new URLSearchParams(hash);
        t = h.get("access_token") || h.get("token") || t;
      }
    }
    if (t) setToken(t);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Missing token. Please use the link from your email.");
      return;
    }

    setSubmitting(true);
    try {
      await post("/auth/reset-password", { token, new_password: password });
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1426] relative overflow-hidden">
      {/* Enhanced Network Background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-40">
          <defs>
            <pattern
              id="fiber-network"
              x="0"
              y="0"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="30" cy="30" r="2" fill="#264C92" opacity="0.8">
                <animate
                  attributeName="opacity"
                  values="0.3;1;0.3"
                  dur="4s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="r"
                  values="2;3;2"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="90" cy="40" r="1.5" fill="#07B857" opacity="0.7">
                <animate
                  attributeName="opacity"
                  values="0.4;0.9;0.4"
                  dur="3s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="r"
                  values="1.5;2.5;1.5"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="60" cy="80" r="2.5" fill="#F60100" opacity="0.6">
                <animate
                  attributeName="opacity"
                  values="0.2;0.8;0.2"
                  dur="3.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="r"
                  values="2.5;3.5;2.5"
                  dur="3.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="20" cy="90" r="1.8" fill="#F5B800" opacity="0.5">
                <animate
                  attributeName="opacity"
                  values="0.3;0.7;0.3"
                  dur="2.8s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="r"
                  values="1.8;2.8;1.8"
                  dur="2.8s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Animated connection lines with pulse effect */}
              <line
                x1="30"
                y1="30"
                x2="90"
                y2="40"
                stroke="url(#connectionGradient1)"
                strokeWidth="1"
                opacity="0.4"
              >
                <animate
                  attributeName="opacity"
                  values="0.1;0.8;0.1"
                  dur="4s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-width"
                  values="1;2;1"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </line>
              <line
                x1="90"
                y1="40"
                x2="60"
                y2="80"
                stroke="url(#connectionGradient2)"
                strokeWidth="1"
                opacity="0.3"
              >
                <animate
                  attributeName="opacity"
                  values="0.1;0.7;0.1"
                  dur="3.5s"
                  repeatCount="indefinite"
                  begin="1s"
                />
                <animate
                  attributeName="stroke-width"
                  values="1;2;1"
                  dur="3.5s"
                  repeatCount="indefinite"
                  begin="1s"
                />
              </line>
              <line
                x1="60"
                y1="80"
                x2="20"
                y2="90"
                stroke="url(#connectionGradient3)"
                strokeWidth="1"
                opacity="0.4"
              >
                <animate
                  attributeName="opacity"
                  values="0.1;0.6;0.1"
                  dur="3s"
                  repeatCount="indefinite"
                  begin="2s"
                />
                <animate
                  attributeName="stroke-width"
                  values="1;2;1"
                  dur="3s"
                  repeatCount="indefinite"
                  begin="2s"
                />
              </line>
              <line
                x1="20"
                y1="90"
                x2="30"
                y2="30"
                stroke="url(#connectionGradient4)"
                strokeWidth="1"
                opacity="0.3"
              >
                <animate
                  attributeName="opacity"
                  values="0.1;0.5;0.1"
                  dur="2.8s"
                  repeatCount="indefinite"
                  begin="1.5s"
                />
                <animate
                  attributeName="stroke-width"
                  values="1;2;1"
                  dur="2.8s"
                  repeatCount="indefinite"
                  begin="1.5s"
                />
              </line>

              {/* Cross connections for more dynamic feel */}
              <line
                x1="30"
                y1="30"
                x2="60"
                y2="80"
                stroke="url(#connectionGradient5)"
                strokeWidth="0.5"
                opacity="0.2"
              >
                <animate
                  attributeName="opacity"
                  values="0;0.4;0"
                  dur="5s"
                  repeatCount="indefinite"
                  begin="3s"
                />
              </line>
              <line
                x1="90"
                y1="40"
                x2="20"
                y2="90"
                stroke="url(#connectionGradient6)"
                strokeWidth="0.5"
                opacity="0.2"
              >
                <animate
                  attributeName="opacity"
                  values="0;0.3;0"
                  dur="4.5s"
                  repeatCount="indefinite"
                  begin="2.5s"
                />
              </line>

              {/* Data flow particles */}
              <circle r="1" fill="#264C92" opacity="0.8">
                <animateMotion dur="6s" repeatCount="indefinite">
                  <path d="M30,30 L90,40 L60,80 L20,90 Z" />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values="0;1;0"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="0.8" fill="#07B857" opacity="0.6">
                <animateMotion dur="7s" repeatCount="indefinite" begin="2s">
                  <path d="M90,40 L60,80 L20,90 L30,30 Z" />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values="0;1;0"
                  dur="7s"
                  repeatCount="indefinite"
                  begin="2s"
                />
              </circle>
            </pattern>

            {/* Gradient definitions for connection lines */}
            <linearGradient
              id="connectionGradient1"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#264C92" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#07B857" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient
              id="connectionGradient2"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#07B857" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#F60100" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient
              id="connectionGradient3"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#F60100" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#F5B800" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient
              id="connectionGradient4"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#F5B800" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#264C92" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient
              id="connectionGradient5"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#264C92" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F60100" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient
              id="connectionGradient6"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#07B857" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F5B800" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#fiber-network)" />
        </svg>

        {/* Enhanced floating particles with connection trails */}
        <div
          className="absolute top-20 left-20 w-2 h-2 rounded-full opacity-60"
          style={{ backgroundColor: "#264C92" }}
        >
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: "#264C92" }}
          ></div>
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{ backgroundColor: "#264C92" }}
          ></div>
        </div>
        <div
          className="absolute top-40 right-32 w-1 h-1 rounded-full opacity-50"
          style={{ backgroundColor: "#07B857" }}
        >
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: "#07B857", animationDelay: "1s" }}
          ></div>
        </div>
        <div
          className="absolute bottom-32 left-40 w-1.5 h-1.5 rounded-full opacity-40"
          style={{ backgroundColor: "#F60100" }}
        >
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: "#F60100", animationDelay: "2s" }}
          ></div>
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{ backgroundColor: "#F60100", animationDelay: "2s" }}
          ></div>
        </div>
        <div
          className="absolute bottom-20 right-20 w-1 h-1 rounded-full opacity-30"
          style={{ backgroundColor: "#F5B800" }}
        >
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: "#F5B800", animationDelay: "3s" }}
          ></div>
        </div>

        {/* Additional scattered connection points */}
        <div
          className="absolute top-1/3 left-1/3 w-1 h-1 rounded-full opacity-40 animate-pulse"
          style={{ backgroundColor: "#264C92", animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-2/3 right-1/3 w-0.5 h-0.5 rounded-full opacity-30 animate-ping"
          style={{ backgroundColor: "#07B857", animationDelay: "2.5s" }}
        ></div>
        <div
          className="absolute bottom-1/3 left-1/4 w-1 h-1 rounded-full opacity-35 animate-pulse"
          style={{ backgroundColor: "#F60100", animationDelay: "3.5s" }}
        ></div>
      </div>

      {/* Centered Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-8">
        <div className="w-full max-w-md text-center">
          {/* Logo and Branding - Centered Above Form */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-6 mb-8">
              <div className="relative w-20 h-20 bg-gradient-to-br from-[#264C92] to-[#1a3b73] rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo.svg"
                  alt="Fiber Africa"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-contain filter brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#264C92]/20 to-[#1a3b73]/20 rounded-3xl animate-pulse"></div>
              </div>
              <div className="text-left">
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-2 tracking-tight">
                  Fiber Africa
                </h1>
                <p className="font-semibold text-xl lg:text-2xl tracking-wider text-yellow-500">
                  WE DELIVER
                </p>
              </div>
            </div>

            {/* Subtitle */}
            <div className="max-w-md mx-auto mb-8">
              <p className="text-gray-300 text-lg mb-2">Set New Password</p>
              <p className="text-gray-400 text-sm">
                Enter your new password to secure your account
              </p>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl relative">
            {/* Subtle glow effect */}
            <div
              className="absolute -inset-1 rounded-3xl blur-lg opacity-50"
              style={{
                background:
                  "linear-gradient(to right, rgba(38, 76, 146, 0.2), rgba(148, 163, 184, 0.2))",
              }}
            ></div>

            <div className="relative">
              {success ? (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Password Updated
                    </h2>
                    <p className="text-slate-400 mb-6">
                      Your password has been successfully reset. Redirecting to
                      sign in...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Create New Password
                    </h2>
                    <div
                      className="inline-flex items-center px-4 py-2 rounded-full border"
                      style={{
                        backgroundColor: "#264C92/10",
                        borderColor: "#264C92/20",
                      }}
                    >
                      <span className="text-sm font-medium text-green-600">
                        🔒 Secure Reset
                      </span>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                      <p className="text-red-400 text-sm font-medium">
                        {error}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <div className="relative group">
                        <Lock
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors"
                          style={{
                            "--tw-text-opacity": "1",
                            color: "rgb(148 163 184 / var(--tw-text-opacity))",
                          }}
                        />
                        <style jsx>{`
                          .group:focus-within .lucide-lock {
                            color: #264c92 !important;
                          }
                        `}</style>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full pl-12 pr-12 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-opacity-50 transition-all"
                          style={{
                            "--tw-ring-color": "#264C92",
                            "--tw-border-color": "#264C92",
                          }}
                          placeholder="Enter new password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                          minLength={8}
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 ml-1">
                        Minimum 8 characters
                      </p>
                    </div>

                    <div>
                      <div className="relative group">
                        <Lock
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors"
                          style={{
                            "--tw-text-opacity": "1",
                            color: "rgb(148 163 184 / var(--tw-text-opacity))",
                          }}
                        />
                        <style jsx>{`
                          .group:focus-within .lucide-lock {
                            color: #264c92 !important;
                          }
                        `}</style>
                        <input
                          type={showConfirm ? "text" : "password"}
                          className="w-full pl-12 pr-12 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-opacity-50 transition-all"
                          style={{
                            "--tw-ring-color": "#264C92",
                            "--tw-border-color": "#264C92",
                          }}
                          placeholder="Confirm new password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          required
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          aria-label={showConfirm ? "Hide password" : "Show password"}
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showConfirm ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !token}
                      className="w-full text-white font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                      style={{
                        background:
                          "linear-gradient(to right, #264C92, #1a3b73)",
                        boxShadow: "0 10px 25px rgba(38, 76, 146, 0.25)",
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting && token) {
                          e.target.style.background =
                            "linear-gradient(to right, #1a3b73, #264C92)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!submitting && token) {
                          e.target.style.background =
                            "linear-gradient(to right, #264C92, #1a3b73)";
                        }
                      }}
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Updating Password...
                        </>
                      ) : !token ? (
                        "Link Expired"
                      ) : (
                        <>
                          <span>Update Password</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1426] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordPageInner />
    </Suspense>
  );
}
