import { Calendar as BigCalendar } from "react-big-calendar";
import React from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as LucideCalendar } from "lucide-react";
import { Loader } from "@/components/shared/Loader";

export default function CalendarBigCalendar({
  localizer,
  orders,
  filteredOrders,
  loading,
  selectedClient,
  selectedOrderType,
  statusFilter,
  setSelectedClient,
  setSelectedOrderType,
  setStatusFilter,
  clients,
  orderTypes,
  uniqueStatuses,
  statusColors,
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
  return (
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
        ) : (
          <div className="relative h-[800px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/[0.02] to-purple-500/[0.02] dark:from-blue-400/[0.03] dark:to-purple-400/[0.03] pointer-events-none" />

            {/* Calendar container */}
            <div className="relative h-full p-6">
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
                        className="group relative text-xs font-semibold px-2 py-1 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:z-20 w-full flex items-center"
                        title={tooltipText}
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          {/* Status indicator dot */}
                          <div
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-sm ${
                              order.status === "completed"
                                ? "bg-emerald-400"
                                : order.status === "in_progress"
                                  ? "bg-blue-400"
                                  : order.status === "pending"
                                    ? "bg-amber-400"
                                    : "bg-slate-400"
                            }`}
                          />

                          {/* Event title */}
                          <span className="truncate flex-1">{event.title}</span>
                        </div>

                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-white/10 dark:bg-black/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
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
  );
}
