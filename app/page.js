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

export default function OverviewPage() {
  const router = useRouter();

  // New Job Dialog State
  const [newJobDialogOpen, setNewJobDialogOpen] = React.useState(false);
  const [selectedJobType, setSelectedJobType] = React.useState("");
  const [selectedClient, setSelectedClient] = React.useState("");
  const [clients, setClients] = React.useState([]);
  const [loadingClients, setLoadingClients] = React.useState(false);

  // Job types for dropdown
  const jobTypes = [
    "Drop Cable Installations",
    "Link Build",
    "Floating",
    "Civils (ADW)",
    "Access Build",
    "Root Build",
    "Relocations",
    "Maintenance",
  ];

  // Fetch clients when dialog opens
  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await get("/client");
      setClients(response.data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoadingClients(false);
    }
  };

  // Handle opening New Job dialog
  const handleNewJobClick = () => {
    setNewJobDialogOpen(true);
    fetchClients();
  };

  // Handle job creation
  const handleCreateJob = () => {
    if (selectedJobType && selectedClient) {
      const client = clients.find((c) => c.id === selectedClient);
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

        const route = jobTypeRoutes[selectedJobType];

        // Navigate to client page with job type and client info
        const params = new URLSearchParams({
          new: "true",
          jobType: selectedJobType,
          clientId: client.id,
          clientName: client.company_name,
        });

        router.push(`/clients/${client.id}/${route}?${params.toString()}`);
      }
    }
  };

  // Reset dialog state
  const resetDialog = () => {
    setSelectedJobType("");
    setSelectedClient("");
    setNewJobDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-1">
                Revenue (MTD)
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                R284.5K
              </p>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                +12% from last month
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-1">
                Active Jobs
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                12
              </p>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                8 in progress
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-1">
                Team Utilization
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                87%
              </p>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                13/15 technicians
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-1">
                Critical Stock
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                3
              </p>
              <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                Items need reorder
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Operations Overview */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Active Operations */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Active Operations
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400">
                    Real-time field activity
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Live
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {[
                {
                  id: "OP-2024-156",
                  client: "TechCorp HQ",
                  location: "Main St District",
                  type: "Fiber Installation",
                  progress: 65,
                  team: "Alpha Squad",
                  status: "active",
                },
                {
                  id: "OP-2024-157",
                  client: "Sunset Apartments",
                  location: "North District",
                  type: "Network Extension",
                  progress: 40,
                  team: "Beta Squad",
                  status: "active",
                },
                {
                  id: "OP-2024-158",
                  client: "Green Valley Office",
                  location: "Business District",
                  type: "Maintenance",
                  progress: 15,
                  team: "Gamma Squad",
                  status: "starting",
                },
              ].map((op) => (
                <div
                  key={op.id}
                  className="p-5 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-1 bg-gray-700 dark:bg-slate-600 text-white text-xs font-mono rounded">
                          {op.id}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            op.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          }`}
                        >
                          {op.status === "active" ? "IN PROGRESS" : "STARTING"}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">
                        {op.client}
                      </h4>
                      <p className="text-gray-600 dark:text-slate-400 text-sm flex items-center mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        {op.location} • {op.type}
                      </p>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">
                        Team: {op.team}
                      </p>
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {op.progress}%
                      </div>
                      <div className="w-24 h-2 bg-gray-200 dark:bg-slate-600 rounded-full mt-2">
                        <div
                          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                          style={{ width: `${op.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Business Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Critical Alerts */}
          <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
                  Critical Alerts
                </h3>
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="font-semibold text-sm text-red-900 dark:text-red-100">
                    Stock Alert
                  </p>
                  <p className="text-red-700 dark:text-red-300 text-xs">
                    Fiber cable: 500m remaining
                  </p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="font-semibold text-sm text-red-900 dark:text-red-100">
                    Overdue Payment
                  </p>
                  <p className="text-red-700 dark:text-red-300 text-xs">
                    TechCorp: R45,200 (45 days)
                  </p>
                </div>
              </div>
              <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white">
                View All Alerts
              </Button>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button className="h-16 flex-col bg-blue-600 hover:bg-blue-700 text-white">
                  <FileText className="w-4 h-4 mb-1" />
                  <span className="text-xs">New Quote</span>
                </Button>
                <Button
                  onClick={handleNewJobClick}
                  className="h-16 flex-col bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Calendar className="w-4 h-4 mb-1" />
                  <span className="text-xs">New Job</span>
                </Button>
                <Button className="h-16 flex-col bg-purple-600 hover:bg-purple-700 text-white">
                  <Truck className="w-4 h-4 mb-1" />
                  <span className="text-xs">Track Team</span>
                </Button>
                <Button className="h-16 flex-col bg-orange-600 hover:bg-orange-700 text-white">
                  <Package className="w-4 h-4 mb-1" />
                  <span className="text-xs">Inventory</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Monthly Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                  <span className="text-gray-600 dark:text-slate-400 font-medium">
                    Completed Jobs
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    47
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                  <span className="text-gray-600 dark:text-slate-400 font-medium">
                    Avg Completion
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    94%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-slate-400 font-medium">
                    Customer Rating
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    4.8★
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* New Job Dialog */}
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
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select job type...</option>
                {jobTypes.map((type) => (
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
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
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
              disabled={!selectedJobType || !selectedClient}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
