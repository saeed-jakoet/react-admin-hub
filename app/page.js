import { 
  MapPin,
  Users,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Signal,
  Wifi,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OverviewPage() {
  const liveMetrics = [
    { label: "Active Installations", value: "8", change: "+2", icon: MapPin, color: "blue" },
    { label: "Field Teams", value: "5", change: "0", icon: Users, color: "green" },
    { label: "Network Health", value: "98%", change: "+1%", icon: Signal, color: "emerald" },
    { label: "Daily Revenue", value: "R12.4K", change: "+23%", icon: DollarSign, color: "purple" }
  ];

  const activeOperations = [
    { 
      id: "OP-2024-001", 
      title: "Downtown Fiber Backbone", 
      client: "TechCorp HQ",
      status: "Installing", 
      team: "Alpha Squad",
      progress: 75,
      priority: "high",
      location: "Main St District"
    },
    { 
      id: "OP-2024-002", 
      title: "Business Park Network", 
      client: "Industrial Complex", 
      status: "Testing", 
      team: "Beta Squad",
      progress: 90,
      priority: "medium",
      location: "Tech Park Zone"
    },
    { 
      id: "OP-2024-003", 
      title: "Residential Expansion", 
      client: "Maple Heights", 
      status: "Planning", 
      team: "Gamma Squad",
      progress: 25,
      priority: "low",
      location: "North District"
    }
  ];

  const systemStatus = [
    { name: "Core Network", status: "optimal", uptime: "99.9%" },
    { name: "Field Equipment", status: "good", uptime: "98.2%" },
    { name: "Communication", status: "optimal", uptime: "99.8%" }
  ];

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-foreground">Control Center</h1>
            <p className="text-gray-600 dark:text-muted-foreground mt-1">Fibre network operations overview</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-300" />
              <span className="text-sm font-medium text-green-700 dark:text-green-200">All Systems Online</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
              <Wifi className="h-3 w-3 text-blue-600 dark:text-blue-300" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-200">5 Teams Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {liveMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const colorClasses = {
            blue: "from-blue-500 to-cyan-500",
            green: "from-green-500 to-emerald-500",
            emerald: "from-emerald-500 to-teal-500",
            purple: "from-purple-500 to-pink-500"
          };
          return (
            <Card key={metric.label} className="bg-white dark:bg-card border border-gray-200 dark:border-border hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    metric.change.startsWith('+') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 
                    metric.change === '0' ? 'bg-gray-100 text-gray-600 dark:bg-muted dark:text-muted-foreground' :
                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {metric.change}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground mb-1">{metric.label}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-foreground">{metric.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Content - Main Operations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects */}
          <Card className="bg-white dark:bg-card border border-gray-200 dark:border-border">
            <CardHeader className="border-b border-gray-100 dark:border-border p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">
                  Active Projects
                </CardTitle>
                <Button variant="outline" size="sm" className="text-sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {activeOperations.slice(0, 3).map((op) => (
                  <div key={op.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-foreground">{op.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-muted-foreground">{op.client} • {op.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {op.status}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">{op.team}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white dark:bg-card border border-gray-200 dark:border-border">
            <CardHeader className="border-b border-gray-100 dark:border-border p-6">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-foreground">Project completed</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">Fiber installation at Tech Park - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-foreground">Team assigned</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">Alpha Squad assigned to new project - 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-foreground">Maintenance required</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">Network issue reported at Site B - 6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* System Health */}
          <Card className="bg-white dark:bg-card border border-gray-200 dark:border-border">
            <CardHeader className="border-b border-gray-100 dark:border-border p-6">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {systemStatus.map((system) => (
                  <div key={system.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-foreground">{system.name}</p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground">{system.uptime} uptime</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      system.status === 'optimal' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {system.status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white dark:bg-card border border-gray-200 dark:border-border">
            <CardHeader className="border-b border-gray-100 dark:border-border p-6">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">
                Today's Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-muted-foreground">Active Teams</span>
                  <span className="font-semibold text-gray-900 dark:text-foreground">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-muted-foreground">Completed Jobs</span>
                  <span className="font-semibold text-gray-900 dark:text-foreground">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-muted-foreground">Revenue</span>
                  <span className="font-semibold text-gray-900 dark:text-foreground">R24,680</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-muted-foreground">Efficiency</span>
                  <span className="font-semibold text-green-600 dark:text-green-300">94%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
