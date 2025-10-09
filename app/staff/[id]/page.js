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
  Users,
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
  Shield,
  Key,
  UserX,
} from "lucide-react";
import { get, put, post, del } from "@/lib/api/fetcher";
import { Loader } from "@/components/shared/Loader";
import { useAuth } from "@/components/providers/AuthProvider";
import { StaffDocumentViewer } from "@/components/staff/StaffDocumentViewer";

export default function StaffDetailPage({ params }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [staff, setStaff] = React.useState(null);
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({});
  const [accessBusy, setAccessBusy] = React.useState(false);
  const [accessMsg, setAccessMsg] = React.useState("");
  const [roleForm, setRoleForm] = React.useState({ role: "" });
  const [savingRole, setSavingRole] = React.useState(false);
  const [roleError, setRoleError] = React.useState("");
  const [roleSuccess, setRoleSuccess] = React.useState("");

  const localStorageKey = `staff-${resolvedParams.id}-activeTab`;
  const [activeTab, setActiveTabState] = React.useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(localStorageKey);
      return stored || "overview";
    }
    return "overview";
  });

  const setActiveTab = React.useCallback(
    (tab) => {
      setActiveTabState(tab);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(localStorageKey, tab);
      }
    },
    [localStorageKey]
  );

  React.useEffect(() => {
    if (resolvedParams.id) {
      fetchStaffMember();
    }
  }, [resolvedParams.id]);

  const fetchStaffMember = async () => {
    try {
      setLoading(true);
      // 1) Fetch staff row by staff id
      const s = await get(`/staff/${resolvedParams.id}`);
      const staffData = s?.data || null;
      setStaff(staffData);
      setFormData(staffData || {});
      setRoleForm({ role: staffData?.role || "" });

      // 2) Try to fetch auth profile if linked
      if (staffData?.auth_user_id) {
        try {
          const res = await get(`/auth/accounts/${staffData.auth_user_id}`);
          const data = res?.data || null;
          setProfile(data);
          setRoleForm({ role: data?.role || staffData?.role || "" });
        } catch {
          setProfile(null);
          setRoleForm({ role: staffData?.role || "" });
        }
      } else {
        setProfile(null);
        setRoleForm({ role: staffData?.role || "" });
      }
    } catch (error) {
      console.error("Error fetching staff member:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setFormData({ ...staff });
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({ ...staff });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        ...formData,
        salary: formData.salary !== "" ? Number(formData.salary) : null,
      };
      const response = await put(`/staff/${resolvedParams.id}`, payload);
      setStaff(response.data);
      setEditing(false);
      await fetchStaffMember();
    } catch (error) {
      console.error("Error updating staff member:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canEdit = (user?.role || user?.user_metadata?.role) === "super_admin";

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!staff?.auth_user_id) { 
      setRoleError("Grant system access first to edit role."); 
      return; 
    }
    try {
      setSavingRole(true);
      setRoleError("");
      setRoleSuccess("");
      const payload = { role: roleForm.role };
      const res = await put(`/auth`, { id: staff.auth_user_id, ...payload });
      if (res?.data) {
        setRoleSuccess("Role updated");
        await fetchStaffMember();
      }
    } catch (e) {
      setRoleError(e?.message || "Failed to update role");
    } finally {
      setSavingRole(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!canEdit) return;
    const email = staff?.email;
    if (!email) {
      setAccessMsg("Email is required to grant access");
      return;
    }
    try {
      setAccessBusy(true);
      setAccessMsg("");
      const role = roleForm.role || staff?.role || "field_worker";
      const res = await post(`/staff/${resolvedParams.id}/grant-access`, { email, role });
      if (res?.data) {
        const temp = res?.data?.auth?.tempPassword;
        setAccessMsg(temp ? `System access granted. Temporary password: ${temp}` : "System access granted");
        await fetchStaffMember();
      }
    } catch (e) {
      setAccessMsg(`Failed to grant access: ${e?.message}`);
    } finally {
      setAccessBusy(false);
    }
  };

  const handleRevokeAccess = async () => {
    if (!canEdit) return;
    try {
      setAccessBusy(true);
      setAccessMsg("");
      const res = await del(`/staff/${resolvedParams.id}/access`);
      if (res?.data) {
        setAccessMsg("System access removed");
        await fetchStaffMember();
      }
    } catch (e) {
      setAccessMsg(`Failed to remove access: ${e?.message}`);
    } finally {
      setAccessBusy(false);
    }
  };

  if (loading) {
    return <Loader variant="bars" text="Loading staff member..." />;
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Staff Member Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-md">
            The staff member you're looking for doesn't exist or has been removed.
          </p>
        </div>
        <Button
          onClick={() => router.push("/staff")}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Staff
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="h-full">
        {/* Modern Header with Glassmorphism Effect */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/staff")}
                  className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 ${
                        staff.auth_user_id ? "bg-emerald-500" : "bg-slate-400"
                      } rounded-full border-4 border-white dark:border-slate-900`}
                    ></div>
                  </div>

                  <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                      {`${(profile?.first_name ?? staff?.first_name) || ""} ${(profile?.surname ?? staff?.surname) || ""}`.trim() || "Staff Member"}
                    </h1>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" />
                        {(profile?.email ?? staff?.email) || "No email"}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                      <Badge
                        variant={staff.auth_user_id ? "default" : "secondary"}
                        className={`${
                          staff.auth_user_id
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                            : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        } font-medium`}
                      >
                        {staff.auth_user_id ? "Has Access" : "No Access"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {editing ? (
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
                    {canEdit && (
                      <Button
                        onClick={handleEdit}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Staff
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-8">
            <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
              {[
                { id: "overview", label: "Overview", icon: User },
                { id: "access", label: "System Access", icon: Shield },
                { id: "documents", label: "Documents", icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    } rounded-t-lg`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: "Employee ID",
                value: staff.id ? staff.id.substring(0, 8) + "..." : "—",
                icon: Users,
                color: "blue",
                bgGradient: "from-blue-500/10 to-blue-600/10",
                iconBg: "bg-blue-500",
              },
              {
                label: "Department",
                value: staff.department || "Unassigned",
                icon: Briefcase,
                color: "emerald",
                bgGradient: "from-emerald-500/10 to-emerald-600/10",
                iconBg: "bg-emerald-500",
              },
              {
                label: "Position",
                value: staff.position || "Staff Member",
                icon: Activity,
                color: "amber",
                bgGradient: "from-amber-500/10 to-amber-600/10",
                iconBg: "bg-amber-500",
              },
              {
                label: "System Role",
                value: (roleForm.role || "none").replace("_", " "),
                icon: Shield,
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
                  <p className="text-lg font-bold text-slate-900 dark:text-white mb-1 capitalize">
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
                {/* Personal Information */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Personal Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        label: "First Name",
                        field: "first_name",
                        value: staff.first_name || "",
                        type: "text",
                        icon: User,
                      },
                      {
                        label: "Surname",
                        field: "surname",
                        value: staff.surname || "",
                        type: "text",
                        icon: User,
                      },
                      {
                        label: "Email",
                        field: "email",
                        value: staff.email || "",
                        type: "email",
                        icon: Mail,
                        fullWidth: true,
                      },
                      {
                        label: "Phone",
                        field: "phone_number",
                        value: staff.phone_number || "",
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
                                {item.value || "Not provided"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Employment Information */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Employment Details
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        label: "Position",
                        field: "position",
                        value: staff.position || "",
                        type: "text",
                        icon: Activity,
                      },
                      {
                        label: "Department",
                        field: "department",
                        value: staff.department || "",
                        type: "text",
                        icon: Users,
                      },
                      {
                        label: "Hire Date",
                        field: "hire_date",
                        value: staff.hire_date || "",
                        type: "date",
                        icon: Calendar,
                      },
                      {
                        label: "Employment Type",
                        field: "employment_type",
                        value: staff.employment_type || "",
                        type: "text",
                        icon: FileText,
                      },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
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
                            className="border-slate-300 dark:border-slate-700"
                          />
                        ) : (
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <item.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                              <p className="text-slate-900 dark:text-white">
                                {item.value || "Not specified"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* System Access Management */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      System Access
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Account Status
                        </span>
                        <Badge
                          variant={staff.auth_user_id ? "default" : "secondary"}
                          className={
                            staff.auth_user_id
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                              : ""
                          }
                        >
                          {staff.auth_user_id ? "Active" : "No Access"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {staff.auth_user_id
                          ? "Staff member has system access"
                          : "Staff member needs access to be granted"}
                      </p>
                    </div>

                    {canEdit && (
                      <div className="space-y-3">
                        {staff.auth_user_id ? (
                          <Button
                            variant="destructive"
                            onClick={handleRevokeAccess}
                            disabled={accessBusy}
                            className="w-full gap-2"
                          >
                            {accessBusy ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                            {accessBusy ? "Removing..." : "Remove Access"}
                          </Button>
                        ) : (
                          <Button
                            onClick={handleGrantAccess}
                            disabled={accessBusy}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                          >
                            {accessBusy ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Key className="w-4 h-4" />
                            )}
                            {accessBusy ? "Granting..." : "Grant Access"}
                          </Button>
                        )}
                        {accessMsg && (
                          <p className={`text-sm ${accessMsg.includes('Failed') || accessMsg.includes('required') ? 'text-red-500' : 'text-green-600'}`}>
                            {accessMsg}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Role Management */}
                {staff.auth_user_id && (
                  <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Role Management
                      </h2>
                    </div>

                    <form onSubmit={handleRoleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          System Role
                        </Label>
                        <select
                          value={roleForm.role}
                          onChange={(e) => setRoleForm({ role: e.target.value })}
                          disabled={!canEdit || !staff?.auth_user_id}
                          className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="field_worker">Field Worker</option>
                          <option value="client">Client</option>
                        </select>
                        {!canEdit && (
                          <p className="text-xs text-slate-500">Only super_admin can edit roles.</p>
                        )}
                        {canEdit && !staff?.auth_user_id && (
                          <p className="text-xs text-slate-500">Grant system access first to assign a role.</p>
                        )}
                      </div>
                      {roleError && <p className="text-sm text-red-500">{roleError}</p>}
                      {roleSuccess && <p className="text-sm text-green-600">{roleSuccess}</p>}
                      <Button 
                        type="submit" 
                        disabled={!canEdit || savingRole || !staff?.auth_user_id}
                        className="w-full"
                      >
                        {savingRole ? "Saving..." : "Update Role"}
                      </Button>
                    </form>
                  </Card>
                )}

                {/* Employee Information */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Employee Info
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                        Employee ID
                      </span>
                      <code className="text-slate-900 dark:text-white font-mono text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                        {staff.id ? staff.id.substring(0, 8) + "..." : "—"}
                      </code>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                        Hire Date
                      </span>
                      <span className="text-slate-900 dark:text-white text-sm">
                        {staff.hire_date
                          ? new Date(staff.hire_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                        Created
                      </span>
                      <span className="text-slate-900 dark:text-white text-sm">
                        {staff.created_at
                          ? new Date(staff.created_at).toLocaleDateString(
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
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* System Access Tab */}
          {activeTab === "access" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  System Access Management
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Control system access and role permissions for this staff member
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Access Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          System Account
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {staff.auth_user_id ? "Active authentication account" : "No system account"}
                        </p>
                      </div>
                      <Badge
                        variant={staff.auth_user_id ? "default" : "secondary"}
                        className={
                          staff.auth_user_id
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : ""
                        }
                      >
                        {staff.auth_user_id ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    {staff.auth_user_id && profile && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <p className="font-medium text-slate-900 dark:text-white mb-2">
                          Account Details
                        </p>
                        <div className="text-sm space-y-1">
                          <p className="text-slate-600 dark:text-slate-400">
                            Email: {profile.email}
                          </p>
                          <p className="text-slate-600 dark:text-slate-400">
                            Role: {profile.role || "Not set"}
                          </p>
                          <p className="text-slate-600 dark:text-slate-400">
                            Last Sign In: {profile.last_sign_in_at ? new Date(profile.last_sign_in_at).toLocaleDateString() : "Never"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Access Actions
                  </h3>
                  <div className="space-y-3">
                    {canEdit ? (
                      <>
                        {staff.auth_user_id ? (
                          <Button
                            variant="destructive"
                            onClick={handleRevokeAccess}
                            disabled={accessBusy}
                            className="w-full gap-2"
                          >
                            {accessBusy ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                            {accessBusy ? "Removing Access..." : "Remove System Access"}
                          </Button>
                        ) : (
                          <Button
                            onClick={handleGrantAccess}
                            disabled={accessBusy}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                          >
                            {accessBusy ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Key className="w-4 h-4" />
                            )}
                            {accessBusy ? "Granting Access..." : "Grant System Access"}
                          </Button>
                        )}
                        {accessMsg && (
                          <div className={`p-3 rounded-lg text-sm ${accessMsg.includes('Failed') || accessMsg.includes('required') ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'}`}>
                            {accessMsg}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                        <p className="text-amber-700 dark:text-amber-400 text-sm">
                          Only super administrators can manage system access.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <StaffDocumentViewer staffId={resolvedParams.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}