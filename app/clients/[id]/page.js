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
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { get, put } from "@/lib/api/fetcher";

export default function ClientDetailPage({ params }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [client, setClient] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({});

  // Mock jobs data - will be replaced with real API call
  const [jobs] = React.useState([
    {
      id: 1,
      title: "Network Infrastructure Setup",
      status: "completed",
      startDate: "2024-01-15",
      endDate: "2024-02-28",
      value: 25000,
      description: "Complete office network setup with fiber connections"
    },
    {
      id: 2,
      title: "Security System Installation",
      status: "ongoing",
      startDate: "2024-03-01",
      endDate: null,
      value: 15000,
      description: "CCTV and access control system installation"
    },
    {
      id: 3,
      title: "Server Room Setup",
      status: "pending",
      startDate: "2024-04-01",
      endDate: null,
      value: 18000,
      description: "Climate controlled server room with backup systems"
    }
  ]);

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

    if (resolvedParams.id) {
      fetchClient();
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getJobStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "ongoing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getJobStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "ongoing":
        return <Activity className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const jobStats = React.useMemo(() => {
    const completed = jobs.filter(job => job.status === "completed");
    const ongoing = jobs.filter(job => job.status === "ongoing");
    const pending = jobs.filter(job => job.status === "pending");
    const totalValue = jobs.reduce((sum, job) => sum + job.value, 0);
    const completedValue = completed.reduce((sum, job) => sum + job.value, 0);

    return {
      total: jobs.length,
      completed: completed.length,
      ongoing: ongoing.length,
      pending: pending.length,
      totalValue,
      completedValue
    };
  }, [jobs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
      </div>
    );
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
      <div className="max-w-7xl mx-auto p-6">
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
                    <Badge variant={client.is_active ? "default" : "secondary"} className="text-xs">
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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {[
            { label: "Total Projects", value: jobStats.total, icon: Briefcase, color: "blue" },
            { label: "Completed", value: jobStats.completed, icon: CheckCircle, color: "green" },
            { label: "Ongoing", value: jobStats.ongoing, icon: Activity, color: "blue" },
            { label: "Pending", value: jobStats.pending, icon: Clock, color: "yellow" },
            { label: "Total Value", value: `R${jobStats.totalValue.toLocaleString()}`, icon: DollarSign, color: "gray" },
            { label: "Success Rate", value: `${jobStats.total ? Math.round((jobStats.completed / jobStats.total) * 100) : 0}%`, icon: TrendingUp, color: "green" }
          ].map((stat, i) => (
            <Card key={i} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 text-${stat.color}-600 dark:text-${stat.color}-400`} />
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

        {/* Content Layout */}
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
                  { label: "First Name", field: "first_name", value: client.first_name, type: "text" },
                  { label: "Last Name", field: "last_name", value: client.last_name, type: "text" },
                  { label: "Email", field: "email", value: client.email, type: "email", icon: Mail },
                  { label: "Phone", field: "phone_number", value: client.phone_number || "Not provided", type: "tel", icon: Phone }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </Label>
                    {editing ? (
                      <Input
                        type={item.type}
                        value={formData[item.field] || ""}
                        onChange={(e) => handleInputChange(item.field, e.target.value)}
                        placeholder={`Enter ${item.label.toLowerCase()}`}
                        className="border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-2">
                          {item.icon && <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
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
                      onChange={(e) => handleInputChange("company_name", e.target.value)}
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
                      onChange={(e) => handleInputChange("address", e.target.value)}
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
                      onChange={(e) => handleInputChange("notes", e.target.value)}
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
                  { label: "Status", value: client.is_active ? "Active" : "Inactive", highlight: true },
                  { label: "Created", value: client.created_at ? new Date(client.created_at).toLocaleDateString() : "Unknown" },
                  { label: "Updated", value: client.updated_at ? new Date(client.updated_at).toLocaleDateString() : "Unknown" },
                  { label: "Client ID", value: client.id, mono: true }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">{item.label}:</span>
                    {item.highlight ? (
                      <Badge variant={client.is_active ? "default" : "secondary"}>
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

          {/* Right Column - Projects */}
          <div className="lg:col-span-2 space-y-6">
            {/* Projects Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Projects & Jobs
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Track project progress and deliverables</p>
              </div>
              <Button 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md cursor-pointer"
                  onClick={() => router.push(`/projects/${job.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 ${
                          job.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20' :
                          job.status === 'ongoing' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          'bg-yellow-100 dark:bg-yellow-900/20'
                        } rounded-lg flex items-center justify-center`}>
                          {React.cloneElement(getJobStatusIcon(job.status), { 
                            className: `w-5 h-5 ${
                              job.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                              job.status === 'ongoing' ? 'text-blue-600 dark:text-blue-400' :
                              'text-yellow-600 dark:text-yellow-400'
                            }` 
                          })}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {job.title}
                          </h3>
                          <Badge variant="outline" className={getJobStatusColor(job.status)}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {job.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Started</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(job.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {job.endDate && (
                          <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(job.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          R{job.value.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Project Value
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/projects/${job.id}`);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {/* Progress Bar for ongoing projects */}
                  {job.status === "ongoing" && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {jobs.length === 0 && (
              <Card className="p-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Projects Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This client doesn't have any projects assigned yet. Start by creating their first project.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Project
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}