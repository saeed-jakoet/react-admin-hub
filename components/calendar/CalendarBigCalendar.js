import { Calendar as BigCalendar } from "react-big-calendar";
import React from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as LucideCalendar } from "lucide-react";
import { Loader } from "@/components/shared/Loader";
import { getDropCableStatusColor } from "@/lib/utils/dropCableColors";

export default function CalendarBigCalendar({
  localizer,
  orders,
  loading,
  selectedClient,
  selectedOrderType,
  setSelectedClient,
  setSelectedOrderType,
  clients,
  orderTypes,
  handleNewJobClick,
  currentDate,
  currentView,
  handleNavigate,
  handleViewChange,
  handleEventClick,
  getEventProp,
  formatStatusText,
  transformOrdersToEvents,
}) {
  // State for hover popup
  const [hoveredEvent, setHoveredEvent] = React.useState(null);
  const [popupPosition, setPopupPosition] = React.useState({ x: 0, y: 0 });

  // Color mapping function for event types using dropCableColors
  const getEventColorByType = (eventType, status) => {
    // Normalize the eventType/status to snake_case for lookup
    let colorKey = eventType || status || "";

    // If eventType is a description like "As-Built Submitted", normalize it
    if (typeof colorKey === "string") {
      colorKey = colorKey
        .toLowerCase()
        .trim()
        .replace(/[\s-]+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
    }

    // Get color from dropCableColors - it will handle the normalization
    const hexColor = getDropCableStatusColor(colorKey, "hex");

    // Darken the color slightly for border
    const darkenColor = (hex) => {
      const num = parseInt(hex.replace("#", ""), 16);
      const r = Math.max(0, ((num >> 16) & 0xff) - 30);
      const g = Math.max(0, ((num >> 8) & 0xff) - 30);
      const b = Math.max(0, (num & 0xff) - 30);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    };

    return {
      backgroundColor: hexColor,
      borderColor: darkenColor(hexColor),
      color: "#ffffff",
    };
  };

  // Create a wrapper for eventPropGetter that uses event type-based colors
  const eventPropGetterWrapper = (event) => {
    const order = event.resource;
    const colors = getEventColorByType(order?.eventType, order?.status);

    return {
      style: {
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        color: colors.color,
        borderWidth: "2px",
        borderStyle: "solid",
        borderRadius: "6px",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      },
    };
  };

  // Event type options: only the scheduling/completion events requested
  const eventTypeOptions = [
    { key: "installation_scheduled_date", label: "Installation Scheduled", timeField: "installation_scheduled_time" },
    { key: "installation_completed_date", label: "Installation Completed" },
    { key: "survey_scheduled_date", label: "Survey Scheduled", timeField: "survey_scheduled_time" },
    { key: "survey_completed_at", label: "Survey Completed" },
    { key: "as_built_submitted_at", label: "As-Built Submitted" },
  ];

  // Helper: convert event date-field keys to status keys used by the color map
  const eventFieldToStatusKey = (field) =>
    typeof field === "string" ? field.replace(/(_date|_at)$/, "") : field;

  // Local calendar-scoped filter (do not modify global statusFilter)
  const [eventTypeFilter, setEventTypeFilter] = React.useState("all");

  // Persist the eventTypeFilter per client+orderType so it doesn't reset on navigation
  const storageKey = (client, orderType) => `calendar:eventType:${client}:${orderType}`;

  // Restore persisted filter when client or orderType changes
  React.useEffect(() => {
    if (!selectedClient || !selectedOrderType) {
      setEventTypeFilter("all");
      return;
    }
    try {
      const saved = localStorage.getItem(storageKey(selectedClient, selectedOrderType));
      if (saved) setEventTypeFilter(saved);
      else setEventTypeFilter("all");
    } catch (e) {
      setEventTypeFilter("all");
    }
  }, [selectedClient, selectedOrderType]);

  // Safe orders array
  const safeOrders = Array.isArray(orders) ? orders : [];

  // Allowed event fields list derived from eventTypeOptions
  const allowedEventFields = eventTypeOptions.map((opt) => opt.key);

  // Decide which orders to transform:
  // - If an eventType is selected, include only orders that have that field
  // - Otherwise include orders that contain any allowed event field
  const baseOrders =
    eventTypeFilter && eventTypeFilter !== "all"
      ? safeOrders.filter((o) => o && o[eventTypeFilter])
      : safeOrders.filter((o) => o && allowedEventFields.some((f) => o[f]));

  // Transform baseOrders to events and filter at the event level so that
  // only events whose eventField is in allowedEventFields are kept. If a
  // specific event type is selected, filter to that exact field.
  const calendarEvents = React.useMemo(() => {
    const events = transformOrdersToEvents(baseOrders) || [];
    const allowedEvents = events.filter((ev) =>
      allowedEventFields.includes(ev?.resource?.eventField)
    );
    if (eventTypeFilter && eventTypeFilter !== "all") {
      return allowedEvents.filter(
        (ev) => ev.resource.eventField === eventTypeFilter
      );
    }
    return allowedEvents;
  }, [baseOrders, transformOrdersToEvents, eventTypeFilter, allowedEventFields]);

  return (
    <>
      {/* Hover Popup Modal */}
      {hoveredEvent && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
          }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden backdrop-blur-sm w-80 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header */}
            <div
              className="px-4 py-3 border-b border-slate-200 dark:border-slate-700"
              style={{
                background: `linear-gradient(135deg, ${getDropCableStatusColor(
                  hoveredEvent.eventType || hoveredEvent.status || "",
                  "hex"
                )}15 0%, ${getDropCableStatusColor(
                  hoveredEvent.eventType || hoveredEvent.status || "",
                  "hex"
                )}05 100%)`,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{
                    backgroundColor: getDropCableStatusColor(
                      hoveredEvent.eventType || hoveredEvent.status || "",
                      "hex"
                    ),
                  }}
                />
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Event Details
                </h4>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">
                  Circuit:
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex-1">
                  {hoveredEvent.circuit_number || "No Circuit"}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">
                  Client:
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex-1">
                  {hoveredEvent.clients?.company_name ||
                    hoveredEvent.client ||
                    "Unknown"}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">
                  Status:
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex-1">
                  {formatStatusText(hoveredEvent.status)}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">
                  Event:
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex-1">
                  {hoveredEvent.eventType}
                </span>
              </div>

              {hoveredEvent.eventTime && (
                <div className="flex items-start gap-3">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">
                    Time:
                  </span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex-1">
                    {hoveredEvent.eventTime}
                  </span>
                </div>
              )}

              {hoveredEvent.pm && (
                <div className="flex items-start gap-3">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">
                    PM:
                  </span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex-1">
                    {hoveredEvent.pm}
                  </span>
                </div>
              )}

              {/* Footer hint */}
              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-2">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                  Click to edit this job
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <LucideCalendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Schedule
                </h2>
                <p className="text-gray-600 dark:text-slate-400 text-sm">
                  {selectedClient && selectedOrderType
                    ? `${orders.length} orders • ${calendarEvents.length} events`
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
            {/* Event Type Filter (calendar scoped) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Event Type
              </label>
              <select
                value={eventTypeFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setEventTypeFilter(val);
                  try {
                    if (selectedClient && selectedOrderType) {
                      localStorage.setItem(storageKey(selectedClient, selectedOrderType), val);
                    }
                  } catch (err) {
                    // ignore
                  }
                }}
                disabled={!selectedClient || !selectedOrderType}
                className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="all">All Events</option>
                {eventTypeOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Event Type Legend */}
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              Event Types
            </h4>
            <div className="flex flex-wrap gap-2">
              {eventTypeOptions.map(({ label, key }) => (
                <div
                  key={key}
                  className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-700 rounded-lg px-3 py-1.5"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getDropCableStatusColor(eventFieldToStatusKey(key), "hex"),
                    }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-slate-900/50">
          {!selectedClient || !selectedOrderType ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <LucideCalendar className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
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
                <LucideCalendar className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
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
                  <LucideCalendar className="w-4 h-4 mr-2" />
                  Create Order
                </Button>
              </div>
            </div>
          ) : calendarEvents.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <LucideCalendar className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Scheduled Events
                </h3>
                <p className="text-gray-600 dark:text-slate-400 mb-4">
                  There are orders, but none contain installation/survey/as-built dates to show on the calendar.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative h-[800px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/[0.02] to-purple-500/[0.02] dark:from-blue-400/[0.03] dark:to-purple-400/[0.03] pointer-events-none" />

              {/* Calendar container */}
              <div className="relative h-full p-6">
                <BigCalendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  date={currentDate}
                  view={currentView}
                  onNavigate={handleNavigate}
                  onView={handleViewChange}
                  onSelectEvent={handleEventClick}
                  eventPropGetter={eventPropGetterWrapper}
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
                    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                      localizer.format(start, "HH:mm", culture) +
                      " - " +
                      localizer.format(end, "HH:mm", culture),
                    agendaTimeFormat: "HH:mm",
                    agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
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

                      // Determine dot color based on event type using dropCableColors
                      const getEventDotColor = () => {
                        let colorKey = order.eventType || order.status || "";

                        if (typeof colorKey === "string") {
                          colorKey = colorKey
                            .toLowerCase()
                            .trim()
                            .replace(/[\s-]+/g, "_")
                            .replace(/[^a-z0-9_]/g, "");
                        }

                        const hexColor = getDropCableStatusColor(colorKey, "hex");
                        return hexColor;
                      };

                      return (
                        <div
                          className="relative text-xs font-semibold px-2 py-1 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:z-20 w-full flex items-center"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setPopupPosition({
                              x: rect.left + rect.width / 2 - 160,
                              y: rect.bottom + 8,
                            });
                            setHoveredEvent(order);
                          }}
                          onMouseLeave={() => {
                            setHoveredEvent(null);
                          }}
                          // Remove the default browser tooltip
                          title={undefined}
                        >
                          <div className="flex items-center gap-1.5 w-full">
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: getEventDotColor() }}
                              title={undefined}
                            />
                            <span className="truncate flex-1" title="">{event.title}</span>
                          </div>
                        </div>
                      );
                    },
                    toolbar: ({ label, onNavigate, onView, view }) => (
                      <div className="flex items-center justify-between mb-6 px-2">
                        {/* Navigation */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onNavigate("PREV")}
                            className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:scale-105 hover:shadow-lg transition-all duration-200 active:scale-95"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => onNavigate("TODAY")}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-200 active:scale-95"
                          >
                            Today
                          </button>

                          <button
                            onClick={() => onNavigate("NEXT")}
                            className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:scale-105 hover:shadow-lg transition-all duration-200 active:scale-95"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Current date label */}
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
                          {label}
                        </h2>

                        {/* View selector */}
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60">
                          {["month", "week", "day", "agenda"].map((v) => (
                            <button
                              key={v}
                              onClick={() => onView(v)}
                              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                                view === v
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    ),
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}