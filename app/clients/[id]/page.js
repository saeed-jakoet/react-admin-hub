"use client";

import { useState, useEffect, useMemo, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Briefcase,
  CheckCircle,
  AlertTriangle,
  Activity,
  TrendingUp,
  Plus,
  Clock,
  ArrowRight,
  MoreVertical,
} from "lucide-react";
import { get, put } from "@/lib/api/fetcher";
import { Loader } from "@/components/shared/Loader";
import DocumentsTreeView from "@/components/shared/DocumentsTreeView";
import Header from "@/components/shared/Header";
import { useToast } from "@/components/shared/Toast";

export default function ClientDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { success, error } = useToast();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const localStorageKey = `client-${resolvedParams.id}-activeTab`;
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(localStorageKey);
      return stored || "overview";
    }
    return "overview";
  });

  // --- Logo state hooks (must be top-level) ---
  const logoExtensions = [".png", ".jpg", ".jpeg", ".svg"];
  const [logoError, setLogoError] = useState(false);
  const [currentLogoIdx, setCurrentLogoIdx] = useState(0);

  // Reset logo error/index when company changes
  useEffect(() => {
    setLogoError(false);
    setCurrentLogoIdx(0);
  }, [client?.company_name]);

  const setActiveTab = useCallback(
    (tab) => {
      setActiveTabState(tab);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(localStorageKey, tab);
      }
    },
    [localStorageKey]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(localStorageKey);
      if (stored && stored !== activeTab) {
        setActiveTabState(stored);
      }
    }
  }, [localStorageKey, activeTab]);

  const [dropCableJobs, setDropCableJobs] = useState([]);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const response = await get(`/client/${resolvedParams.id}`);
        setClient(response.data);
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching client:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDropCableJobs = async () => {
      try {
        const response = await get(`/drop-cable/client/${resolvedParams.id}`);
        setDropCableJobs(response.data || []);
      } catch (error) {
        console.error("Error fetching drop cable jobs:", error);
        setDropCableJobs([]);
      }
    };

    if (resolvedParams.id) {
      fetchClient();
      fetchDropCableJobs();
    }
  }, [resolvedParams.id]);

  const handleEdit = () => {
    setEditing(true);
    setFormData({ ...client });
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({ ...client });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Transform empty strings to null for optional fields
      const payload = { ...formData };
      Object.keys(payload).forEach(key => {
        if (payload[key] === "") {
          payload[key] = null;
        }
        // Ensure boolean fields are properly typed
        if (key === 'is_active') {
          payload[key] = Boolean(payload[key]);
        }
        // Trim string fields
        if (typeof payload[key] === 'string') {
          payload[key] = payload[key].trim();
        }
      });

      // Remove id from payload as it's already in the URL
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      const response = await put(`/client/${resolvedParams.id}`, payload);
      setClient(response.data);
      setEditing(false);
      success("Success", "Client updated successfully!");
    } catch (err) {
      console.error("Error updating client:", err);
      error("Error", "Failed to update client. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDropCableStatus = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const jobStats = useMemo(() => {
    const dropCableStatusCounts = dropCableJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    const jobCategories = [
      {
        name: "Drop Cable Installations",
        type: "drop_cable",
        totalCount: dropCableJobs.length,
        statusCounts: dropCableStatusCounts,
        icon: Activity,
        color: "blue",
      },
      {
        name: "Link Build",
        type: "link_build",
        totalCount: 0,
        statusCounts: {},
        icon: Activity,
        color: "purple",
      },
      {
        name: "Floating",
        type: "floating",
        totalCount: 0,
        statusCounts: {},
        icon: Activity,
        color: "green",
      },
      {
        name: "Civils (ADW)",
        type: "civils_adw",
        totalCount: 0,
        statusCounts: {},
        icon: Activity,
        color: "orange",
      },
      {
        name: "Access Build",
        type: "access_build",
        totalCount: 0,
        statusCounts: {},
        icon: Activity,
        color: "teal",
      },
      {
        name: "Root Build",
        type: "root_build",
        totalCount: 0,
        statusCounts: {},
        icon: Activity,
        color: "indigo",
      },
      {
        name: "Relocations",
        type: "relocations",
        totalCount: 0,
        statusCounts: {},
        icon: Activity,
        color: "pink",
      },
      {
        name: "Maintenance",
        type: "maintenance",
        totalCount: 0,
        statusCounts: {},
        icon: Activity,
        color: "red",
      },
    ];

    const totalDropCables = dropCableJobs.length;
    const completedDropCables =
      (dropCableStatusCounts.closed || 0) +
      (dropCableStatusCounts.installation_completed || 0);

    return {
      jobCategories,
      dropCableStatusCounts,
      totalDropCables,
      completedDropCables,
    };
  }, [dropCableJobs]);

  if (loading) {
    return <Loader variant="bars" text="Loading client data..." />;
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Client Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-md">
            The client you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
        <Button
          onClick={() => router.push("/clients")}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="h-full">
        {/* Modern Header with Glassmorphism Effect (using shared Header component) */}
        <Header
          title={client.company_name}
          subtitle={client.email}
          logo={(() => {
            const logoBase = client.company_name
              ? client.company_name.toLowerCase().replace(/[^a-z0-9]/g, "_")
              : "";
            const logoSrc = logoExtensions.map(
              (ext) => `/logos/${logoBase}_logo${ext}`
            );
            if (logoError || !client.company_name) {
              return {
                src: null,
                alt: `${client.company_name || "Client"} Logo`,
                fallbackIcon: User,
              };
            }
            return {
              src: logoSrc[currentLogoIdx],
              alt: `${client.company_name} Logo`,
              fallbackIcon: User,
              onError: () => {
                if (currentLogoIdx < logoSrc.length - 1) {
                  setCurrentLogoIdx(currentLogoIdx + 1);
                } else {
                  setLogoError(true);
                }
              },
            };
          })()}
          statusIndicator={client.is_active}
          badge={{
            label: client.is_active ? "Active" : "Inactive",
            active: client.is_active,
          }}
          actions={
            editing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 gap-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Client
                </Button>
              </>
            )
          }
          onBack={() => router.push("/clients")}
          tabs={[
            { id: "overview", label: "Overview", icon: User },
            { id: "projects", label: "Projects", icon: Briefcase },
            { id: "documents", label: "Documents", icon: FileText },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="p-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: "Total Jobs",
                value: jobStats.totalDropCables,
                icon: Briefcase,
                color: "blue",
                bgGradient: "from-blue-500/10 to-blue-600/10",
                iconBg: "bg-blue-500",
              },
              {
                label: "Completed",
                value: jobStats.completedDropCables,
                icon: CheckCircle,
                color: "emerald",
                bgGradient: "from-emerald-500/10 to-emerald-600/10",
                iconBg: "bg-emerald-500",
              },
              {
                label: "In Progress",
                value: jobStats.totalDropCables - jobStats.completedDropCables,
                icon: Clock,
                color: "amber",
                bgGradient: "from-amber-500/10 to-amber-600/10",
                iconBg: "bg-amber-500",
              },
              {
                label: "Success Rate",
                value: `${
                  jobStats.totalDropCables
                    ? Math.round(
                        (jobStats.completedDropCables /
                          jobStats.totalDropCables) *
                          100
                      )
                    : 0
                }%`,
                icon: TrendingUp,
                color: "purple",
                bgGradient: "from-purple-500/10 to-purple-600/10",
                iconBg: "bg-purple-500",
              },
            ].map((stat, i) => (
              <Card
                key={i}
                className="relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}
                ></div>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center shadow-lg shadow-${stat.color}-500/20`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Contact Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        label: "First Name",
                        field: "first_name",
                        value: client.first_name,
                        type: "text",
                        icon: User,
                      },
                      {
                        label: "Last Name",
                        field: "last_name",
                        value: client.last_name,
                        type: "text",
                        icon: User,
                      },
                      {
                        label: "Email",
                        field: "email",
                        value: client.email,
                        type: "email",
                        icon: Mail,
                        fullWidth: true,
                      },
                      {
                        label: "Phone",
                        field: "phone_number",
                        value: client.phone_number || "Not provided",
                        type: "tel",
                        icon: Phone,
                        fullWidth: true,
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`space-y-2 ${
                          item.fullWidth ? "md:col-span-2" : ""
                        }`}
                      >
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {item.label}
                        </Label>
                        {editing ? (
                          <Input
                            type={item.type}
                            value={formData[item.field] || ""}
                            onChange={(e) =>
                              handleInputChange(item.field, e.target.value)
                            }
                            placeholder={`Enter ${item.label.toLowerCase()}`}
                            className="border-slate-300 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                          />
                        ) : (
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <item.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                              <p className="text-slate-900 dark:text-white">
                                {item.value}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Company Information */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Company Details
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Company Name
                      </Label>
                      {editing ? (
                        <Input
                          value={formData.company_name || ""}
                          onChange={(e) =>
                            handleInputChange("company_name", e.target.value)
                          }
                          placeholder="Enter company name"
                          className="border-slate-300 dark:border-slate-700"
                        />
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="text-slate-900 dark:text-white">
                            {client.company_name || "Not specified"}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Address
                      </Label>
                      {editing ? (
                        <textarea
                          value={formData.address || ""}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          placeholder="Enter address"
                          className="w-full min-h-[100px] px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 dark:text-white resize-none"
                          rows={3}
                        />
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[100px]">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5" />
                            <p className="text-slate-900 dark:text-white">
                              {client.address || "Not provided"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Notes
                      </Label>
                      {editing ? (
                        <textarea
                          value={formData.notes || ""}
                          onChange={(e) =>
                            handleInputChange("notes", e.target.value)
                          }
                          placeholder="Add notes about this client"
                          className="w-full min-h-[100px] px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 dark:text-white resize-none"
                          rows={3}
                        />
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[100px]">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5" />
                            <p className="text-slate-900 dark:text-white">
                              {client.notes || "No notes available"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => setActiveTab("projects")}
                    >
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="flex-1 text-left">New Project</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => setActiveTab("documents")}
                    >
                      <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <span className="flex-1 text-left">View Documents</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <span className="flex-1 text-left">Send Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>

                {/* Account Information */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Account Info
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                        Status
                      </span>
                      <Badge
                        variant={client.is_active ? "default" : "secondary"}
                        className={
                          client.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : ""
                        }
                      >
                        {client.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                        Created
                      </span>
                      <span className="text-slate-900 dark:text-white text-sm">
                        {client.created_at
                          ? new Date(client.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                        Client ID
                      </span>
                      <code className="text-slate-900 dark:text-white font-mono text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                        {client.id}
                      </code>
                    </div>
                  </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        action: "Project status updated",
                        time: "2h ago",
                        type: "project",
                      },
                      {
                        action: "Document uploaded",
                        time: "1d ago",
                        type: "document",
                      },
                      {
                        action: "Meeting scheduled",
                        time: "3d ago",
                        type: "meeting",
                      },
                    ].map((activity, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                      >
                        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {activity.action}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {activity.time}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Order
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Track different types of work and installations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {jobStats.jobCategories.map((category, index) => (
                  <Card
                    key={index}
                    className={`p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all ${
                      category.totalCount > 0
                        ? "cursor-pointer hover:border-blue-300 dark:hover:border-blue-700"
                        : "opacity-60"
                    }`}
                    onClick={() => {
                      if (category.totalCount > 0) {
                        router.push(
                          `/clients/${resolvedParams.id}/${category.type}`
                        );
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 bg-${category.color}-50 dark:bg-${category.color}-900/10 rounded-xl flex items-center justify-center`}
                      >
                        <category.icon
                          className={`w-6 h-6 text-${category.color}-600 dark:text-${category.color}-400`}
                        />
                      </div>
                      {category.totalCount > 0 && (
                        <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
                      )}
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {category.name}
                      </h3>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {category.totalCount}
                      </p>
                    </div>

                    {category.totalCount > 0 ? (
                      <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                        {Object.entries(category.statusCounts).map(
                          ([status, count]) => (
                            <div
                              key={status}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-slate-600 dark:text-slate-400 text-xs">
                                {formatDropCableStatus(status)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {count}
                              </Badge>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800">
                        No jobs in this category
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <DocumentsTreeView clientId={resolvedParams.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
