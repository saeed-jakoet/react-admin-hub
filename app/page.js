"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Calendar,
  FileText,
  Truck,
  X,
  Filter,
  Eye,
  Clock,
  ExternalLink,
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
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import {
  getDropCableStatusColor,
  formatStatusText,
} from "@/lib/utils/dropCableColors";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-styles.css";
import { Loader } from "@/components/shared/Loader";

const localizer = momentLocalizer(moment);

export default function OverviewPage() {
  const router = useRouter();

  // Calendar and Orders State
  const [orders, setOrders] = React.useState([]);
  const [filteredOrders, setFilteredOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [orderDetailsDialog, setOrderDetailsDialog] = React.useState(false);

  // Calendar Navigation State
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [currentView, setCurrentView] = React.useState("month");
  const [selectedClient, setSelectedClient] = React.useState("");
  const [selectedOrderType, setSelectedOrderType] = React.useState("");
  const [clients, setClients] = React.useState([]);

  // Load saved selections from localStorage on component mount
  React.useEffect(() => {
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
  React.useEffect(() => {
    if (selectedClient) {
      localStorage.setItem("calendar-selected-client", selectedClient);
    } else {
      localStorage.removeItem("calendar-selected-client");
    }
  }, [selectedClient]);

  React.useEffect(() => {
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
  const [newJobDialogOpen, setNewJobDialogOpen] = React.useState(false);
  const [selectedJobTypeForNew, setSelectedJobTypeForNew] = React.useState("");
  const [selectedClientForNew, setSelectedClientForNew] = React.useState("");
  const [loadingClients, setLoadingClients] = React.useState(false);

  // Use centralized status colors
  const statusColors = React.useMemo(() => {
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

  React.useEffect(() => {
    fetchClients();
  }, []);

  React.useEffect(() => {
    if (selectedClient && selectedOrderType) {
      fetchOrders();
    } else {
      setOrders([]);
      setFilteredOrders([]);
    }
  }, [selectedClient, selectedOrderType]);

  React.useEffect(() => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter]);

  const fetchOrders = async () => {
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
  };

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
      setOrderDetailsDialog(true);
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

  // Dynamically get unique statuses from the actual order data
  const uniqueStatuses = React.useMemo(() => {
    const statuses = new Set();
    orders.forEach((order) => {
      if (order.status) {
        statuses.add(order.status);
      }
    });
    return Array.from(statuses);
  }, [orders]);

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
  function CalendarSection() {
    return (
      <div className="lg:col-span-3">
        <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Business Overview
                  </h2>
                  <p className="text-gray-600 dark:text-slate-400 text-sm">
                    {selectedClient && selectedOrderType
                      ? `${orders.length} orders • ${filteredOrders.length} filtered`
                      : "Select client and order type to view calendar"}
                  </p>
                </div>
              </div>
            </div>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Client Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  Client *
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company_name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Order Type Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  Order Type *
                </label>
                <select
                  value={selectedOrderType}
                  onChange={(e) => setSelectedOrderType(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Order Type...</option>
                  {orderTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  disabled={!selectedClient || !selectedOrderType}
                  className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="all">All Statuses</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {formatStatusText(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Status Legend */}
            <div className="mt-6 flex flex-wrap gap-2">
              {Object.entries(statusColors)
                .filter(
                  ([key]) => key !== "default" && uniqueStatuses.includes(key)
                )
                .slice(0, 8)
                .map(([status, color]) => (
                  <div
                    key={status}
                    className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-700 rounded-lg px-3 py-1.5"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                      {formatStatusText(status)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-slate-900/50">
            {!selectedClient || !selectedOrderType ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Select Client & Order Type
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 mb-4">
                    Choose a client and order type to view the orders calendar
                  </p>
                </div>
              </div>
            ) : loading ? (
              <Loader variant="bars" text="Calendar Loading..." />
            ) : orders.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Orders Found
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 mb-4">
                    No orders found for the selected client and order type
                  </p>
                  <Button
                    onClick={handleNewJobClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Order
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[600px] bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <BigCalendar
                  localizer={localizer}
                  events={transformOrdersToEvents(filteredOrders)}
                  startAccessor="start"
                  endAccessor="end"
                  date={currentDate}
                  view={currentView}
                  onNavigate={handleNavigate}
                  onView={handleViewChange}
                  onSelectEvent={handleEventClick}
                  eventPropGetter={getEventProp}
                  style={{ height: "100%" }}
                  className="premium-calendar"
                  views={["month", "week", "day", "agenda"]}
                  popup={true}
                  popupOffset={{ x: 10, y: 10 }}
                  showMultiDayTimes={true}
                  step={60}
                  timeslots={2}
                  scrollToTime={new Date(1970, 1, 1, 8)}
                  formats={{
                    timeGutterFormat: "HH:mm",
                    eventTimeRangeFormat: (
                      { start, end },
                      culture,
                      localizer
                    ) =>
                      localizer.format(start, "HH:mm", culture) +
                      " - " +
                      localizer.format(end, "HH:mm", culture),
                    agendaTimeFormat: "HH:mm",
                    agendaTimeRangeFormat: (
                      { start, end },
                      culture,
                      localizer
                    ) =>
                      localizer.format(start, "HH:mm", culture) +
                      " - " +
                      localizer.format(end, "HH:mm", culture),
                  }}
                  messages={{
                    next: "Next",
                    previous: "Previous",
                    today: "Today",
                    month: "Month",
                    week: "Week",
                    day: "Day",
                    agenda: "Agenda",
                    date: "Date",
                    time: "Time",
                    event: "Event",
                    noEventsInRange: "No orders in this range.",
                    showMore: (total) => `+${total} more`,
                  }}
                  components={{
                    event: ({ event }) => {
                      const order = event.resource;
                      const tooltipText = `Circuit: ${
                        order.circuit_number || "No Circuit"
                      }
Client: ${order.clients?.company_name || order.client || "Unknown"}
Status: ${formatStatusText(order.status)}
Event: ${order.eventType}
${order.eventTime ? `Time: ${order.eventTime}` : ""}
${order.pm ? `PM: ${order.pm}` : ""}

Click to edit this job`;
                      return (
                        <div
                          className="text-xs font-medium truncate px-1 cursor-pointer hover:opacity-80"
                          title={tooltipText}
                        >
                          {event.title}
                        </div>
                      );
                    },
                  }}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  function Sidebar() {
    return (
      <div className="lg:col-span-1 space-y-6">
        {/* Quick Actions */}
        <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-xl">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center uppercase tracking-wide">
              <Activity className="w-4 h-4 mr-2" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-14 flex-col text-xs bg bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <FileText className="w-4 h-4 mb-1 text-white" />
                Quote
              </Button>
              <Button
                size="sm"
                onClick={handleNewJobClick}
                className="h-14 flex-col text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Calendar className="w-4 h-4 mb-1" />
                New Order
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-14 flex-col text-xs bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Truck className="w-4 h-4 mb-1 text-white" />
                Track
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-14 flex-col text-xs bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Package className="w-4 h-4 mb-1 text-white" />
                Stock
              </Button>
            </div>
          </div>
        </Card>
        {/* Critical Alerts */}
        <Card className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 shadow-sm rounded-xl">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alerts
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-red-100/60 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30">
                <p className="text-xs font-medium text-red-900 dark:text-red-100">
                  Low Stock
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  Fiber cable: 500m
                </p>
              </div>
              <div className="p-3 bg-orange-100/60 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/30">
                <p className="text-xs font-medium text-orange-900 dark:text-orange-100">
                  Overdue
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  3 payments pending
                </p>
              </div>
            </div>
          </div>
        </Card>
        {/* Performance Metrics */}
        <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-xl">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center uppercase tracking-wide">
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                  Completed
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  47
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                  Success Rate
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  94%
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                  Rating
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  4.8★
                </span>
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
              Create New Job
            </DialogTitle>
            <DialogDescription>
              Select a job type and client to create a new job.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Job Type Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type</Label>
              <select
                id="jobType"
                value={selectedJobTypeForNew}
                onChange={(e) => setSelectedJobTypeForNew(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select job type...</option>
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

  function OrderDetailsDialog() {
    return (
      <Dialog open={orderDetailsDialog} onOpenChange={setOrderDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Order Details
            </DialogTitle>
            <DialogDescription>
              View comprehensive order information and timeline
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6 py-4">
              {/* Order Header */}
              <div className="flex items-start justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-mono rounded-full">
                      {selectedEvent.circuit_number || "No Circuit"}
                    </span>
                    <span
                      className="px-3 py-1 text-xs font-semibold rounded-full text-white"
                      style={{
                        backgroundColor:
                          statusColors[selectedEvent.status] ||
                          statusColors.default,
                      }}
                    >
                      {formatStatusText(selectedEvent.status)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {selectedEvent.clients?.company_name ||
                      selectedEvent.client ||
                      "Unknown Company"}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 flex items-center font-medium">
                    <FileText className="w-4 h-4 mr-2" />
                    Event: {selectedEvent.eventType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Event Date
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedEvent.eventDate
                      ? new Date(selectedEvent.eventDate).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
              </div>
              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                      Client Contact
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {selectedEvent.client_contact_name || "Not assigned"}
                    </p>
                  </div>
                  <div className="p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                      End Client Contact
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {selectedEvent.end_client_contact_name || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                      Service Provider
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedEvent.service_provider || "Not assigned"}
                    </p>
                  </div>
                  <div className="p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                      Created Date
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {selectedEvent.created_at
                        ? new Date(
                            selectedEvent.created_at
                          ).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Project Manager
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedEvent.pm || "Not assigned"}
                  </p>
                </div>
                <div className="p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    County
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {selectedEvent.county || "Not specified"}
                  </p>
                </div>
              </div>
              {/* Notes */}
              {selectedEvent.notes && selectedEvent.notes.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Latest Notes
                  </p>
                  {selectedEvent.notes.slice(0, 3).map((note, index) => (
                    <div key={index} className="mb-2 last:mb-0">
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        {note.text}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">
                        {new Date(note.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOrderDetailsDialog(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedEvent?.id) {
                  router.push(`/orders/${selectedEvent.id}`);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Details
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
      <OrderDetailsDialog />
    </div>
  );
}
