"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  AlertTriangle,
  Calendar,
  FileText,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { get } from "@/lib/api/fetcher";
import useSWR from "swr";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import CalendarBigCalendar from "@/components/calendar/CalendarBigCalendar";
import moment from "moment";
import {
  getDropCableStatusColor,
  formatStatusText,
} from "@/lib/utils/dropCableColors";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function OverviewPage() {
  const router = useRouter();

  // --- Low Stock Alerts with SWR ---
  const {
    data: inventoryData,
    error: inventoryError,
    isLoading: inventoryLoading,
  } = useSWR(["/inventory"], () => get("/inventory"), {
    revalidateOnFocus: true,
    dedupingInterval: 60000,
  });
  const lowStock =
    inventoryData?.data?.filter(
      (item) =>
        typeof item.quantity === "number" &&
        typeof item.minimum_quantity === "number" &&
        item.quantity < item.minimum_quantity
    ) || [];

  // Calendar and Orders State
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  // Persist selection by id so changing calendar month/view won't lose selection
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Calendar Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedOrderType, setSelectedOrderType] = useState("");
  const [clients, setClients] = useState([]);

  // Load saved selections from localStorage on component mount
  useEffect(() => {
    const savedClient = localStorage.getItem("calendar-selected-client");
    const savedOrderType = localStorage.getItem("calendar-selected-order-type");

    if (savedClient) {
      setSelectedClient(savedClient);
    }
    if (savedOrderType) {
      setSelectedOrderType(savedOrderType);
    }
  }, []);

  // Save selections to localStorage when they change
  useEffect(() => {
    if (selectedClient) {
      localStorage.setItem("calendar-selected-client", selectedClient);
    } else {
      localStorage.removeItem("calendar-selected-client");
    }
  }, [selectedClient]);

  useEffect(() => {
    if (selectedOrderType) {
      localStorage.setItem("calendar-selected-order-type", selectedOrderType);
    } else {
      localStorage.removeItem("calendar-selected-order-type");
    }
  }, [selectedOrderType]);

  // Available order types
  const orderTypes = [
    { value: "drop-cable", label: "Drop Cable" },
    { value: "maintenance", label: "Maintenance" },
    { value: "floating", label: "Floating" },
    { value: "adw", label: "ADW" },
    { value: "link-build", label: "Link Build" },
    { value: "civils", label: "Civils" },
    { value: "relocations", label: "Relocations" },
  ];

  // New Job Dialog State
  const [newJobDialogOpen, setNewJobDialogOpen] = useState(false);
  const [selectedJobTypeForNew, setSelectedJobTypeForNew] = useState("");
  const [selectedClientForNew, setSelectedClientForNew] = useState("");
  const [loadingClients, setLoadingClients] = useState(false);

  // Use centralized status colors
  const statusColors = useMemo(() => {
    const colors = {};
    const allKeys = [
      "awaiting_client_confirmation_date",
      "survey_required",
      "survey_scheduled",
      "survey_completed",
      "lla_required",
      "awaiting_lla_approval",
      "lla_received",
      "installation_scheduled",
      "installation_completed",
      "as_built_submitted",
      "issue_logged",
      "on_hold",
      "awaiting_health_and_safety",
      "planning_document_submitted",
      "awaiting_service_provider",
      "adw_required",
      "site_not_ready",
    ];
    allKeys.forEach((key) => {
      colors[key] = getDropCableStatusColor(key, "hex");
    });
    colors.default = "#6B7280";
    return colors;
  }, []);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!selectedClient || !selectedOrderType) return;

    try {
      setLoading(true);
      const response = await get(
        `/${selectedOrderType}/client/${selectedClient}`
      );
      if (response?.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClient, selectedOrderType]);

  useEffect(() => {
    if (selectedClient && selectedOrderType) {
      fetchOrders();
    } else {
      setOrders([]);
      setFilteredOrders([]);
    }
  }, [selectedClient, selectedOrderType, fetchOrders]);

  useEffect(() => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter]);

  const fetchClients = async () => {
    try {
      const response = await get("/client");
      if (response?.data) {
        setClients(response.data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const transformOrdersToEvents = (ordersData) => {
    const events = [];

    ordersData.forEach((order) => {
      // Add all statuses as event types with their best-guess date fields
      const dateTimeFields = [
        {
          dateField: "survey_scheduled_date",
          timeField: "survey_scheduled_time",
          label: "Survey Scheduled",
        },
        { dateField: "survey_completed_at", label: "Survey Completed" },
        {
          dateField: "installation_scheduled_date",
          timeField: "installation_scheduled_time",
          label: "Installation Scheduled",
        },
        {
          dateField: "installation_completed_date",
          label: "Installation Completed",
        },
        { dateField: "lla_sent_at", label: "LLA Sent" },
        { dateField: "lla_received_at", label: "LLA Received" },
        { dateField: "as_built_submitted_at", label: "As Built Submitted" },
        {
          dateField: "awaiting_client_confirmation_date",
          label: "Awaiting Client Confirmation Date",
        },
        { dateField: "survey_required_at", label: "Survey Required" },
        { dateField: "lla_required_at", label: "LLA Required" },
        {
          dateField: "awaiting_lla_approval_at",
          label: "Awaiting LLA Approval",
        },
        { dateField: "issue_logged_at", label: "Issue Logged" },
        { dateField: "on_hold_at", label: "On Hold" },
        {
          dateField: "awaiting_health_and_safety_at",
          label: "Awaiting Health And Safety",
        },
        {
          dateField: "planning_document_submitted_at",
          label: "Planning Document Submitted",
        },
        {
          dateField: "awaiting_service_provider_at",
          label: "Awaiting Service Provider",
        },
        { dateField: "adw_required_at", label: "ADW Required" },
        { dateField: "site_not_ready_at", label: "Site Not Ready" },
      ];

      dateTimeFields.forEach(({ dateField, timeField, label }) => {
        // Check if the date field has a value
        if (order[dateField] && order[dateField] !== null) {
          let eventDateTime = new Date(order[dateField]);
          let displayTime = "";

          // If there's a corresponding time field and it has a value, combine them
          if (timeField && order[timeField] && order[timeField] !== null) {
            try {
              const timeStr = order[timeField];
              const [hours, minutes] = timeStr.split(":");
              eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
              displayTime = ` at ${timeStr}`;
            } catch (error) {
              console.warn(
                `Invalid time format for ${timeField}:`,
                order[timeField]
              );
            }
          }

          if (!isNaN(eventDateTime.getTime())) {
            const clientName =
              order.clients?.company_name || order.client || "Unknown Client";
            const circuitNumber = order.circuit_number || "No Circuit";
            // Use the status color instead of event type color for consistency
            const eventColor =
              getDropCableStatusColor(order.status, "hex") ||
              getDropCableStatusColor(label, "hex");

            events.push({
              id: `${order.id}-${dateField}`,
              title: `${label}: ${clientName} - ${circuitNumber}`,
              start: eventDateTime,
              end: eventDateTime,
              resource: {
                ...order,
                eventType: label,
                eventField: dateField,
                eventDate: order[dateField],
                eventTime: timeField ? order[timeField] : null,
                displayTime: displayTime,
                eventColor: eventColor,
              },
            });
          }
        }
      });
    });

    return events;
  };

  const handleEventClick = (event) => {
    const order = event.resource;
    const clientId = order.client_id;

    // Map order type to route
    const orderTypeRoutes = {
      "drop-cable": "drop_cable",
      maintenance: "maintenance",
      floating: "floating",
      adw: "adw",
      "link-build": "link_build",
      civils: "civils",
      relocations: "relocations",
    };

    const route = orderTypeRoutes[selectedOrderType];

    if (clientId && route) {
      // Navigate to client page with edit parameters
      const params = new URLSearchParams({
        edit: "true",
        jobId: order.id,
        eventType: order.eventType || "",
      });

      router.push(`/clients/${clientId}/${route}?${params.toString()}`);
    } else {
      // Fallback to details dialog if navigation fails
      setSelectedEvent(order);
      setSelectedEventId(order?.id ?? null);
    }
  };

  const getEventProp = (event) => {
    // Use custom color from the event resource if available, otherwise fall back to status color
    const eventColor =
      event.resource.eventColor ||
      statusColors[event.resource.status] ||
      statusColors.default;

    return {
      style: {
        backgroundColor: eventColor,
        borderColor: eventColor,
        color: "black",
        border: "none",
        borderRadius: "6px",
        padding: "4px 8px",
        fontSize: "13px",
        fontWeight: "500",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      },
    };
  };

  // Calendar Navigation Handlers
  const handleNavigate = (newDate, view, action) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  // Handle opening New Job dialog
  const handleNewJobClick = () => {
    setNewJobDialogOpen(true);
  };

  // Handle job creation
  const handleCreateJob = () => {
    if (selectedJobTypeForNew && selectedClientForNew) {
      const client = clients.find((c) => c.id === selectedClientForNew);
      if (client) {
        // Map job types to their corresponding routes
        const jobTypeRoutes = {
          "Drop Cable Installations": "drop_cable",
          "Link Build": "link_build",
          Floating: "floating",
          "Civils (AWD)": "civils",
          "Access Build": "access_build",
          "Root Build": "root_build",
          Relocations: "relocations",
          Maintenance: "maintenance",
        };

        const route = jobTypeRoutes[selectedJobTypeForNew];

        // Navigate to client page with job type and client info
        const params = new URLSearchParams({
          new: "true",
          jobType: selectedJobTypeForNew,
          clientId: client.id,
          clientName: client.company_name,
        });

        router.push(`/clients/${client.id}/${route}?${params.toString()}`);
      }
    }
  };

  // Reset dialog state
  const resetDialog = () => {
    setSelectedJobTypeForNew("");
    setSelectedClientForNew("");
    setNewJobDialogOpen(false);
  };

  const events = transformOrdersToEvents(filteredOrders);
  console.log("Calendar events:", events);

  // --- Extracted Components ---
  // Re-select previously selected event (by id) after events change/navigations
  useEffect(() => {
    if (!selectedEventId) return;
    const found = events.find((e) => e.resource && e.resource.id === selectedEventId);
    if (found) {
      setSelectedEvent(found.resource);
    }
    // do not clear selection if not found; it may be off-view due to filters
  }, [events, selectedEventId]);
  function CalendarSection() {
    return (
      <div className="lg:col-span-3">
        <CalendarBigCalendar
          localizer={localizer}
          orders={orders}
          loading={loading}
          selectedClient={selectedClient}
          selectedOrderType={selectedOrderType}
          setSelectedClient={setSelectedClient}
          setSelectedOrderType={setSelectedOrderType}
          clients={clients}
          orderTypes={orderTypes}
          handleNewJobClick={handleNewJobClick}
          currentDate={currentDate}
          currentView={currentView}
          handleNavigate={handleNavigate}
          handleViewChange={handleViewChange}
          handleEventClick={handleEventClick}
          getEventProp={getEventProp}
          formatStatusText={formatStatusText}
          transformOrdersToEvents={transformOrdersToEvents}
        />
      </div>
    );
  }

  function Sidebar() {
    return (
      <div className="lg:col-span-1 space-y-6">
        {/* Quick Actions */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start h-11 text-sm font-medium text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                <FileText className="w-4 h-4 mr-3 text-slate-600 dark:text-slate-400" />
                Generate Quote
              </Button>
              <Button
                size="sm"
                onClick={handleNewJobClick}
                variant="outline"
                className="w-full justify-start h-11 text-sm font-medium text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                <Calendar className="w-4 h-4 mr-3 text-slate-600 dark:text-slate-400" />
                New Order
              </Button>
              {/* <Button
                size="sm"
                variant="outline"
                className="w-full justify-start h-11 text-sm font-medium text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                <Truck className="w-4 h-4 mr-3 text-slate-600 dark:text-slate-400" />
                Track Delivery
              </Button> */}
            </div>
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Low Stock Alerts
              </h3>
              {lowStock.length > 0 && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            {inventoryLoading ? (
              <div className="text-sm text-slate-500">
                Checking inventory...
              </div>
            ) : inventoryError ? (
              <div className="text-sm text-red-500">
                Failed to load inventory.
              </div>
            ) : lowStock.length === 0 ? (
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border-l-4 border-green-500">
                <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                    All Stock Healthy
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    All inventory levels are above minimum
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {lowStock.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-4 border-red-500"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                          {item.item_name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Current:{" "}
                          <span className="font-bold text-red-600">
                            {item.quantity}
                          </span>{" "}
                          {item.unit} • Min: {item.minimum_quantity} {item.unit}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {item.location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {lowStock.length > 5 && (
                  <p className="text-xs text-center text-slate-500 dark:text-slate-400 pt-2">
                    +{lowStock.length - 5} more items below minimum
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
              Performance
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Completed Orders
                  </span>
                  <span className="text-xl font-semibold text-slate-900 dark:text-white">
                    47
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: "78%" }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Success Rate
                  </span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    94%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Average Rating
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      4.8
                    </span>
                    <span className="text-amber-500">★</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    On-Time Delivery
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    89%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  function NewJobDialog() {
    return (
      <Dialog
        open={newJobDialogOpen}
        onOpenChange={(open) => {
          if (!open) resetDialog();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              New Order
            </DialogTitle>
            <DialogDescription>
              Select a order type and client to create a new order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Job Type Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="jobType">Order Type</Label>
              <select
                id="jobType"
                value={selectedJobTypeForNew}
                onChange={(e) => setSelectedJobTypeForNew(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select order type...</option>
                {[
                  "Drop Cable Installations",
                  "Link Build",
                  "Floating",
                  "Civils (AWD)",
                  "Access Build",
                  "Root Build",
                  "Relocations",
                  "Maintenance",
                ].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {/* Client Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <select
                id="client"
                value={selectedClientForNew}
                onChange={(e) => setSelectedClientForNew(e.target.value)}
                disabled={loadingClients}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">
                  {loadingClients ? "Loading clients..." : "Select client..."}
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleCreateJob}
              disabled={!selectedJobTypeForNew || !selectedClientForNew}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Clean Header with KPIs */}
      <div className="p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <CalendarSection />
          <Sidebar />
        </div>
      </div>
      <NewJobDialog />
    </div>
  );
}
