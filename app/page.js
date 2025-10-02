"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Wrench,
  Users,
  TrendingUp,
  Package,
  DollarSign,
  Activity,
  AlertTriangle,
  Wifi,
  MapPin,
  Calendar,
  FileText,
  PhoneCall,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader } from "@/components/shared/Loader";

export default function OverviewPage() {
  const { user, isBootstrapping } = useAuth();
  console.log(user);

  if (isBootstrapping) {
    return <Loader text="Loading..." />;
  }

  const businessHealth = [
    {
      label: "Active Installations",
      value: "12",
      subtitle: "8 in progress, 4 pending start",
      icon: Activity,
      color: "blue",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      iconColor: "text-blue-600 dark:text-blue-400",
      urgent: false,
    },
    {
      label: "Revenue (MTD)",
      value: "R284.5K",
      subtitle: "R156K outstanding",
      icon: DollarSign,
      color: "green",
      bgColor: "bg-green-50 dark:bg-green-950",
      iconColor: "text-green-600 dark:text-green-400",
      urgent: false,
    },
    {
      label: "Team Utilization",
      value: "87%",
      subtitle: "13/15 techs deployed",
      icon: Users,
      color: "purple",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      iconColor: "text-purple-600 dark:text-purple-400",
      urgent: false,
    },
    {
      label: "Critical Stock Items",
      value: "3",
      subtitle: "Items below reorder point",
      icon: Package,
      color: "orange",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      iconColor: "text-orange-600 dark:text-orange-400",
      urgent: true,
    },
  ];

  // Urgent Action Items - Things that need immediate attention
  const urgentActions = [
    {
      type: "Overdue Invoice",
      description: "TechCorp HQ - 45 days overdue",
      amount: "R45,200",
      priority: "high",
      icon: AlertCircle,
      color: "red",
    },
    {
      type: "Low Stock Alert",
      description: "Fibre cable (500m remaining)",
      amount: "Order now",
      priority: "high",
      icon: Package,
      color: "orange",
    },
    {
      type: "Pending Approval",
      description: "Material quote - Maple Heights project",
      amount: "R12,800",
      priority: "medium",
      icon: FileText,
      color: "yellow",
    },
    {
      type: "Maintenance Due",
      description: "3 equipment items need servicing",
      amount: "View items",
      priority: "medium",
      icon: Wrench,
      color: "blue",
    },
  ];

  // Today's Operations Status
  const todayOperations = [
    {
      id: "OP-2024-156",
      client: "TechCorp HQ",
      location: "Main St District, Office 402",
      type: "Fibre Installation",
      status: "In Progress",
      team: "Alpha Squad (4 techs)",
      progress: 65,
      estimatedCompletion: "16:00",
      priority: "high",
    },
    {
      id: "OP-2024-157",
      client: "Sunset Apartments",
      location: "North District, Building B",
      type: "Network Extension",
      status: "In Progress",
      team: "Beta Squad (3 techs)",
      progress: 40,
      estimatedCompletion: "17:30",
      priority: "medium",
    },
    {
      id: "OP-2024-158",
      client: "Green Valley Office Park",
      location: "Business District, Block C",
      type: "Maintenance",
      status: "Scheduled 14:00",
      team: "Gamma Squad (2 techs)",
      progress: 0,
      estimatedCompletion: "15:30",
      priority: "low",
    },
  ];

  // Upcoming This Week
  const upcomingJobs = [
    {
      day: "Tomorrow",
      client: "Riverside Mall",
      type: "New Installation",
      techs: 5,
      value: "R125K",
    },
    {
      day: "Wed",
      client: "Tech Hub Co-working",
      type: "Fibre Backbone",
      techs: 6,
      value: "R89K",
    },
    {
      day: "Thu",
      client: "Mountain View Homes",
      type: "Residential (15 units)",
      techs: 4,
      value: "R67K",
    },
    {
      day: "Fri",
      client: "City Hospital Extension",
      type: "Critical Infrastructure",
      techs: 8,
      value: "R215K",
    },
  ];

  // Recent Activity Feed
  const activityFeed = [
    {
      time: "12 min ago",
      message: "Downtown Fiber installation completed",
      type: "success",
      icon: CheckCircle2,
    },
    {
      time: "34 min ago",
      message: "New client enquiry: Westside Industrial Park",
      type: "info",
      icon: PhoneCall,
    },
    {
      time: "1 hr ago",
      message: "Material delivery arrived - 2km fibre cable",
      type: "success",
      icon: Package,
    },
    {
      time: "2 hrs ago",
      message: "Network issue reported at Tech Park Site B",
      type: "warning",
      icon: AlertTriangle,
    },
  ];

  const currentTime = new Date().toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const currentDate = new Date().toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-background min-h-screen">
      {/* Business Control Header */}
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">
              Hi,{" "}
              {user?.user_metadata?.firstName.charAt(0).toUpperCase() +
                user?.user_metadata?.firstName.slice(1)}
            </h1>
            <p className="text-gray-600 dark:text-muted-foreground mt-1">
              {currentDate} • {currentTime}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-700 dark:text-green-200">
                All Systems Operational
              </span>
            </div>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Activity className="h-4 w-4 mr-2" />
              Live Map
            </Button>
          </div>
        </div>
      </div>

      {/* Critical Business Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {businessHealth.map((metric, index) => {
          const Icon = metric.icon;

          return (
            <Card
              key={metric.label}
              className={`bg-white dark:bg-card border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden ${
                metric.urgent
                  ? "ring-2 ring-orange-400 dark:ring-orange-600"
                  : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`h-11 w-11 rounded-xl ${metric.bgColor} flex items-center justify-center`}
                  >
                    <Icon className={`h-5 w-5 ${metric.iconColor}`} />
                  </div>
                  {metric.urgent && (
                    <span className="px-2 py-1 text-xs font-semibold bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 rounded-full">
                      Urgent
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground mb-1">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-foreground mb-1">
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">
                    {metric.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Content - 2 Column Span */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Active Operations */}
          <Card className="bg-white dark:bg-card border-0 shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-4 border-b border-gray-100 dark:border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">
                    Today's Active Operations
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mt-1">
                    3 installations in progress • 13 technicians deployed
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View All Jobs
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {todayOperations.map((op) => (
                  <div
                    key={op.id}
                    className="border border-gray-200 dark:border-border rounded-lg p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-500 dark:text-muted-foreground">
                            {op.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              op.priority === "high"
                                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                                : op.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {op.priority}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-foreground mb-1">
                          {op.client}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {op.location}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-700 dark:text-gray-300">
                            <Users className="h-3.5 w-3.5 inline mr-1" />
                            {op.team}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            <Wrench className="h-3.5 w-3.5 inline mr-1" />
                            {op.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span
                          className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                            op.status === "In Progress"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {op.status}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-muted-foreground mt-2">
                          <Clock className="h-3 w-3 inline mr-1" />
                          ETA: {op.estimatedCompletion}
                        </p>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    {op.progress > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{op.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
                            style={{ width: `${op.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming This Week */}
          <Card className="bg-white dark:bg-card border-0 shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-4 border-b border-gray-100 dark:border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">
                  Upcoming This Week
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Full Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {upcomingJobs.map((job, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-muted/50 rounded-lg hover:bg-gray-100 dark:hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                          {job.day}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-foreground">
                          {job.client}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-muted-foreground">
                          {job.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-foreground">
                        {job.value}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-muted-foreground">
                        {job.techs} technicians
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Urgent Actions Required */}
          <Card className="bg-gradient-to-br from-red-500 to-orange-500 text-white border-0 shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Action Required
                  </h3>
                  <p className="text-sm text-white/90">
                    4 items need attention
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="text-sm font-semibold text-white mb-1">
                    Overdue Invoice
                  </div>
                  <div className="text-xs text-white/90">
                    TechCorp - R45,200
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="text-sm font-semibold text-white mb-1">
                    Low Stock Alert
                  </div>
                  <div className="text-xs text-white/90">
                    Fibre cable - 500m left
                  </div>
                </div>
              </div>
              <Button className="w-full mt-4 bg-white text-red-600 hover:bg-white/90 font-semibold">
                View All Actions
              </Button>
            </CardContent>
          </Card>

          {/* Urgent Action Items Detail */}
          <Card className="bg-white dark:bg-card border-0 shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-4 border-b border-gray-100 dark:border-border">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">
                Priority Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="space-y-3">
                {urgentActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        action.priority === "high"
                          ? "bg-red-50 dark:bg-red-950/30 border-red-500"
                          : action.priority === "medium"
                          ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500"
                          : "bg-blue-50 dark:bg-blue-950/30 border-blue-500"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            action.priority === "high"
                              ? "bg-red-100 dark:bg-red-900"
                              : action.priority === "medium"
                              ? "bg-yellow-100 dark:bg-yellow-900"
                              : "bg-blue-100 dark:bg-blue-900"
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 ${
                              action.priority === "high"
                                ? "text-red-600 dark:text-red-300"
                                : action.priority === "medium"
                                ? "text-yellow-600 dark:text-yellow-300"
                                : "text-blue-600 dark:text-blue-300"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-foreground">
                            {action.type}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-muted-foreground mt-0.5">
                            {action.description}
                          </p>
                          <p className="text-xs font-semibold text-gray-900 dark:text-foreground mt-1">
                            {action.amount}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="bg-white dark:bg-card border-0 shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-4 border-b border-gray-100 dark:border-border">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="space-y-4">
                {activityFeed.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.type === "success"
                            ? "bg-green-100 dark:bg-green-950"
                            : activity.type === "warning"
                            ? "bg-orange-100 dark:bg-orange-950"
                            : "bg-blue-100 dark:bg-blue-950"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            activity.type === "success"
                              ? "text-green-600 dark:text-green-400"
                              : activity.type === "warning"
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-foreground">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white dark:bg-card border-0 shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-4 border-b border-gray-100 dark:border-border">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">
                This Month Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-muted-foreground">
                    Completed Jobs
                  </span>
                  <span className="font-bold text-gray-900 dark:text-foreground">
                    47
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-muted-foreground">
                    Total Revenue
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    R284.5K
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-muted-foreground">
                    Avg Job Value
                  </span>
                  <span className="font-bold text-gray-900 dark:text-foreground">
                    R6.05K
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-muted-foreground">
                    Customer Satisfaction
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    94%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
