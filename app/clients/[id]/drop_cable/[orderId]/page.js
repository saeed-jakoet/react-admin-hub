"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { useParams, useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Building2,
  MapPin,
  Users,
  Phone,
  Calendar,
  Activity,
  Hash,
  RefreshCw,
  Banknote,
  FileText,
  Settings,
  Plus,
  Trash2,
  Upload,
  Download,
  Eye,
  Cable,
  File,
  MoreVertical,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { get, post, put, del } from "@/lib/api/fetcher";
import { getDropCableStatusColor } from "@/lib/utils/dropCableColors";
import { useToast } from "@/components/shared/Toast";
import { jobTypeConfigs } from "@/lib/jobTypeConfigs";
import Header from "@/components/shared/Header";
import UploadDocumentDialog from "@/components/shared/UploadDocumentDialog";
import DocumentCard from "@/components/shared/DocumentCard";
import OrderCostBreakdown from "@/components/shared/OrderCostBreakdown";
import { Loader } from "@/components/shared/Loader";

const jobConfig = jobTypeConfigs["drop-cable"];

// Custom Rand icon for South African currency
const RandIcon = ({ className, ...props }) => (
  <span className={className} style={{ fontWeight: 700, fontSize: '1em', fontFamily: 'sans-serif', lineHeight: 1 }} {...props}>R</span>
);

export default function DropCableOrderPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const clientId = params.id;
  const orderId = params.orderId;
  // Check if we're on /new route (either via orderId param or pathname)
  const isNewOrder = orderId === "new" || pathname?.endsWith("/new");

  // Form state
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("operations");
  const [week, setWeek] = useState("");

  // Upload document state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Staff dropdowns
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [linkManagers, setLinkManagers] = useState([]);
  const [loadingLinkManagers, setLoadingLinkManagers] = useState(false);
  const [selectedLinkManagerId, setSelectedLinkManagerId] = useState("");

  // Service multipliers
  const [surveyMultiplier, setSurveyMultiplier] = useState(1);
  const [calloutMultiplier, setCalloutMultiplier] = useState(1);
  const [installPercentEnabled, setInstallPercentEnabled] = useState(false);

  // Fetch client data
  const { data: clientData } = useSWR(
    clientId ? `/client/${clientId}` : null,
    () => get(`/client/${clientId}`),
    { revalidateOnFocus: false }
  );
  const client = clientData?.data;

  // Fetch order data (if editing)
  const { data: orderData, isLoading: loadingOrder } = useSWR(
    !isNewOrder && orderId ? `/drop-cable/${orderId}` : null,
    () => get(`/drop-cable/${orderId}`),
    { revalidateOnFocus: false }
  );

  // Fetch documents for this order
  const { data: documentsData, isLoading: loadingDocuments } = useSWR(
    !isNewOrder && orderId ? `/documents/drop-cable/${orderId}` : null,
    () => get(`/documents/drop-cable/${orderId}`),
    { revalidateOnFocus: false }
  );
  const documents = documentsData?.data || [];

  // Load technicians
  useEffect(() => {
    const loadTechnicians = async () => {
      setLoadingTechnicians(true);
      try {
        const res = await get("/staff?role=technician");
        setTechnicians(res.data || []);
      } catch (err) {
        console.error("Failed to load technicians:", err);
      } finally {
        setLoadingTechnicians(false);
      }
    };
    loadTechnicians();
  }, []);

  // Load link managers
  useEffect(() => {
    const loadLinkManagers = async () => {
      setLoadingLinkManagers(true);
      try {
        const allStaff = await get("/staff");
        const managers = (allStaff.data || []).filter((staff) =>
          ["super_admin", "admin", "manager"].includes(staff.role)
        );
        setLinkManagers(managers);
      } catch (err) {
        console.error("Failed to load link managers:", err);
      } finally {
        setLoadingLinkManagers(false);
      }
    };
    loadLinkManagers();
  }, []);

  // Initialize form data
  useEffect(() => {
    if (isNewOrder && client) {
      // New order - pre-populate with client data when client is loaded
      const contactName = `${client.first_name || ""} ${client.last_name || ""}`.trim();
      setFormData((prev) => ({
        ...prev,
        client: client.company_name || "",
        client_contact_name: contactName || "",
        end_client_contact_phone: client.phone_number || "",
        status: prev.status || "awaiting_client_confirmation_date",
      }));
    } else if (orderData?.data) {
      // Editing existing order
      const order = orderData.data;
      setFormData(order);
      setWeek(order.week || "");
      setSelectedTechnicianId(order.technician_id || "");
      setSelectedLinkManagerId(order.link_manager_id || "");
      setSurveyMultiplier(order.survey_planning_multiplier || 1);
      setCalloutMultiplier(order.callout_multiplier || 1);
      setInstallPercentEnabled(Boolean(order.install_completion_percent));
    }
  }, [isNewOrder, orderData, client]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTechnicianChange = (technicianId) => {
    setSelectedTechnicianId(technicianId);
    const selectedTech = technicians.find((t) => t.id === technicianId);
    if (selectedTech) {
      const technicianName = `${selectedTech.first_name || ""} ${selectedTech.surname || ""}`.trim();
      handleInputChange("technician", technicianName);
      handleInputChange("technician_name", technicianName);
    } else {
      handleInputChange("technician", "");
      handleInputChange("technician_name", "");
    }
  };

  const handleLinkManagerChange = (linkManagerId) => {
    setSelectedLinkManagerId(linkManagerId);
    const selectedLM = linkManagers.find((lm) => lm.id === linkManagerId);
    if (selectedLM) {
      const linkManagerName = `${selectedLM.first_name || ""} ${selectedLM.surname || ""}`.trim();
      handleInputChange("link_manager", linkManagerName);
    } else {
      handleInputChange("link_manager", "");
    }
  };

  const preparePayload = () => {
    const payload = { ...formData };

    if (!isNewOrder && orderId) {
      payload.id = orderId;
    }

    if (isNewOrder && clientId) {
      payload.client_id = clientId;
    }

    if (week && week.trim()) {
      payload.week = week.trim();
    }

    if (surveyMultiplier > 1 && Boolean(formData.survey_planning)) {
      payload.survey_planning_multiplier = surveyMultiplier;
    }
    if (calloutMultiplier > 1 && Boolean(formData.callout)) {
      payload.callout_multiplier = calloutMultiplier;
    }

    if (installPercentEnabled && formData.install_completion_percent) {
      payload.install_completion_percent = parseInt(formData.install_completion_percent);
    }

    if (selectedTechnicianId) {
      payload.technician_id = selectedTechnicianId;
    }
    if (selectedLinkManagerId) {
      payload.link_manager_id = selectedLinkManagerId;
    }

    // Format phone number
    if (payload.end_client_contact_phone) {
      let digits = String(payload.end_client_contact_phone).replace(/\D/g, "");
      if (digits.length === 10 && digits.startsWith("0")) {
        payload.end_client_contact_phone = "+27" + digits.slice(1);
      } else if (digits.length === 9 && !digits.startsWith("0")) {
        payload.end_client_contact_phone = "+27" + digits;
      }
    }

    return payload;
  };

  const handleSave = async () => {
    if (!formData.circuit_number || !formData.site_b_name) {
      toast.error("Validation Error", "Circuit Number and Site B Name are required");
      return;
    }

    setSaving(true);
    try {
      const payload = preparePayload();

      if (isNewOrder) {
        const result = await post("/drop-cable", payload);
        toast.success("Success", "Order created successfully");
        // Navigate to the new order's page
        router.replace(`/clients/${clientId}/drop_cable/${result.data?.id || result.id}`);
      } else {
        await put("/drop-cable", payload);
        toast.success("Success", "Order updated successfully");
        mutate(`/drop-cable/${orderId}`);
      }
    } catch (err) {
      toast.error("Error", err.message || "Failed to save order");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/clients/${clientId}/drop_cable`);
  };

  // Helper to create identifier from string
  const toIdentifier = (s) =>
    String(s || "")
      .trim()
      .replace(/[\\/]+/g, "-")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "");

  // Upload document handler
  const handleUploadDocument = async ({ file, fileName }) => {
    setUploading(true);
    try {
      // Get client name for path building
      const clientName = client?.company_name ||
        `${client?.first_name || ""} ${client?.last_name || ""}`.trim() ||
        formData.client || "Client";
      const clientIdentifier = toIdentifier(clientName);

      if (!formData.circuit_number) {
        throw new Error("Circuit number is required for uploading documents");
      }

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("fileName", fileName);
      formDataUpload.append("clientName", clientName);
      formDataUpload.append("clientIdentifier", clientIdentifier);
      formDataUpload.append("circuitNumber", formData.circuit_number);
      formDataUpload.append("dropCableJobId", orderId);
      formDataUpload.append("clientId", clientId);
      formDataUpload.append("jobType", "drop_cable");

      const result = await post("/documents/upload", formDataUpload);

      toast.success("Success", "Document uploaded successfully");
      mutate(`/documents/drop-cable/${orderId}`);
      setUploadModalOpen(false);
    } catch (err) {
      toast.error("Error", err.message || "Failed to upload document");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // Get status color
  const statusColor = getDropCableStatusColor(formData.status || "");

  // Status options
  const statusOptions = jobConfig.sections
    ?.flatMap((s) => s.fields)
    ?.find((f) => f.name === "status")?.options || [];

  if (!isNewOrder && loadingOrder) {
    return <Loader variant="bars" text="Loading client data..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <Header
        title={isNewOrder ? "New Drop Cable Order" : formData.circuit_number || "Edit Order"}
        subtitle={client?.company_name || "Client"}
        stats={
          <div className="flex items-center gap-3">
            {formData.site_b_name && (
              <>
                <span className="text-slate-600 dark:text-slate-400">{formData.site_b_name}</span>
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
              </>
            )}
            <Badge className={statusColor}>
              {statusOptions.find(s => s.value === formData.status)?.label || "Draft"}
            </Badge>
          </div>
        }
        logo={{ fallbackIcon: Cable }}
        statusIndicator={formData.status === "completed"}
        onBack={handleBack}
        actions={
          <div className="flex items-center gap-3">
            <select
              value={formData.status || "awaiting_client_confirmation_date"}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="px-3 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        }
        tabs={[
          { id: "operations", label: "Operations", icon: Settings },
          { id: "finances", label: "Finances", icon: Banknote },
          { id: "documents", label: "Documents", icon: FileText },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Operations Tab */}
        {activeTab === "operations" && (
          <div className="space-y-6">
            {/* Client Information */}
            <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Client Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Client Name</Label>
                  <Input
                    value={formData.client || ""}
                    onChange={(e) => handleInputChange("client", e.target.value)}
                    placeholder="Client name"
                    className="mt-1.5 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">County</Label>
                  <select
                    value={formData.county || ""}
                    onChange={(e) => handleInputChange("county", e.target.value)}
                    className="w-full mt-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  >
                    <option value="">Select County</option>
                    <option value="tablebay">Tablebay</option>
                    <option value="falsebay">Falsebay</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Client Contact</Label>
                  <Input
                    value={formData.client_contact_name || ""}
                    onChange={(e) => handleInputChange("client_contact_name", e.target.value)}
                    placeholder="Contact person"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Manager</Label>
                  <Input
                    value={formData.pm || ""}
                    onChange={(e) => handleInputChange("pm", e.target.value)}
                    placeholder="PM name"
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* End Client Contact */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Phone className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">End Client Contact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Name</Label>
                  <Input
                    value={formData.end_client_contact_name || ""}
                    onChange={(e) => handleInputChange("end_client_contact_name", e.target.value)}
                    placeholder="Contact name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    type="email"
                    value={formData.end_client_contact_email || ""}
                    onChange={(e) => handleInputChange("end_client_contact_email", e.target.value)}
                    placeholder="Email address"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</Label>
                  <Input
                    value={formData.end_client_contact_phone || ""}
                    onChange={(e) => handleInputChange("end_client_contact_phone", e.target.value)}
                    placeholder="+27..."
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* Job Details */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Circuit Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.circuit_number || ""}
                    onChange={(e) => handleInputChange("circuit_number", e.target.value)}
                    placeholder="Circuit number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Site B Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.site_b_name || ""}
                    onChange={(e) => handleInputChange("site_b_name", e.target.value)}
                    placeholder="Site B name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">DPC Distance (m)</Label>
                  <Input
                    type="number"
                    value={formData.dpc_distance_meters || ""}
                    onChange={(e) => handleInputChange("dpc_distance_meters", e.target.value)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Physical Address (Site B)</Label>
                  <Input
                    value={formData.physical_address_site_b || ""}
                    onChange={(e) => handleInputChange("physical_address_site_b", e.target.value)}
                    placeholder="Physical address"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Services Sub-section */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">Services</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { name: "survey_planning", label: "Survey Planning" },
                    { name: "callout", label: "Callout" },
                    { name: "installation", label: "Installation" },
                    { name: "spon_budi_opti", label: "SPON Budi Opti" },
                    { name: "splitter_install", label: "Splitter Install" },
                    { name: "mousepad_install", label: "Mousepad Install" },
                  ].map((service) => (
                    <div key={service.name} className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(formData[service.name])}
                          onChange={(e) => handleInputChange(service.name, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{service.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
                {Boolean(formData.installation) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={installPercentEnabled}
                        onChange={(e) => setInstallPercentEnabled(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Track Installation Completion %</span>
                    </label>
                    {installPercentEnabled && (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.install_completion_percent || ""}
                        onChange={(e) => handleInputChange("install_completion_percent", e.target.value)}
                        placeholder="0-100"
                        className="mt-2 w-32"
                      />
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Project Management */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Management</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Link Manager</Label>
                  {loadingLinkManagers ? (
                    <div className="flex items-center gap-2 p-3 mt-1 text-sm text-gray-500 border rounded-lg">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <select
                      value={selectedLinkManagerId}
                      onChange={(e) => handleLinkManagerChange(e.target.value)}
                      className="w-full mt-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                    >
                      <option value="">Select link manager</option>
                      {linkManagers.map((lm) => (
                        <option key={lm.id} value={lm.id}>
                          {lm.first_name} {lm.surname}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Provider</Label>
                  <Input
                    value={formData.service_provider || ""}
                    onChange={(e) => handleInputChange("service_provider", e.target.value)}
                    placeholder="Service provider"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Technician</Label>
                  {loadingTechnicians ? (
                    <div className="flex items-center gap-2 p-3 mt-1 text-sm text-gray-500 border rounded-lg">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <select
                      value={selectedTechnicianId}
                      onChange={(e) => handleTechnicianChange(e.target.value)}
                      className="w-full mt-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                    >
                      <option value="">Select technician</option>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.first_name} {tech.surname}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </Card>

            {/* Scheduling */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scheduling</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Survey Scheduled Date</Label>
                  <Input
                    type="date"
                    value={formData.survey_scheduled_date || ""}
                    onChange={(e) => handleInputChange("survey_scheduled_date", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Survey Scheduled Time</Label>
                  <Input
                    type="time"
                    value={formData.survey_scheduled_time || ""}
                    onChange={(e) => handleInputChange("survey_scheduled_time", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Survey Completed</Label>
                  <Input
                    type="date"
                    value={formData.survey_completed_at || ""}
                    onChange={(e) => handleInputChange("survey_completed_at", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Installation Scheduled Date</Label>
                  <Input
                    type="date"
                    value={formData.installation_scheduled_date || ""}
                    onChange={(e) => handleInputChange("installation_scheduled_date", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Installation Scheduled Time</Label>
                  <Input
                    type="time"
                    value={formData.installation_scheduled_time || ""}
                    onChange={(e) => handleInputChange("installation_scheduled_time", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Installation Completed</Label>
                  <Input
                    type="date"
                    value={formData.installation_completed_date || ""}
                    onChange={(e) => handleInputChange("installation_completed_date", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">LLA Sent</Label>
                  <Input
                    type="date"
                    value={formData.lla_sent_at || ""}
                    onChange={(e) => handleInputChange("lla_sent_at", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">LLA Received</Label>
                  <Input
                    type="date"
                    value={formData.lla_received_at || ""}
                    onChange={(e) => handleInputChange("lla_received_at", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">As-Built Submitted</Label>
                  <Input
                    type="date"
                    value={formData.as_built_submitted_at || ""}
                    onChange={(e) => handleInputChange("as_built_submitted_at", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h3>
              </div>
              <textarea
                value={formData.newNote || ""}
                onChange={(e) => handleInputChange("newNote", e.target.value)}
                placeholder="Add notes or comments..."
                rows={4}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm resize-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Display existing notes */}
              {formData.notes && Array.isArray(formData.notes) && formData.notes.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Previous Notes</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {formData.notes.map((note, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                        <p className="text-gray-900 dark:text-gray-100">{note.text || note}</p>
                        {note.created_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(note.created_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Finances Tab */}
        {activeTab === "finances" && (
          <div className="space-y-6">
            {/* Quote & Week Info */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quote Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quote #</Label>
                  <Input
                    value={formData.quote_no || ""}
                    onChange={(e) => handleInputChange("quote_no", e.target.value)}
                    placeholder="Quote number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Week</Label>
                  <select
                    value={week}
                    onChange={(e) => setWeek(e.target.value)}
                    className="w-full mt-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  >
                    <option value="">Select week</option>
                    {Array.from({ length: 52 }, (_, i) => {
                      const year = new Date().getFullYear();
                      const val = `${year}-${String(i + 1).padStart(2, "0")}`;
                      return (
                        <option key={i + 1} value={val}>
                          Week {i + 1}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </Card>

            {/* Additional Charges - Always editable */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <RandIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Charges</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Cost (R)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.additonal_cost || ""}
                    onChange={(e) => handleInputChange("additonal_cost", e.target.value)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason</Label>
                  <Input
                    value={formData.additonal_cost_reason || ""}
                    onChange={(e) => handleInputChange("additonal_cost_reason", e.target.value)}
                    placeholder="e.g., Cherry Picker Used"
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* Service Multipliers */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Hash className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Multipliers</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Adjust multipliers for quote calculations when services are performed multiple times.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg border ${Boolean(formData.survey_planning) ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Survey Planning</Label>
                    {Boolean(formData.survey_planning) ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                    )}
                  </div>
                  <select
                    value={surveyMultiplier}
                    onChange={(e) => setSurveyMultiplier(parseInt(e.target.value))}
                    disabled={!Boolean(formData.survey_planning)}
                    className="w-full p-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value={1}>1x (Standard)</option>
                    <option value={2}>2x (Double)</option>
                    <option value={3}>3x (Triple)</option>
                  </select>
                </div>
                <div className={`p-4 rounded-lg border ${Boolean(formData.callout) ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Callout</Label>
                    {Boolean(formData.callout) ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                    )}
                  </div>
                  <select
                    value={calloutMultiplier}
                    onChange={(e) => setCalloutMultiplier(parseInt(e.target.value))}
                    disabled={!Boolean(formData.callout)}
                    className="w-full p-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value={1}>1x (Standard)</option>
                    <option value={2}>2x (Double)</option>
                    <option value={3}>3x (Triple)</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Cost Breakdown - Only show for existing orders */}
            {!isNewOrder && orderId && (
              <OrderCostBreakdown orderId={orderId} orderType="drop_cable" />
            )}

            {isNewOrder && (
              <Card className="p-12">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Banknote className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium">Save the order first</p>
                  <p className="text-sm mt-1">Cost breakdown will be available after saving</p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {documents.length} {documents.length === 1 ? "file" : "files"}
              </p>
            </div>

            {isNewOrder ? (
              <Card className="p-12">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium">Save the order first</p>
                  <p className="text-sm mt-1">You can upload documents after saving</p>
                </div>
              </Card>
            ) : loadingDocuments ? (
              <Card className="p-12">
                <div className="flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              </Card>
            ) : documents.length === 0 ? (
              <Card className="p-12 border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium">No documents yet</p>
                  <p className="text-sm mt-1 mb-4">Upload your first document to get started</p>
                  <Button
                    variant="outline"
                    onClick={() => setUploadModalOpen(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    onDelete={() => {
                      toast.success("Success", "Document deleted");
                      mutate(`/documents/drop-cable/${orderId}`);
                    }}
                    onError={(msg) => toast.error("Error", msg)}
                    accentColor="blue"
                  />
                ))}

                {/* Upload New Card */}
                <div
                  onClick={() => setUploadModalOpen(true)}
                  className="aspect-auto min-h-[180px] bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
                    <Plus className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Add Document</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Document Dialog */}
      <UploadDocumentDialog
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUpload={handleUploadDocument}
        jobData={formData}
        uploading={uploading}
      />
    </div>
  );
}
