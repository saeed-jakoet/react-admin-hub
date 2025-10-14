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
  Filter,
  Search,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { get } from "@/lib/api/fetcher";
import { getDropCableStatusColor } from "@/lib/utils/dropCableColors";

export default function TechnicianDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // Redirect non-technicians
    if (user && user.role !== "technician") {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profileData?.id) {
      fetchOrders();
    }
  }, [profileData]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch orders assigned to this technician
      const response = await get(`/drop-cable/technician/${profileData.id}`);
      if (response?.status === "success") {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await get("/staff/me");
      if (response?.status === "success") {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

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

  const getStatusBadge = (status) => {
    const colors = getDropCableStatusColor(status);
    return colors;
  };

  const todayOrders = filteredOrders.filter((order) => {
    const today = new Date().toDateString();
    return (
      new Date(order.installation_scheduled_date).toDateString() === today ||
      new Date(order.survey_scheduled_date).toDateString() === today
    );
  });

  const upcomingOrders = filteredOrders.filter((order) => {
    const today = new Date();
    const orderDate = new Date(
      order.installation_scheduled_date || order.survey_scheduled_date
    );
    return orderDate > today;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white dark:text-gray-900" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                  {profileData?.first_name || "Technician"} {profileData?.surname || ""}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {orders.length} Active {orders.length === 1 ? "Order" : "Orders"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {showProfile ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-900 dark:bg-white rounded-lg p-3 border border-gray-200 dark:border-gray-800">
              <div className="text-2xl font-bold text-white dark:text-gray-900">{todayOrders.length}</div>
              <div className="text-xs text-gray-400 dark:text-gray-600 font-medium mt-1">Today</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingOrders.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Upcoming</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{filteredOrders.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Total</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-1 focus:ring-gray-900 dark:focus:ring-white"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {[
              { value: "all", label: "All" },
              { value: "survey_scheduled", label: "Survey" },
              { value: "installation_scheduled", label: "Install" },
              { value: "installation_completed", label: "Completed" },
              { value: "on_hold", label: "On Hold" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === filter.value
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Drawer */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Profile
              </h2>
              <button
                onClick={() => setShowProfile(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Info */}
              <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="w-16 h-16 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-white dark:text-gray-900" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {profileData?.first_name} {profileData?.surname}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {profileData?.position || "Technician"}
                </p>
                <div className="inline-block mt-3 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 rounded">
                  {profileData?.role?.replace("_", " ") || "Technician"}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</p>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white pl-6">
                    {profileData?.email || "N/A"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone</p>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white pl-6">
                    {profileData?.phone_number || "N/A"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Hire Date</p>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white pl-6">
                    {profileData?.hire_date
                      ? new Date(profileData.hire_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full h-10 gap-2 text-sm border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="p-4 space-y-6">
        {todayOrders.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-900 dark:text-white" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                Today's Orders
              </h2>
            </div>
            <div className="space-y-2">
              {todayOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {upcomingOrders.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-900 dark:text-white" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                Upcoming Orders
              </h2>
            </div>
            <div className="space-y-2">
              {upcomingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {filteredOrders.filter(
          (o) => !todayOrders.includes(o) && !upcomingOrders.includes(o)
        ).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-gray-900 dark:text-white" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                All Orders
              </h2>
            </div>
            <div className="space-y-2">
              {filteredOrders
                .filter((o) => !todayOrders.includes(o) && !upcomingOrders.includes(o))
                .map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
            </div>
          </div>
        )}

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              No orders found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "You don't have any assigned orders yet"}
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
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
      onClick={() => router.push(`/clients/${order.client_id}/drop_cable`)}
      className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-white transition-all cursor-pointer active:scale-[0.99]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {order.circuit_number}
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColors}`}>
              {order.status?.replace(/_/g, " ") || "Pending"}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 font-medium">
            {order.site_b_name}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
      </div>

      <div className="space-y-2">
        {order.client && (
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {order.client}
            </span>
          </div>
        )}

        {order.physical_address_site_b && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {order.physical_address_site_b}
            </span>
          </div>
        )}

        {scheduledDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-900 dark:text-white font-medium">
              {new Date(scheduledDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {scheduledTime && ` · ${scheduledTime}`}
            </span>
          </div>
        )}

        {order.end_client_contact_phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <a
              href={`tel:${order.end_client_contact_phone}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-gray-900 dark:text-white hover:underline font-medium"
            >
              {order.end_client_contact_phone}
            </a>
          </div>
        )}
      </div>

      {order.notes && Array.isArray(order.notes) && order.notes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {order.notes[order.notes.length - 1]?.text}
          </p>
        </div>
      )}
    </Card>
  );
}
