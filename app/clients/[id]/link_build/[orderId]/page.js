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
  Calendar,
  Activity,
  Hash,
  RefreshCw,
  Banknote,
  FileText,
  Settings,
  Upload,
  Download,
  Eye,
  Network,
} from "lucide-react";

// Custom Rand icon for South African currency
const RandIcon = ({ className, ...props }) => (
  <span className={className} style={{ fontWeight: 700, fontSize: '1em', fontFamily: 'sans-serif', lineHeight: 1 }} {...props}>R</span>
);
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { get, post, put } from "@/lib/api/fetcher";
import { getLinkBuildStatusColor } from "@/lib/utils/linkBuildColors";
import { useToast } from "@/components/shared/Toast";
import { jobTypeConfigs } from "@/lib/jobTypeConfigs";
import Header from "@/components/shared/Header";

const jobConfig = jobTypeConfigs["link-build"];

export default function LinkBuildOrderPage() {
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

  // Staff dropdowns
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");

  // Fetch client data
  const { data: clientData } = useSWR(
    clientId ? `/client/${clientId}` : null,
    () => get(`/client/${clientId}`),
    { revalidateOnFocus: false }
  );
  const client = clientData?.data;

  // Fetch order data (if editing)
  const { data: orderData, isLoading: loadingOrder } = useSWR(
    !isNewOrder && orderId ? `/link-build/${orderId}` : null,
    () => get(`/link-build/${orderId}`),
    { revalidateOnFocus: false }
  );

  // Fetch documents for this order
  const { data: documentsData, isLoading: loadingDocuments } = useSWR(
    !isNewOrder && orderId ? `/documents/link-build/${orderId}` : null,
    () => get(`/documents/link-build/${orderId}`),
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
        status: prev.status || "not_started",
      }));
    } else if (orderData?.data) {
      // Editing existing order
      const order = orderData.data;
      setFormData(order);
      setWeek(order.week || "");
      setSelectedTechnicianId(order.technician_id || "");
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
    } else {
      handleInputChange("technician", "");
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

    if (selectedTechnicianId) {
      payload.technician_id = selectedTechnicianId;
    }

    // Parse numeric fields
    ["no_of_fiber_pairs", "link_distance", "no_of_splices_after_15km"].forEach((field) => {
      if (payload[field]) {
        payload[field] = parseInt(payload[field]) || null;
      }
    });

    return payload;
  };

  const handleSave = async () => {
    if (!formData.circuit_number) {
      toast.error("Validation Error", "Circuit Number is required");
      return;
    }

    setSaving(true);
    try {
      const payload = preparePayload();
      
      if (isNewOrder) {
        const result = await post("/link-build", payload);
        toast.success("Success", "Order created successfully");
        // Navigate to the new order's page
        router.replace(`/clients/${clientId}/link_build/${result.data?.id || result.id}`);
      } else {
        await put("/link-build", payload);
        toast.success("Success", "Order updated successfully");
        mutate(`/link-build/${orderId}`);
      }
    } catch (err) {
      toast.error("Error", err.message || "Failed to save order");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/clients/${clientId}/link_build`);
  };

  // Get status color
  const statusColor = getLinkBuildStatusColor ? getLinkBuildStatusColor(formData.status || "") : "bg-gray-100 text-gray-800";

  // Status options
  const statusOptions = jobConfig.sections
    ?.flatMap((s) => s.fields)
    ?.find((f) => f.name === "status")?.options || [];

  // Service type options
  const serviceTypeOptions = jobConfig.sections
    ?.flatMap((s) => s.fields)
    ?.find((f) => f.name === "service_type")?.options || [];

  if (!isNewOrder && loadingOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <Header
        title={isNewOrder ? "New Link Build Order" : formData.circuit_number || "Edit Order"}
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
        logo={{ fallbackIcon: Network }}
        accentColor="purple"
        statusIndicator={formData.status === "completed"}
        onBack={handleBack}
        actions={
          <div className="flex items-center gap-3">
            <select
              value={formData.status || "not_started"}
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
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20"
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
            {/* Quick Info Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quote #</Label>
                <Input
                  value={formData.quote_no || ""}
                  onChange={(e) => handleInputChange("quote_no", e.target.value)}
                  placeholder="Quote number"
                  className="mt-2 border-0 bg-gray-50 dark:bg-gray-900/50 rounded-lg font-medium"
                />
              </Card>
              <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Week</Label>
                <select
                  value={week}
                  onChange={(e) => setWeek(e.target.value)}
                  className="w-full mt-2 p-2 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
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
              </Card>
              <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">County</Label>
                <select
                  value={formData.county || ""}
                  onChange={(e) => handleInputChange("county", e.target.value)}
                  className="w-full mt-2 p-2 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="">Select County</option>
                  <option value="tablebay">Tablebay</option>
                  <option value="falsebay">Falsebay</option>
                </select>
              </Card>
              <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Link Distance (km)</Label>
                <Input
                  type="number"
                  value={formData.link_distance || ""}
                  onChange={(e) => handleInputChange("link_distance", e.target.value)}
                  placeholder="0"
                  className="mt-2 border-gray-200 dark:border-gray-600"
                />
              </Card>
            </div>

            {/* Client Information */}
            <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Client Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Client Contact</Label>
                  <Input
                    value={formData.client_contact_name || ""}
                    onChange={(e) => handleInputChange("client_contact_name", e.target.value)}
                    placeholder="Contact person"
                    className="mt-1.5 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Manager</Label>
                  <Input
                    value={formData.pm || ""}
                    onChange={(e) => handleInputChange("pm", e.target.value)}
                    placeholder="PM name"
                    className="mt-1.5 rounded-lg"
                  />
                </div>
              </div>
            </Card>

            {/* Job Details */}
            <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Job Details</h3>
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
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Site B Name</Label>
                  <Input
                    value={formData.site_b_name || ""}
                    onChange={(e) => handleInputChange("site_b_name", e.target.value)}
                    placeholder="Site B name"
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* Technical Details */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Network className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Technical Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Number of Fiber Pairs</Label>
                  <Input
                    type="number"
                    value={formData.no_of_fiber_pairs || ""}
                    onChange={(e) => handleInputChange("no_of_fiber_pairs", e.target.value)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Splices After 15km</Label>
                  <Input
                    type="number"
                    value={formData.no_of_splices_after_15km || ""}
                    onChange={(e) => handleInputChange("no_of_splices_after_15km", e.target.value)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Type</Label>
                  <select
                    value={formData.service_type || ""}
                    onChange={(e) => handleInputChange("service_type", e.target.value)}
                    className="w-full mt-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  >
                    {serviceTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
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
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">ATP Pack Submitted</Label>
                  <Input
                    type="date"
                    value={formData.atp_pack_submitted || ""}
                    onChange={(e) => handleInputChange("atp_pack_submitted", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Check Date</Label>
                  <Input
                    type="date"
                    value={formData.check_date || ""}
                    onChange={(e) => handleInputChange("check_date", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Submission Date</Label>
                  <Input
                    type="date"
                    value={formData.submission_date || ""}
                    onChange={(e) => handleInputChange("submission_date", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">ATP Pack Loaded</Label>
                  <Input
                    type="date"
                    value={formData.atp_pack_loaded || ""}
                    onChange={(e) => handleInputChange("atp_pack_loaded", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">ATP Date</Label>
                  <Input
                    type="date"
                    value={formData.atp_date || ""}
                    onChange={(e) => handleInputChange("atp_date", e.target.value)}
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
                value={formData.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add notes or comments..."
                rows={4}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm resize-none focus:ring-2 focus:ring-blue-500"
              />
            </Card>
          </div>
        )}

        {/* Finances Tab */}
        {activeTab === "finances" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <RandIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Type</Label>
                  <select
                    value={formData.service_type || ""}
                    onChange={(e) => handleInputChange("service_type", e.target.value)}
                    className="w-full mt-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  >
                    {serviceTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pricing Summary */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Cost Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Service Type</span>
                      <span className="font-medium">{formData.service_type || "Not selected"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Fiber Pairs</span>
                      <span className="font-medium">{formData.no_of_fiber_pairs || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Link Distance</span>
                      <span className="font-medium">{formData.link_distance || 0} km</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Additional Splices</span>
                      <span className="font-medium">{formData.no_of_splices_after_15km || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h3>
                </div>
                {!isNewOrder && (
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                )}
              </div>

              {isNewOrder ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Save the order first to upload documents</p>
                </div>
              ) : loadingDocuments ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name || doc.file_name}</p>
                          <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
