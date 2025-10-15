"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/Toast";
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
  Calendar,
  FileText,
  Briefcase,
  AlertTriangle,
  Activity,
  ArrowRight,
  MoreVertical,
  Shield,
  Key,
  UserX,
  CreditCard,
  Eye,
  EyeOff,
} from "lucide-react";
import { get, put, post, del } from "@/lib/api/fetcher";
import { Loader } from "@/components/shared/Loader";
import { useAuth } from "@/components/providers/AuthProvider";
import { StaffDocumentViewer } from "@/components/staff/StaffDocumentViewer";
import { normalizePhoneNumber } from "@/lib/utils/normalizePhoneNumber";
import Header from "@/components/shared/Header";

export default function StaffDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [accessBusy, setAccessBusy] = useState(false);
  const [accessMsg, setAccessMsg] = useState("");
  const [roleForm, setRoleForm] = useState({ role: "" });
  const [savingRole, setSavingRole] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [roleSuccess, setRoleSuccess] = useState("");
  const [pendingRole, setPendingRole] = useState(null);
  const [revealedNationalId, setRevealedNationalId] = useState(null);
  const [revealingNationalId, setRevealingNationalId] = useState(false);

  // SWR for staff data
  const { data: staffData, isLoading: loading, error: staffError } = useSWR(
    resolvedParams.id ? `/staff/${resolvedParams.id}` : null,
    () => get(`/staff/${resolvedParams.id}`),
    { revalidateOnFocus: true, dedupingInterval: 60000 }
  );
  const staff = staffData?.data || null;
console.log(staffData);

  // SWR for profile data (only fetch if auth_user_id exists)
  const { data: profileData } = useSWR(
    staff?.auth_user_id ? `/auth/accounts/${staff.auth_user_id}` : null,
    () => get(`/auth/accounts/${staff.auth_user_id}`),
    { revalidateOnFocus: true, dedupingInterval: 60000 }
  );
  const profile = profileData?.data || null;

  const localStorageKey = `staff-${resolvedParams.id}-activeTab`;
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(localStorageKey);
      return stored || "overview";
    }
    return "overview";
  });

  const setActiveTab = useCallback(
    (tab) => {
      setActiveTabState(tab);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(localStorageKey, tab);
      }
    },
    [localStorageKey]
  );

  // Update form data and role form when staff data changes
  useEffect(() => {
    if (staff) {
      setFormData(staff);
      setRoleForm({ role: profile?.role || staff?.role || "" });
    }
  }, [staff, profile]);

  useEffect(() => {
    if (resolvedParams.id) {
      setRevealedNationalId(null);
    }
  }, [resolvedParams.id]);

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
      // Only send fields allowed by backend update schema
      const allowedFields = [
        "phone_number",
        "date_of_birth",
        "address",
        "position",
        "department",
        "hire_date",
        "salary",
        "employment_type",
        "emergency_contact_name",
        "emergency_contact_phone",
        "national_id",
        "notes",
        "role",
      ];
      const payload = allowedFields.reduce((acc, key) => {
        if (Object.prototype.hasOwnProperty.call(formData, key)) {
          let val = formData[key];
          if (key === "salary") {
            val =
              val !== "" && val !== null && val !== undefined
                ? Number(val)
                : null;
          }
          // Normalize phone numbers
          if (key === "phone_number" || key === "emergency_contact_phone") {
            val = normalizePhoneNumber(val);
          }
          acc[key] = val;
        }
        return acc;
      }, {});

      await put(`/staff/${resolvedParams.id}`, payload);
      await mutate(`/staff/${resolvedParams.id}`);
      setEditing(false);
      toastSuccess("Success", "Staff member details updated successfully.");
    } catch (error) {
      console.error("Error updating staff member:", error);
      toastError("Error", "Failed to update staff member.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canEdit = (user?.role || user?.user_metadata?.role) === "super_admin";

  const isSelf =
    user?.id && staff?.auth_user_id && user.id === staff.auth_user_id;

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!staff?.auth_user_id) {
      setRoleError("Grant system access first to edit role.");
      return;
    }
    // If super_admin is changing their own role, show warning toast first
    if (
      isSelf &&
      (profile?.role === "super_admin" || staff?.role === "super_admin") &&
      roleForm.role !== "super_admin"
    ) {
      setPendingRole(roleForm.role);
      toastSuccess(
        "Warning: You are changing your own role",
        `You are about to change your own role from Super Admin to ${roleForm.role.replace("_", " ")}. This will immediately limit your access and you may lose the ability to manage other admins or system settings.`,
        {
          duration: 0,
          action: "Proceed",
          onAction: async () => {
            await doRoleUpdate(roleForm.role);
            setPendingRole(null);
          },
          onCancel: () => setPendingRole(null),
        }
      );
      return;
    }
    await doRoleUpdate(roleForm.role);
  };

  // Actually perform the role update
  const doRoleUpdate = async (newRole) => {
    try {
      setSavingRole(true);
      setRoleError("");
      setRoleSuccess("");
      const payload = { role: newRole };
      const res = await put(`/auth`, { id: staff.auth_user_id, ...payload });
      if (res?.data) {
        setRoleSuccess("Role updated");
        toastSuccess(
          "Success",
          `Role updated to ${newRole.replace("_", " ")}`
        );
        await mutate(`/staff/${resolvedParams.id}`);
        if (staff.auth_user_id) {
          await mutate(`/auth/accounts/${staff.auth_user_id}`);
        }
      }
    } catch (e) {
      setRoleError(e?.message || "Failed to update role");
      toastError("Error", "Failed to update role.");
    } finally {
      setSavingRole(false);
      setPendingRole(null);
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
      const res = await post(`/staff/${resolvedParams.id}/grant-access`, {
        email,
        role,
      });
      if (res?.data) {
        const temp = res?.data?.auth?.tempPassword;
        setAccessMsg(
          temp
            ? `System access granted. Temporary password: ${temp}`
            : "System access granted"
        );
        toastSuccess("Success", "System access granted successfully.");
        await mutate(`/staff/${resolvedParams.id}`);
      }
    } catch (e) {
      setAccessMsg(`Failed to grant access: ${e?.message}`);
      toastError("Error", "Failed to grant system access.");
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
        toastSuccess("Success", "System access removed successfully.");
        await mutate(`/staff/${resolvedParams.id}`);
      }
    } catch (e) {
      setAccessMsg(`Failed to remove access: ${e?.message}`);
      toastError("Error", "Failed to remove system access.");
    } finally {
      setAccessBusy(false);
    }
  };

  const handleRevealNationalId = async () => {
    if (!canEdit) return;
    try {
      setRevealingNationalId(true);
      const response = await get(
        `/staff/${resolvedParams.id}/reveal-national-id`
      );
      if (response?.data?.national_id) {
        setRevealedNationalId(response.data.national_id);
        // Auto-hide after 30 seconds for security
        setTimeout(() => {
          setRevealedNationalId(null);
        }, 30000);
      }
    } catch (error) {
      console.error("Error revealing national ID:", error);
      // Could add error state here if needed
    } finally {
      setRevealingNationalId(false);
    }
  };

  const handleHideNationalId = () => {
    setRevealedNationalId(null);
  };

  if (loading) {
    return <Loader variant="bars" text="Loading staff member..." />;
  }

  if (staffError) {
    toastError("Error", "Failed to load staff data.");
    return <div className="p-8 text-red-600">Failed to load staff data.</div>;
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
            The staff member you&apos;re looking for doesn&apos;t exist or has
            been removed.
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
        {/* Modern Header with Glassmorphism Effect (using shared Header component) */}
        <Header
          title={`${(profile?.first_name ?? staff?.first_name) || ""} ${(profile?.surname ?? staff?.surname) || ""}`.trim() || "Staff Member"}
          subtitle={
            <span className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              {(profile?.email ?? staff?.email) || "No email"}
            </span>
          }
          logo={{
            src: null,
            alt: "Staff Member",
            fallbackIcon: User,
          }}
          statusIndicator={staff.auth_user_id}
          badge={{
            label: staff.auth_user_id ? "Has Access" : "No Access",
            active: staff.auth_user_id,
          }}
          actions={
            isSelf ? (
              <Button
                onClick={() => router.push("/settings")}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Go to Your Profile
              </Button>
            ) : editing ? (
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
                  type="button"
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
            )
          }
          onBack={() => router.push("/staff")}
          tabs={[
            { id: "overview", label: "Overview", icon: User },
            { id: "access", label: "System Access", icon: Shield },
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
            <div className="space-y-6">
              {/* Personal and Employment Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        disabled: true,
                      },
                      {
                        label: "Surname",
                        field: "surname",
                        value: staff.surname || "",
                        type: "text",
                        icon: User,
                        disabled: true,
                      },
                      {
                        label: "Email",
                        field: "email",
                        value: staff.email || "",
                        type: "email",
                        icon: Mail,
                        fullWidth: true,
                        disabled: true,
                      },
                      {
                        label: "Phone",
                        field: "phone_number",
                        value: staff.phone_number || "",
                        type: "tel",
                        icon: Phone,
                        fullWidth: true,
                        disabled: false,
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
                            className={`border-slate-300 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 ${item.disabled ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed' : ''}`}
                            disabled={item.disabled}
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

                    {/* National ID Field with Reveal Functionality */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        National ID
                      </Label>
                      {editing ? (
                        <Input
                          type="text"
                          value={formData.national_id || ""}
                          onChange={(e) =>
                            handleInputChange("national_id", e.target.value)
                          }
                          placeholder="Enter national ID"
                          className="border-slate-300 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                        />
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <CreditCard className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                              <p className="text-slate-900 dark:text-white font-mono">
                                {revealedNationalId ||
                                  staff.masked_national_id ||
                                  "Not provided"}
                              </p>
                            </div>
                            {canEdit && staff.masked_national_id && (
                              <div className="flex items-center gap-2">
                                {revealedNationalId ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleHideNationalId}
                                    className="h-8 px-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                  >
                                    <EyeOff className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRevealNationalId}
                                    disabled={revealingNationalId}
                                    className="h-8 px-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                  >
                                    {revealingNationalId ? (
                                      <div className="w-4 h-4 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Eye className="w-4 h-4" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          {revealedNationalId && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Full ID will auto-hide in 30 seconds for security
                            </p>
                          )}
                        </div>
                      )}
                    </div>
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
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  System Access Management
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Control system access and role permissions for this staff
                  member
                </p>
              </div>

              {/* Main Access Status Card */}
              <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Access Status
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Current system access and account information
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Status Overview */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${staff.auth_user_id ? "bg-green-500" : "bg-slate-400"}`}
                        ></div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            System Account
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {staff.auth_user_id
                              ? "Active authentication account"
                              : "No system account"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={staff.auth_user_id ? "default" : "secondary"}
                        className={
                          staff.auth_user_id
                            ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                            : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        }
                      >
                        {staff.auth_user_id ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    {staff.auth_user_id && profile && (
                      <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                          Account Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600 dark:text-slate-400">
                              Email:
                            </span>
                            <span className="text-slate-900 dark:text-white font-medium">
                              {profile.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600 dark:text-slate-400">
                              Role:
                            </span>
                            <span className="text-slate-900 dark:text-white font-medium capitalize">
                              {(profile.role || "Not set").replace("_", " ")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 md:col-span-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600 dark:text-slate-400">
                              Last Sign In:
                            </span>
                            <span className="text-slate-900 dark:text-white font-medium">
                              {profile.last_sign_in_at
                                ? new Date(
                                    profile.last_sign_in_at
                                  ).toLocaleDateString()
                                : "Never"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Panel */}
                  <div className="space-y-4">
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                        Access Control
                      </h4>
                      {canEdit ? (
                        <div className="space-y-3">
                          {staff.auth_user_id ? (
                            <Button
                              variant="destructive"
                              onClick={handleRevokeAccess}
                              disabled={accessBusy || isSelf}
                              className={`w-full gap-2 ${isSelf ? "opacity-50 cursor-not-allowed" : ""}`}
                              title={
                                isSelf
                                  ? "You cannot remove your own access"
                                  : ""
                              }
                            >
                              {accessBusy ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <UserX className="w-4 h-4" />
                              )}
                              {isSelf
                                ? "Cannot Remove Own Access"
                                : "Remove System Access"}
                            </Button>
                          ) : (
                            <Button
                              onClick={handleGrantAccess}
                              disabled={accessBusy}
                              className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                            >
                              {accessBusy ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Key className="w-4 h-4" />
                              )}
                              Grant System Access
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <p className="text-amber-700 dark:text-amber-400 text-sm">
                            Only super administrators can manage system access.
                          </p>
                        </div>
                      )}
                    </div>

                    {accessMsg && (
                      <div
                        className={`p-4 rounded-xl text-sm font-medium ${
                          accessMsg.includes("Failed") ||
                          accessMsg.includes("required")
                            ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                            : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                        }`}
                      >
                        {accessMsg}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Role Management Section */}
              {staff.auth_user_id && (
                <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Role Management
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Assign and manage user permissions
                      </p>
                    </div>
                  </div>

                  <div className="max-w-lg">
                    <form onSubmit={handleRoleSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          System Role
                        </Label>
                        <select
                          value={roleForm.role}
                          onChange={(e) =>
                            setRoleForm({ role: e.target.value })
                          }
                          disabled={!canEdit || !staff?.auth_user_id}
                          className="w-full h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-colors"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="technician">Technician</option>
                        </select>

                        <div className="space-y-2">
                          {!canEdit && (
                            <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                              Only super_admin can edit roles.
                            </p>
                          )}
                          {canEdit && !staff?.auth_user_id && (
                            <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                              Grant system access first to assign a role.
                            </p>
                          )}
                        </div>
                      </div>

                      {(roleError || roleSuccess) && (
                        <div className="space-y-2">
                          {roleError && (
                            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                              {roleError}
                            </p>
                          )}
                          {roleSuccess && (
                            <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                              {roleSuccess}
                            </p>
                          )}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={
                          !canEdit || savingRole || !staff?.auth_user_id
                        }
                        className="w-full h-12 text-base font-medium"
                      >
                        {savingRole ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        ) : null}
                        {savingRole ? "Updating Role..." : "Update Role"}
                      </Button>
                    </form>
                  </div>
                </Card>
              )}
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
