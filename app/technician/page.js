"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User,
  LogOut,
  Package,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Search,
  Menu,
  X,
  Building2,
  ChevronRight,
  ArrowLeft,
  Briefcase,
  CheckCircle2
} from "lucide-react";
import { get } from "@/lib/api/fetcher";
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
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
                    {profileData?.first_name || "Technician"}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {orders.length} active assignment{orders.length !== 1 ? 's' : ''}
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

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <Input
                placeholder="Search by company, circuit, or site..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 pb-4 flex gap-2 overflow-x-auto hide-scrollbar">
            {[
              { value: "all", label: "All", icon: Package },
              { value: "survey_scheduled", label: "Survey", icon: MapPin },
              { value: "installation_scheduled", label: "Install", icon: Briefcase },
              { value: "installation_completed", label: "Done", icon: CheckCircle2 },
            ].map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    statusFilter === filter.value
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile Drawer */}
      {showProfile && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/50 z-40"
            onClick={() => setShowProfile(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 shadow-2xl overflow-y-auto safe-bottom">
            <div className="p-6 pb-safe">
              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-6 right-6 w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <div className="pt-8 pb-20 space-y-6">
                {/* Profile Header */}
                <div className="text-center pb-6 border-b border-gray-200">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {profileData?.first_name} {profileData?.surname}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3">{profileData?.position || "Field Technician"}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-green-700">Active</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {orders.length}
                    </div>
                    <div className="text-sm text-blue-700">Active Assignments</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact Information
                  </h3>
                  
                  <div className="space-y-3">
                    {profileData?.email && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Email</p>
                          <p className="text-sm text-gray-900 font-medium truncate">
                            {profileData.email}
                          </p>
                        </div>
                      </div>
                    )}

                    {profileData?.phone_number && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Phone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {profileData.phone_number}
                          </p>
                        </div>
                      </div>
                    )}

                    {profileData?.hire_date && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Hired</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {new Date(profileData.hire_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full h-11 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Content Area */}
      <div className="pt-56 pb-8 px-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <EmptyState message="No orders found" />
          )}
        </div>
      </div>

      <style jsx global>{`
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
                {order.client || order.clients?.company_name || "Unknown Client"}
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
          <span className={`text-xs px-2.5 py-1 rounded-md font-semibold uppercase ${statusColors}`}>
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