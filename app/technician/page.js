"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card } from "@/components/ui/card";
import {
  User,
  LogOut,
  Package,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Menu,
  X,
  Building2,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import { get, post } from "@/lib/api/fetcher";
import { getDropCableStatusColor } from "@/lib/utils/dropCableColors";
import { Loader } from "@/components/shared/Loader";

export default function TechnicianDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Redirect if not technician
  useEffect(() => {
    if (user && user.role !== "technician") {
      router.push("/");
    }
  }, [user, router]);

  // Fetch profile once when user is available
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await get("/staff/me");
        console.log("Profile response:", response);
        if (response?.status === "success") {
          setProfileData(response.data);
          console.log("Profile data set:", response.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };

    if (user?.id && !profileData) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Fetch orders once when profile is loaded
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log("Fetching orders for technician ID:", profileData.id);
        const response = await get(`/drop-cable/technician/${profileData.id}`);
        console.log("Orders response:", response);
        if (response?.status === "success") {
          setOrders(response.data || []);
          console.log("Orders set:", response.data?.length || 0, "items");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (profileData?.id) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData?.id]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    try {
      setPasswordLoading(true);
      // Use BFF via provider: baseURL is /api/bff, so this targets /api/bff/auth/change-password
      const data = await post("/auth/change-password", {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      if (data && data.status === "success") {
        setPasswordSuccess("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setShowPasswordSection(false);
          setPasswordSuccess("");
        }, 2000);
      } else {
        setPasswordError(data?.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordError("An error occurred. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.circuit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.site_b_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader variant="bars" size="lg" text="Loading your assignments..." />
      </div>
    );
  }

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
              {/* Top Bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-sm font-semibold text-gray-900">
                      {(() => {
                        const saTime = dayjs().tz("Africa/Johannesburg");
                        const hour = saTime.hour();
                        let greeting = "Good morning";
                        if (hour >= 12 && hour < 17) greeting = "Good afternoon";
                        else if (hour >= 17 || hour < 5) greeting = "Good evening";
                        return `${greeting}, ${profileData?.first_name || "Technician"}`;
                      })()}
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                      {orders.length} active assignment
                      {orders.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="w-10 h-10 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Menu className="w-5 h-5 text-blue-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Drawer */}
        {showProfile && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setShowProfile(false)}
            />
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 shadow-2xl overflow-y-auto">
              <div className="min-h-full flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Profile
                  </h2>
                  <button
                    onClick={() => setShowProfile(false)}
                    className="w-9 h-9 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 py-6 space-y-6">
                  {/* Profile Section */}
                  <div className="text-center pb-6 border-b border-gray-100">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {profileData?.first_name} {profileData?.surname}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {profileData?.position || "Field Technician"}
                    </p>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Contact Details
                    </h4>

                    {profileData?.email && (
                      <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Email</p>
                          <p className="text-sm text-gray-900 break-words">
                            {profileData.email}
                          </p>
                        </div>
                      </div>
                    )}

                    {profileData?.phone_number && (
                      <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                          <p className="text-sm text-gray-900">
                            {profileData.phone_number}
                          </p>
                        </div>
                      </div>
                    )}

                    {profileData?.hire_date && (
                      <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Joined</p>
                          <p className="text-sm text-gray-900">
                            {new Date(profileData.hire_date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Security Section */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Security
                    </h4>

                    {!showPasswordSection ? (
                      <button
                        onClick={() => setShowPasswordSection(true)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                      >
                        <Lock className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">
                            Change Password
                          </p>
                          <p className="text-xs text-gray-500">
                            Update your password
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    ) : (
                      <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium text-gray-900">
                            Change Password
                          </h5>
                          <button
                            onClick={() => {
                              setShowPasswordSection(false);
                              setPasswordError("");
                              setPasswordSuccess("");
                              setPasswordData({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                              });
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>

                        <form
                          onSubmit={handlePasswordChange}
                          className="space-y-3"
                        >
                          {/* Current Password */}
                          <div>
                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={
                                  showPasswords.current ? "text" : "password"
                                }
                                value={passwordData.currentPassword}
                                onChange={(e) =>
                                  setPasswordData({
                                    ...passwordData,
                                    currentPassword: e.target.value,
                                  })
                                }
                                className="w-full h-10 px-3 pr-10 text-slate-900 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter current password"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPasswords({
                                    ...showPasswords,
                                    current: !showPasswords.current,
                                  })
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPasswords.current ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* New Password */}
                          <div>
                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                  setPasswordData({
                                    ...passwordData,
                                    newPassword: e.target.value,
                                  })
                                }
                                className="w-full h-10 px-3 pr-10 text-slate-900 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter new password"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPasswords({
                                    ...showPasswords,
                                    new: !showPasswords.new,
                                  })
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPasswords.new ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Confirm Password */}
                          <div>
                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <input
                                type={
                                  showPasswords.confirm ? "text" : "password"
                                }
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                  setPasswordData({
                                    ...passwordData,
                                    confirmPassword: e.target.value,
                                  })
                                }
                                className="w-full h-10 px-3 pr-10 text-slate-900 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Confirm new password"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPasswords({
                                    ...showPasswords,
                                    confirm: !showPasswords.confirm,
                                  })
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPasswords.confirm ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Error/Success Messages */}
                          {passwordError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-xs text-red-700">
                                {passwordError}
                              </p>
                            </div>
                          )}
                          {passwordSuccess && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-xs text-green-700">
                                {passwordSuccess}
                              </p>
                            </div>
                          )}

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={passwordLoading}
                            className="w-full h-10 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {passwordLoading
                              ? "Updating..."
                              : "Update Password"}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer - Sign Out */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                  <button
                    onClick={handleLogout}
                    className="w-full h-11 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Content Area - Vertical Scroll Only */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-8">
          <div className="max-w-2xl mx-auto space-y-3 pt-2">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <EmptyState message="No orders found" />
            )}
          </div>
        </div>

        <style jsx global>{`
          /* Prevent zoom and horizontal scroll on the entire page */
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

          /* Safe area for mobile devices */
          @supports (padding-bottom: env(safe-area-inset-bottom)) {
            .safe-bottom {
              padding-bottom: calc(env(safe-area-inset-bottom) + 1rem);
            }
            .pb-safe {
              padding-bottom: calc(env(safe-area-inset-bottom) + 1.5rem);
            }
          }
        `}</style>
      </div>
    </>
  );
}

function OrderCard({ order }) {
  const router = useRouter();
  const statusColors = getDropCableStatusColor(order.status || "");

  const scheduledDate =
    order.installation_scheduled_date || order.survey_scheduled_date;
  const scheduledTime =
    order.installation_scheduled_time || order.survey_scheduled_time;

  return (
    <Card
      onClick={() => router.push(`/technician/${order.id}`)}
      className="group p-4 bg-white border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer rounded-xl relative overflow-hidden"
    >
      {/* Blue accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-blue-700 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />

      <div className="pl-3">
        {/* Company Name - Most Prominent */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <h3 className="text-base font-bold text-gray-900 truncate">
                {order.client ||
                  order.clients?.company_name ||
                  "Unknown Client"}
              </h3>
            </div>
            {/* Circuit Number */}
            <p className="text-sm text-gray-600 font-medium">
              Circuit: {order.circuit_number || "N/A"}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
        </div>

        {/* Site B Name */}
        {order.site_b_name && (
          <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{order.site_b_name}</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-semibold uppercase ${statusColors}`}
          >
            {order.status?.replace(/_/g, " ") || "Pending"}
          </span>

          {scheduledDate && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium">
                {new Date(scheduledDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-white border border-neutral-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
        <Package className="w-7 h-7 text-neutral-400" />
      </div>
      <p className="text-neutral-600">{message}</p>
    </div>
  );
}
