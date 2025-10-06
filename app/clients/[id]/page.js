"use client";

import * as React from "react";
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
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  TrendingUp,
  DollarSign,
  MoreVertical,
  Eye,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DocumentViewer from "@/components/clients/DocumentViewer";
import { get, put } from "@/lib/api/fetcher";
import { Loader } from "@/components/shared/Loader"; 

export default function ClientDetailPage({ params }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [client, setClient] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({});
  const [activeTab, setActiveTab] = React.useState("overview");

  // Drop cable jobs data
  const [dropCableJobs, setDropCableJobs] = React.useState([]);
  const [jobsLoading, setJobsLoading] = React.useState(false);

  React.useEffect(() => {
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
        setJobsLoading(true);
        const response = await get(`/drop-cable/client/${resolvedParams.id}`);
        setDropCableJobs(response.data || []);
      } catch (error) {
        console.error("Error fetching drop cable jobs:", error);
        setDropCableJobs([]);
      } finally {
        setJobsLoading(false);
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
      const response = await put(`/client/${resolvedParams.id}`, formData);
      setClient(response.data);
      setEditing(false);
    } catch (error) {
      console.error("Error updating client:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getDropCableStatusColor = (status) => {
    switch (status) {
      case "closed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "installation_completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "installation_scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "survey_scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "survey_completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "survey_required":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "awaiting_client_installation_date":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "lla_required":
      case "awaiting_lla_approval":
      case "lla_received":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "new":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getDropCableStatusIcon = (status) => {
    switch (status) {
      case "closed":
      case "installation_completed":
        return <CheckCircle className="w-4 h-4" />;
      case "installation_scheduled":
      case "survey_scheduled":
      case "survey_completed":
        return <Activity className="w-4 h-4" />;
      case "survey_required":
      case "awaiting_client_installation_date":
      case "new":
        return <Clock className="w-4 h-4" />;
      case "lla_required":
      case "awaiting_lla_approval":
      case "lla_received":
        return <FileText className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatDropCableStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const jobStats = React.useMemo(() => {
    // Drop cable status stats
    const dropCableStatusCounts = dropCableJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    // Job categories with their respective data
    const jobCategories = [
      { 
        name: "Drop Cable Installations", 
        type: "drop_cable",
        totalCount: dropCableJobs.length,
        statusCounts: dropCableStatusCounts,
        icon: Activity,
        color: "blue"
      },
      { 
        name: "Link Build", 
        type: "link_build",
        totalCount: 0,
        statusCounts: {},
        icon: Activity,
        color: "purple"
      },
      { 
        name: "Floating", 
        type: "floating",
        totalCount: 0,
        statusCounts: {},
        icon: Activity,
        color: "green"
      },
      { 
        name: "Civils (ADW)", 
        type: "civils_adw",
        totalCount: 0,
        statusCounts: {},
        icon: Activity,
        color: "orange"
      },
      { 
        name: "Access Build", 
        type: "access_build",
        totalCount: 0,
        statusCounts: {},
        icon: Activity,
        color: "teal"
      },
      { 
        name: "Root Build", 
        type: "root_build",
        totalCount: 0,
        statusCounts: {},
        icon: Activity,
        color: "indigo"
      },
      { 
        name: "Relocations", 
        type: "relocations",
        totalCount: 0,
        statusCounts: {},
        icon: Activity,
        color: "pink"
      },
      { 
        name: "Maintenance", 
        type: "maintenance",
        totalCount: 0,
        statusCounts: {},
        icon: Activity,
        color: "red"
      }
    ];

    const totalDropCables = dropCableJobs.length;
    const completedDropCables = (dropCableStatusCounts.closed || 0) + (dropCableStatusCounts.installation_completed || 0);

    return {
      jobCategories,
      dropCableStatusCounts,
      totalDropCables,
      completedDropCables,
    };
  }, [dropCableJobs]);

  if (loading) {
    return <Loader variant="bars" text="Loading clients Data..." />;
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Client Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The client you're looking for doesn't exist or has been removed.
          </p>
        </div>
        <Button onClick={() => router.push("/clients")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="h-full p-6">
        {/* Clean Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push("/clients")}
                className="h-10 w-10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {client.first_name} {client.last_name}
                  </h1>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600 dark:text-gray-400">
                      {client.email}
                    </span>
                    <Badge
                      variant={client.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {client.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {client.company_name && (
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        • {client.company_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {editing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Client
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Simple Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Jobs",
              value: jobStats.totalDropCables,
              icon: Briefcase,
              color: "blue",
            },
            {
              label: "Completed",
              value: jobStats.completedDropCables,
              icon: CheckCircle,
              color: "green",
            },
            {
              label: "In Progress",
              value: jobStats.totalDropCables - jobStats.completedDropCables,
              icon: Activity,
              color: "blue",
            },
            {
              label: "Success Rate",
              value: `${
                jobStats.totalDropCables
                  ? Math.round((jobStats.completedDropCables / jobStats.totalDropCables) * 100)
                  : 0
              }%`,
              icon: TrendingUp,
              color: "green",
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center`}
                >
                  <stat.icon
                    className={`w-4 h-4 text-${stat.color}-600 dark:text-${stat.color}-400`}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "projects", label: "Projects", icon: Briefcase },
              { id: "documents", label: "Documents", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Client Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Information */}
              <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Contact Information
                  </h2>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "First Name",
                      field: "first_name",
                      value: client.first_name,
                      type: "text",
                    },
                    {
                      label: "Last Name",
                      field: "last_name",
                      value: client.last_name,
                      type: "text",
                    },
                    {
                      label: "Email",
                      field: "email",
                      value: client.email,
                      type: "email",
                      icon: Mail,
                    },
                    {
                      label: "Phone",
                      field: "phone_number",
                      value: client.phone_number || "Not provided",
                      type: "tel",
                      icon: Phone,
                    },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                          className="border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-2">
                            {item.icon && (
                              <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                            <p className="text-gray-900 dark:text-white">
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
              <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Company Details
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Company Name
                    </Label>
                    {editing ? (
                      <Input
                        value={formData.company_name || ""}
                        onChange={(e) =>
                          handleInputChange("company_name", e.target.value)
                        }
                        placeholder="Enter company name"
                        className="border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-900 dark:text-white">
                          {client.company_name || "Not specified"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address
                    </Label>
                    {editing ? (
                      <textarea
                        value={formData.address || ""}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        placeholder="Enter address"
                        className="w-full min-h-[80px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white resize-none"
                        rows={3}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[80px]">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1" />
                          <p className="text-gray-900 dark:text-white">
                            {client.address || "Not provided"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notes
                    </Label>
                    {editing ? (
                      <textarea
                        value={formData.notes || ""}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                        placeholder="Add notes about this client"
                        className="w-full min-h-[80px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white resize-none"
                        rows={3}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[80px]">
                        <div className="flex items-start space-x-2">
                          <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1" />
                          <p className="text-gray-900 dark:text-white">
                            {client.notes || "No notes available"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Account Information */}
              <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Account Information
                  </h2>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: "Status",
                      value: client.is_active ? "Active" : "Inactive",
                      highlight: true,
                    },
                    {
                      label: "Created",
                      value: client.created_at
                        ? new Date(client.created_at).toLocaleDateString()
                        : "Unknown",
                    },
                    {
                      label: "Updated",
                      value: client.updated_at
                        ? new Date(client.updated_at).toLocaleDateString()
                        : "Unknown",
                    },
                    { label: "Client ID", value: client.id, mono: true },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                        {item.label}:
                      </span>
                      {item.highlight ? (
                        <Badge
                          variant={client.is_active ? "default" : "secondary"}
                        >
                          {item.value}
                        </Badge>
                      ) : item.mono ? (
                        <code className="text-gray-900 dark:text-white font-mono text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                          {item.value}
                        </code>
                      ) : (
                        <span className="text-gray-900 dark:text-white">
                          {item.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - Quick Actions & Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setActiveTab("projects")}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-xs">New Project</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setActiveTab("documents")}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-xs">View Documents</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-2"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-xs">Send Email</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-2"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="text-xs">Call Client</span>
                  </Button>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      action: "Project status updated",
                      time: "2 hours ago",
                      type: "project",
                    },
                    {
                      action: "Document uploaded",
                      time: "1 day ago",
                      type: "document",
                    },
                    {
                      action: "Meeting scheduled",
                      time: "3 days ago",
                      type: "meeting",
                    },
                    {
                      action: "Invoice sent",
                      time: "1 week ago",
                      type: "billing",
                    },
                  ].map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </p>
                      </div>
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
            {/* Projects Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Job Categories
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Track different types of work and installations
                </p>
              </div>
            </div>

            {/* Job Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {jobStats.jobCategories.map((category, index) => (
                <Card
                  key={index}
                  className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    if (category.totalCount > 0) {
                      router.push(`/clients/${resolvedParams.id}/${category.type}`);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${category.color}-100 dark:bg-${category.color}-900/20 rounded-lg flex items-center justify-center`}>
                      <category.icon className={`w-6 h-6 text-${category.color}-600 dark:text-${category.color}-400`} />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {category.totalCount}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Total Jobs
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {category.name}
                    </h3>
                    
                    {/* Status breakdown */}
                    {category.totalCount > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(category.statusCounts).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${getDropCableStatusColor(status).split(' ')[0]}`}></div>
                              <span className="text-gray-600 dark:text-gray-400 capitalize">
                                {formatDropCableStatus(status)}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No jobs in this category
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    {category.totalCount > 0 ? (
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`bg-${category.color}-50 text-${category.color}-700 border-${category.color}-200 dark:bg-${category.color}-900/20 dark:text-${category.color}-400 dark:border-${category.color}-700`}>
                          Active
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span>Click to view</span>
                          <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">
                        No Jobs
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <DocumentViewer clientId={resolvedParams.id} />
        )}
      </div>
    </div>
  );
}
