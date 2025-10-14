"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { get, put } from "@/lib/api/fetcher";
import { post } from "@/lib/api/fetcher";
import { useToast } from "@/components/shared/Toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Bell,
  Lock,
  Smartphone,
  Edit3,
  Save,
  X,
  Camera,
  Building2,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Settings,
} from "lucide-react";
import { Loader } from "@/components/shared/Loader";
import Header from "@/components/shared/Header";

function UserSettingsPage() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showNationalId, setShowNationalId] = useState(false);
  const [revealedNationalId, setRevealedNationalId] = useState(null);
  const [revealingNationalId, setRevealingNationalId] = useState(false);
  const [revealNationalIdError, setRevealNationalIdError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  // Hide revealed national ID after 30 seconds
  useEffect(() => {
    if (showNationalId && revealedNationalId) {
      const timer = setTimeout(() => {
        setShowNationalId(false);
        setRevealedNationalId(null);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [showNationalId, revealedNationalId]);

  const handleRevealNationalId = async () => {
    if (!userData?.id) return;
    setRevealingNationalId(true);
    setRevealNationalIdError("");
    try {
      // Fetch the real national ID from the backend
      const res = await get(`/staff/${userData.id}/reveal-national-id`);
      if (res?.data?.national_id) {
        setRevealedNationalId(res.data.national_id);
        setShowNationalId(true);
      } else {
        setRevealNationalIdError("Could not reveal national ID.");
      }
    } catch (e) {
      setRevealNationalIdError(e?.message || "Failed to reveal national ID.");
    } finally {
      setRevealingNationalId(false);
    }
  };

  const handleHideNationalId = () => {
    setShowNationalId(false);
    setRevealedNationalId(null);
    setRevealNationalIdError("");
  };

  useEffect(() => {
    const fetchStaff = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await get(`/staff/me`);
        if (res?.data) {
          setUserData(res.data);
          setFormData(res.data);
        } else {
          setUserData(null);
          setFormData(null);
        }
      } catch (e) {
        setUserData(null);
        setFormData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [user?.id]);

  const handleEdit = () => {
    setEditing(true);
    setFormData({ ...userData });
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({ ...userData });
  };

  const [saveError, setSaveError] = useState("");
  console.log(userData);

  const editableFields = [
    "first_name",
    "surname",
    "email",
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
  ];

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    //
    if (!formData) {
      setSaveError("No form data to save.");
      setSaving(false);
      return;
    }
    const payload = {};
    editableFields.forEach((field) => {
      if (formData[field] !== undefined) payload[field] = formData[field];
    });
    try {
      const res = await put(`/staff/${userData.id}`, payload);
      if (res?.data) {
        setUserData(res.data);
        setFormData(res.data);
        setEditing(false);
        toastSuccess(
          "Profile Updated",
          "Your profile was updated successfully."
        );
      } else {
        setSaveError("Failed to update profile.");
        toastError("Update Failed", "Failed to update profile.");
      }
    } catch (e) {
      setSaveError(e?.message || "Failed to update profile.");
      toastError("Update Failed", e?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      admin:
        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
      manager:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      field_worker:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
      client:
        "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    };
    return colors[role] || colors.client;
  };

  if (loading) {
    return <Loader variant="bars" text="Loading Settings..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {saveError && (
        <div className="mx-auto max-w-2xl mt-4 mb-2 p-3 bg-red-100 text-red-700 rounded border border-red-300 text-center">
          {saveError}
        </div>
      )}

      <Header
        title="Account Settings"
        subtitle="Manage your profile and account preferences"
        actions={
          activeTab === "profile" && editing ? (
            <div className="flex items-center gap-3">
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
            </div>
          ) : activeTab === "profile" ? (
            <Button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : null
        }
        tabs={[
          { id: "profile", label: "Profile", icon: User },
          { id: "settings", label: "Settings", icon: Settings },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="p-8">
        {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col items-center text-center">
                {/* Profile Picture */}
                <div className="relative mb-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Camera className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {userData.first_name} {userData.surname}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  {userData.position}
                </p>
                <Badge className={getRoleColor(userData.role)}>
                  {userData.role.charAt(0).toUpperCase() +
                    userData.role.slice(1).replace("_", " ")}
                </Badge>

                <div className="w-full mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Email
                      </p>
                      <p className="text-sm text-slate-900 dark:text-white truncate">
                        {userData.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Phone
                      </p>
                      <p className="text-sm text-slate-900 dark:text-white">
                        {userData.phone_number || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Department
                      </p>
                      <p className="text-sm text-slate-900 dark:text-white">
                        {userData.department || "Not assigned"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Employment Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="text-slate-600 dark:text-slate-400 text-sm">
                    Hire Date
                  </span>
                  <span className="text-slate-900 dark:text-white text-sm font-medium">
                    {formatDate(userData.hire_date)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="text-slate-600 dark:text-slate-400 text-sm">
                    Type
                  </span>
                  <Badge variant="outline">
                    {userData.employment_type || "Not specified"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="text-slate-600 dark:text-slate-400 text-sm">
                    Tenure
                  </span>
                  <span className="text-slate-900 dark:text-white text-sm font-medium">
                    {userData.hire_date
                      ? `${Math.floor(
                          (new Date() - new Date(userData.hire_date)) /
                            (1000 * 60 * 60 * 24 * 365)
                        )} years`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
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
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    First Name
                  </Label>
                  {editing ? (
                    <Input
                      value={formData.first_name}
                      onChange={(e) =>
                        handleInputChange("first_name", e.target.value)
                      }
                      className="border-slate-300 dark:border-slate-700"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-slate-900 dark:text-white">
                        {userData.first_name}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Surname
                  </Label>
                  {editing ? (
                    <Input
                      value={formData.surname}
                      onChange={(e) =>
                        handleInputChange("surname", e.target.value)
                      }
                      className="border-slate-300 dark:border-slate-700"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-slate-900 dark:text-white">
                        {userData.surname}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Date of Birth
                  </Label>
                  {editing ? (
                    <Input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        handleInputChange("date_of_birth", e.target.value)
                      }
                      className="border-slate-300 dark:border-slate-700"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <p className="text-slate-900 dark:text-white">
                          {formatDate(userData.date_of_birth)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    National ID
                  </Label>
                  {editing ? (
                    <Input
                      value={formData.national_id}
                      onChange={(e) =>
                        handleInputChange("national_id", e.target.value)
                      }
                      className="border-slate-300 dark:border-slate-700"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-slate-900 dark:text-white font-mono text-sm">
                        {showNationalId && revealedNationalId
                          ? revealedNationalId
                          : userData.masked_national_id || "Not provided"}
                      </span>
                      {userData.masked_national_id && (
                        <button
                          type="button"
                          className="ml-2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                          onClick={
                            showNationalId
                              ? handleHideNationalId
                              : handleRevealNationalId
                          }
                          aria-label={
                            showNationalId
                              ? "Hide National ID"
                              : "Show National ID"
                          }
                          disabled={revealingNationalId}
                        >
                          {revealingNationalId ? (
                            <span className="w-4 h-4 border border-slate-400 border-t-transparent rounded-full animate-spin inline-block align-middle" />
                          ) : showNationalId ? (
                            <EyeOff className="w-4 h-4 text-slate-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                  {!editing && revealNationalIdError && (
                    <div className="text-xs text-red-600 mt-1">
                      {revealNationalIdError}
                    </div>
                  )}
                  {!editing && showNationalId && revealedNationalId && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Full ID will auto-hide in 30 seconds for security
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Address
                  </Label>
                  {editing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className="w-full min-h-[80px] px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 dark:text-white resize-none"
                      rows={2}
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5" />
                        <p className="text-slate-900 dark:text-white">
                          {userData.address || "Not provided"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Address
                  </Label>
                  {editing ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="border-slate-300 dark:border-slate-700"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <p className="text-slate-900 dark:text-white">
                          {userData.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Phone Number
                  </Label>
                  {editing ? (
                    <Input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) =>
                        handleInputChange("phone_number", e.target.value)
                      }
                      className="border-slate-300 dark:border-slate-700"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <p className="text-slate-900 dark:text-white">
                          {userData.phone_number || "Not provided"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Emergency Contact Name
                  </Label>
                  {editing ? (
                    <Input
                      value={formData.emergency_contact_name}
                      onChange={(e) =>
                        handleInputChange(
                          "emergency_contact_name",
                          e.target.value
                        )
                      }
                      className="border-slate-300 dark:border-slate-700"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <p className="text-slate-900 dark:text-white">
                          {userData.emergency_contact_name || "Not provided"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Emergency Contact Phone
                  </Label>
                  {editing ? (
                    <Input
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={(e) =>
                        handleInputChange(
                          "emergency_contact_phone",
                          e.target.value
                        )
                      }
                      className="border-slate-300 dark:border-slate-700"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <p className="text-slate-900 dark:text-white">
                          {userData.emergency_contact_phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Additional Notes
                </h2>
              </div>

              {editing ? (
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Add any additional notes or information..."
                  className="w-full min-h-[120px] px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 dark:text-white resize-none"
                  rows={4}
                />
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[120px]">
                  <p className="text-slate-900 dark:text-white whitespace-pre-wrap">
                    {userData.notes || "No additional notes"}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
        )}

        {activeTab === "settings" && (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Security Settings */}
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Security & Authentication
                </h2>
              </div>

              <div className="space-y-4">
                {/* Password */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          Password
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Last changed 3 months ago
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowChangePw(true)}>
                      Change Password
                    </Button>
                  </div>
                </div>
                {activeTab === "settings" && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Change Password Modal */}
                  {showChangePw && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                <Lock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Change Password</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Update your account password</p>
                              </div>
                            </div>
                            <button 
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" 
                              onClick={() => {
                                setShowChangePw(false);
                                setPwForm({ current_password: "", new_password: "", confirm: "" });
                                setShowCurrentPw(false);
                                setShowNewPw(false);
                                setShowConfirmPw(false);
                              }}
                            >
                              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                            </button>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                          {/* Current Password */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              Current Password
                            </Label>
                            <div className="relative">
                              <Input
                                type={showCurrentPw ? "text" : "password"}
                                value={pwForm.current_password}
                                onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                                placeholder="Enter your current password"
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPw(!showCurrentPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              >
                                {showCurrentPw ? (
                                  <EyeOff className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                ) : (
                                  <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* New Password */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              New Password
                            </Label>
                            <div className="relative">
                              <Input
                                type={showNewPw ? "text" : "password"}
                                value={pwForm.new_password}
                                onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                                placeholder="Enter your new password"
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPw(!showNewPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              >
                                {showNewPw ? (
                                  <EyeOff className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                ) : (
                                  <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Must be at least 8 characters long
                            </p>
                          </div>

                          {/* Confirm Password */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              Confirm New Password
                            </Label>
                            <div className="relative">
                              <Input
                                type={showConfirmPw ? "text" : "password"}
                                value={pwForm.confirm}
                                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                                placeholder="Confirm your new password"
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPw(!showConfirmPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              >
                                {showConfirmPw ? (
                                  <EyeOff className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                ) : (
                                  <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                )}
                              </button>
                            </div>
                            {pwForm.confirm && pwForm.new_password !== pwForm.confirm && (
                              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Passwords do not match
                              </p>
                            )}
                          </div>

                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowChangePw(false);
                              setPwForm({ current_password: "", new_password: "", confirm: "" });
                              setShowCurrentPw(false);
                              setShowNewPw(false);
                              setShowConfirmPw(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={async () => {
                              if (!pwForm.current_password || !pwForm.new_password) {
                                toastError("Missing Fields", "Please fill in all password fields");
                                return;
                              }
                              if (pwForm.new_password.length < 8) {
                                toastError("Weak Password", "Password must be at least 8 characters long");
                                return;
                              }
                              if (pwForm.new_password !== pwForm.confirm) {
                                toastError("Mismatch", "New passwords do not match");
                                return;
                              }
                              try {
                                setPwSaving(true);
                                await post("/auth/change-password", {
                                  current_password: pwForm.current_password,
                                  new_password: pwForm.new_password,
                                });
                                toastSuccess("Password Updated", "Your password has been changed successfully.");
                                setShowChangePw(false);
                                setPwForm({ current_password: "", new_password: "", confirm: "" });
                                setShowCurrentPw(false);
                                setShowNewPw(false);
                                setShowConfirmPw(false);
                              } catch (e) {
                                toastError("Update Failed", e?.message || "Could not change password");
                              } finally {
                                setPwSaving(false);
                              }
                            }}
                            disabled={pwSaving || !pwForm.current_password || !pwForm.new_password || pwForm.new_password !== pwForm.confirm}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {pwSaving ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Update Password"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* Multi-Factor Authentication */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          Two-Factor Authentication
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {mfaEnabled ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Disabled
                        </Badge>
                      )}
                    </div>
                  </div>

                  {!mfaEnabled && !showMfaSetup && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowMfaSetup(true)}
                    >
                      Enable 2FA
                    </Button>
                  )}

                  {showMfaSetup && !mfaEnabled && (
                    <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          Choose your preferred authentication method
                        </p>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setMfaEnabled(true);
                            setShowMfaSetup(false);
                          }}
                          className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                Authenticator App
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                Use Google Authenticator or similar apps
                              </p>
                            </div>
                          </div>
                        </button>

                        <button className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                              <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                SMS Verification
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                Receive codes via text message
                              </p>
                            </div>
                          </div>
                        </button>

                        <button className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                Email Verification
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                Receive codes via email
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowMfaSetup(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {mfaEnabled && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setMfaEnabled(false)}
                      >
                        Disable 2FA
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        View Backup Codes
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Notification Preferences */}
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Notification Preferences
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: "Email Notifications",
                    description: "Receive updates via email",
                  },
                  {
                    label: "SMS Notifications",
                    description: "Get text message alerts",
                  },
                  {
                    label: "Push Notifications",
                    description: "Browser push notifications",
                  },
                  {
                    label: "Weekly Digest",
                    description: "Summary of weekly activities",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={index < 2}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserSettingsPage;
