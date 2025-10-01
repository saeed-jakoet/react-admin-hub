import { 
  MapPin,
  Users,
  Calendar,
  Wrench,
  DollarSign,
  BarChart3,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  TrendingUp,
  Signal,
  Wifi,
  Server
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OverviewPage() {
  const liveMetrics = [
    { label: "Active Installations", value: "8", change: "+2", icon: MapPin, color: "blue" },
    { label: "Field Teams", value: "5", change: "0", icon: Users, color: "green" },
    { label: "Network Health", value: "98%", change: "+1%", icon: Signal, color: "emerald" },
    { label: "Daily Revenue", value: "$12.4K", change: "+23%", icon: DollarSign, color: "purple" }
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
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Command Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background via-muted/30 to-primary/5 border border-border p-8">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-cyan-600 bg-clip-text text-transparent">
              Operations Control
            </h1>
            <p className="text-muted-foreground text-lg">Fiber installation command center</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-600 dark:text-green-400 font-medium text-sm">All Systems Online</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Wifi className="h-3 w-3 text-blue-500" />
              <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">5 Teams Active</span>
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
            <Card key={metric.label} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorClasses[metric.color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    metric.change.startsWith('+') ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 
                    metric.change === '0' ? 'bg-gray-500/10 text-gray-600 dark:text-gray-400' :
                    'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {metric.change}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">{metric.label}</p>
                  <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Operations Grid */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Active Operations */}
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-xl bg-card">
            <CardHeader className="border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Live Field Operations
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Server className="h-4 w-4 mr-2" />
                  Control Panel
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {activeOperations.map((op) => {
                const statusColors = {
                  'Installing': 'from-blue-500 to-cyan-500',
                  'Testing': 'from-green-500 to-emerald-500',
                  'Planning': 'from-purple-500 to-pink-500'
                };
                
                const priorityColors = {
                  'high': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                  'medium': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
                  'low': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                };
                
                return (
                  <div key={op.id} className="group p-6 border border-border rounded-xl hover:bg-muted/30 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-foreground">{op.title}</h3>
                          <Badge className={`${priorityColors[op.priority]} border`}>
                            {op.priority} priority
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">{op.id} • {op.client} • {op.location}</p>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={`bg-gradient-to-r ${statusColors[op.status]} text-white border-0 mb-2`}>
                          {op.status}
                        </Badge>
                        <p className="text-sm font-medium text-foreground">{op.team}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium text-foreground">{op.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className={`bg-gradient-to-r ${statusColors[op.status]} h-3 rounded-full transition-all duration-700 shadow-sm`}
                          style={{ width: `${op.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* System Status & Controls */}
        <div className="space-y-6">
          {/* System Health */}
          <Card className="border-0 shadow-xl bg-card">
            <CardHeader className="border-b border-border bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {systemStatus.map((system) => (
                <div key={system.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{system.name}</p>
                    <p className="text-xs text-muted-foreground">{system.uptime} uptime</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    system.status === 'optimal' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                    'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {system.status}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Deploy */}
          <Card className="border-0 shadow-xl bg-card">
            <CardHeader className="border-b border-border bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Quick Deploy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg">
                <Users className="mr-2 h-4 w-4" />
                Deploy Team
              </Button>
              <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                <MapPin className="mr-2 h-4 w-4" />
                New Installation
              </Button>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Job
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
