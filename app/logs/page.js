"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/DataTable";
import { Loader } from "@/components/shared/Loader";
import { get } from "@/lib/api/fetcher";
import {
  Activity,
  User,
  Clock,
  Search,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Info,
} from "lucide-react";

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Fetch logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await get("/log");
      if (response.status === "success") {
        setLogs(response.data || []);
      } else {
        setError(response.message || "Failed to fetch logs");
      }
    } catch (err) {
      setError("Error fetching logs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLogs();
  }, []);

  // Get simple description of what happened
  const getSimpleDescription = (log) => {
    const { action, table_name, old_data, new_data } = log;
    
    if (table_name === "drop_cable") {
      const clientName = new_data?.client || old_data?.client || "Unknown Client";
      const circuitNumber = new_data?.circuit_number || old_data?.circuit_number || "Unknown Circuit";
      
      if (action === "CREATE" || action === "INSERT") {
        const technician = new_data?.technician_name ? ` assigned to ${new_data.technician_name}` : "";
        const siteName = new_data?.site_b_name ? ` at ${new_data.site_b_name}` : "";
        return `Created new job ${circuitNumber} for ${clientName}${technician}${siteName}`;
      } else if (action === "UPDATE") {
        // Find what changed
        if (old_data?.status !== new_data?.status) {
          return `Changed ${circuitNumber} status from "${formatStatus(old_data?.status)}" to "${formatStatus(new_data?.status)}"`;
        }
        return `Updated job ${circuitNumber} for ${clientName}`;
      } else if (action === "DELETE") {
        return `Deleted job ${circuitNumber} for ${clientName}`;
      }
    }
    
    if (table_name === "clients") {
      const clientName = new_data?.name || old_data?.name || "Unknown Client";
      
      if (action === "CREATE" || action === "INSERT") {
        const contactInfo = new_data?.email ? ` (${new_data.email})` : "";
        const location = new_data?.city ? ` in ${new_data.city}` : "";
        return `Added new client: ${clientName}${contactInfo}${location}`;
      } else if (action === "UPDATE") {
        return `Updated client: ${clientName}`;
      } else if (action === "DELETE") {
        return `Deleted client: ${clientName}`;
      }
    }
    
    if (table_name === "projects") {
      const projectName = new_data?.name || old_data?.name || "Unknown Project";
      
      if (action === "CREATE" || action === "INSERT") {
        const client = new_data?.client_name ? ` for ${new_data.client_name}` : "";
        const budget = new_data?.budget ? ` (Budget: $${new_data.budget})` : "";
        return `Created new project: ${projectName}${client}${budget}`;
      } else if (action === "UPDATE") {
        return `Updated project: ${projectName}`;
      } else if (action === "DELETE") {
        return `Deleted project: ${projectName}`;
      }
    }
    
    if (table_name === "users") {
      const userName = new_data?.name || old_data?.name || "Unknown User";
      const userEmail = new_data?.email || old_data?.email || "";
      
      if (action === "CREATE" || action === "INSERT") {
        const role = new_data?.role ? ` as ${new_data.role}` : "";
        return `Added new user: ${userName} (${userEmail})${role}`;
      } else if (action === "UPDATE") {
        return `Updated user: ${userName}`;
      } else if (action === "DELETE") {
        return `Deleted user: ${userName}`;
      }
    }
    
    if (table_name === "staff") {
      const staffName = new_data?.name || old_data?.name || "Unknown Staff";
      
      if (action === "CREATE" || action === "INSERT") {
        const position = new_data?.position ? ` (${new_data.position})` : "";
        const department = new_data?.department ? ` in ${new_data.department}` : "";
        return `Added new staff member: ${staffName}${position}${department}`;
      } else if (action === "UPDATE") {
        return `Updated staff: ${staffName}`;
      } else if (action === "DELETE") {
        return `Deleted staff: ${staffName}`;
      }
    }
    
    if (table_name === "inventory") {
      const itemName = new_data?.item_name || old_data?.item_name || "Unknown Item";
      const itemCode = new_data?.item_code || old_data?.item_code || "";
      
      if (action === "CREATE" || action === "INSERT") {
        const category = new_data?.category ? ` (${new_data.category.charAt(0).toUpperCase() + new_data.category.slice(1)})` : "";
        const quantity = new_data?.quantity ? ` - Qty: ${new_data.quantity}` : "";
        const supplier = new_data?.supplier_name ? ` from ${new_data.supplier_name}` : "";
        const code = itemCode ? ` [${itemCode}]` : "";
        const location = new_data?.location ? ` at ${new_data.location}` : "";
        return `Added new inventory item: ${itemName}${code}${category}${quantity}${supplier}${location}`;
      } else if (action === "UPDATE") {
        return `Updated inventory: ${itemName}${itemCode ? ` [${itemCode}]` : ""}`;
      } else if (action === "DELETE") {
        return `Deleted inventory: ${itemName}${itemCode ? ` [${itemCode}]` : ""}`;
      }
    }
    
    // Generic fallback
    if (action === "CREATE" || action === "INSERT") return `Added new ${table_name.replace('_', ' ')} record`;
    if (action === "UPDATE") return `Updated ${table_name.replace('_', ' ')} record`;
    if (action === "DELETE") return `Deleted ${table_name.replace('_', ' ')} record`;
    
    return `${action} on ${table_name}`;
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Filter logs based on search term
  const filteredLogs = React.useMemo(() => {
    return logs.filter(log => {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.user_name?.toLowerCase().includes(searchLower) ||
        getSimpleDescription(log).toLowerCase().includes(searchLower)
      );
    });
  }, [logs, searchTerm]);

  // Get the navigation URL for a log entry
  const getNavigationUrl = (log) => {
    const { table_name, old_data, new_data, record_id } = log;
    
    if (table_name === "drop_cable") {
      // For drop cable jobs, navigate to the client's drop cable page
      const clientId = new_data?.client_id || old_data?.client_id;
      if (clientId) {
        return `/clients/${clientId}/drop_cable`;
      }
    }
    
    // Add more table mappings as needed
    if (table_name === "clients") {
      return `/clients/${record_id}`;
    }
    
    if (table_name === "projects") {
      return `/projects/${record_id}`;
    }
    
    if (table_name === "users") {
      return `/users`;
    }
    
    if (table_name === "staff") {
      return `/staff`;
    }
    
    if (table_name === "inventory") {
      return `/inventory`;
    }
    
    // Default fallback - could be expanded based on your table structure
    return null;
  };

  // Handle clicking on a log entry
  const handleLogClick = (log) => {
    const url = getNavigationUrl(log);
    if (url) {
      router.push(url);
    }
  };

  // Check if a log entry is clickable
  const isLogClickable = (log) => {
    return getNavigationUrl(log) !== null;
  };

  // Get comprehensive change details for any action
  const getDetailedChanges = (log) => {
    const { action, old_data, new_data, table_name } = log;
    
    if (action === "CREATE" || action === "INSERT") {
      if (!new_data) return [];
      
      // Show key fields that were set during creation
      const changes = [];
      const keyFields = {
        drop_cable: ['status', 'client', 'circuit_number', 'technician_name', 'site_b_name', 'priority'],
        clients: ['company_name', 'email', 'phone_number', 'is_active', 'address'],
        projects: ['name', 'client_name', 'budget', 'status', 'start_date'],
        users: ['email', 'role', 'first_name', 'last_name'],
        staff: ['name', 'position', 'department', 'email'],
        inventory: ['item_name', 'item_code', 'category', 'quantity', 'supplier_name', 'location']
      };
      
      const fields = keyFields[table_name] || Object.keys(new_data).slice(0, 6);
      
      fields.forEach(field => {
        if (new_data[field] !== null && new_data[field] !== undefined && new_data[field] !== '') {
          changes.push({
            field: field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            from: '',
            to: String(new_data[field]),
            type: 'created'
          });
        }
      });
      
      return changes;
    }
    
    if (action === "UPDATE") {
      if (!old_data || !new_data) return [];
      
      const changes = [];
      const allFields = new Set([...Object.keys(old_data), ...Object.keys(new_data)]);
      
      // Skip these fields as they're not user-relevant
      const skipFields = ['id', 'created_at', 'updated_at', 'deleted_at'];
      
      allFields.forEach(field => {
        if (skipFields.includes(field)) return;

        const oldVal = old_data[field];
        const newVal = new_data[field];

        // Format values for display
        const formatVal = (val) => {
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') {
            // Special handling for notes array or object
            if (Array.isArray(val)) {
              // If notes is an array of objects with text, join their text
              return val.map((n) => n && n.text ? n.text : JSON.stringify(n)).join(' | ');
            } else if (val.text) {
              return val.text;
            } else {
              return JSON.stringify(val);
            }
          }
          return String(val);
        };

        const oldStr = formatVal(oldVal);
        const newStr = formatVal(newVal);

        if (oldStr !== newStr) {
          changes.push({
            field: field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            from: oldStr || '(empty)',
            to: newStr || '(empty)',
            type: 'updated'
          });
        }
      });
      
      return changes;
    }
    
    if (action === "DELETE") {
      if (!old_data) return [];
      
      // Show key fields that existed before deletion
      const changes = [];
      const keyFields = {
        drop_cable: ['status', 'client', 'circuit_number', 'technician_name'],
        clients: ['company_name', 'email', 'is_active'],
        projects: ['name', 'client_name', 'status'],
        users: ['email', 'role'],
        staff: ['name', 'position'],
        inventory: ['item_name', 'item_code', 'category']
      };
      
      const fields = keyFields[table_name] || Object.keys(old_data).slice(0, 4);
      
      fields.forEach(field => {
        if (old_data[field] !== null && old_data[field] !== undefined && old_data[field] !== '') {
          changes.push({
            field: field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            from: String(old_data[field]),
            to: '',
            type: 'deleted'
          });
        }
      });
      
      return changes;
    }
    
    return [];
  };

  // Get change details for status changes
  const getChangeDetails = (log) => {
    const { action, old_data, new_data } = log;
    
    // For CREATE/INSERT actions, show key details that were added
    if ((action === "CREATE" || action === "INSERT") && new_data) {
      if (log.table_name === "drop_cable") {
        const status = new_data.status ? formatStatus(new_data.status) : null;
        if (status) {
          return {
            type: "Initial Status",
            from: "",
            to: status,
            color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
          };
        }
      }
      
      // For other table types, could show initial status/state
      return {
        type: "New Record",
        from: "",
        to: "Created",
        color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
      };
    }
    
    if (!old_data || !new_data) return null;

    // Check for status change
    if (old_data.status !== new_data.status) {
      return {
        type: "Status Change",
        from: formatStatus(old_data.status),
        to: formatStatus(new_data.status),
        color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700"
      };
    }

    // Check for other important changes
    const importantFields = ['client', 'circuit_number', 'site_b_name', 'technician_name'];
    for (const field of importantFields) {
      if (old_data[field] !== new_data[field]) {
        return {
          type: field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          from: old_data[field] || "Not set",
          to: new_data[field] || "Not set",
          color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
        };
      }
    }

    return {
      type: "Details Updated",
      from: "",
      to: "",
      color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700"
    };
  };

  // Define table columns
  const columns = [
    {
      accessorKey: "created_at",
      header: "When",
      cell: ({ row }) => {
        const log = row.original;
        const date = new Date(log.created_at);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let timeAgo;
        if (diffMins < 1) timeAgo = "Just now";
        else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
        else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
        else if (diffDays < 7) timeAgo = `${diffDays}d ago`;
        else timeAgo = date.toLocaleDateString();

        return (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <div className="font-medium text-sm">{timeAgo}</div>
              <div className="text-xs text-gray-500">
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "What Happened",
      cell: ({ row }) => {
        const log = row.original;
        const description = getSimpleDescription(log);
        const changeDetails = getChangeDetails(log);
        const allChanges = getDetailedChanges(log);
        const isClickable = isLogClickable(log);

        const content = (
          <div className="space-y-2">
            <div className="font-medium text-sm flex items-center gap-2">
              {description}
              {isClickable && (
                <ExternalLink className="w-3 h-3 text-blue-500" />
              )}
              {allChanges.length > 0 && (
                <div className="relative group">
                  <Info className="w-3 h-3 text-gray-400 cursor-help" />
                  
                  {/* Hover Tooltip */}
                  <div className="absolute left-0 top-6 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg p-4 w-80 max-h-64 overflow-y-auto">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Changes Made ({allChanges.length})
                      </div>
                      <div className="space-y-2">
                        {allChanges.map((change, idx) => (
                          <div key={idx} className="flex flex-col space-y-1">
                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {change.field}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              {change.type === 'created' ? (
                                <span className="text-green-600 dark:text-green-400 font-mono bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                  + {change.to}
                                </span>
                              ) : change.type === 'deleted' ? (
                                <span className="text-red-600 dark:text-red-400 font-mono bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                  - {change.from}
                                </span>
                              ) : (
                                <>
                                  <span className="text-red-600 dark:text-red-400 font-mono bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                    {change.from}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-gray-400" />
                                  <span className="text-green-600 dark:text-green-400 font-mono bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                    {change.to}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Show summary of changes inline */}
            {allChanges.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {allChanges.slice(0, 3).map((change, idx) => (
                  <div key={idx} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${
                    change.type === 'created' 
                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700'
                      : change.type === 'deleted'
                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700'
                      : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700'
                  }`}>
                    <span className="font-medium">{change.field}</span>
                    {change.type === 'updated' && (
                      <>
                        <span className="font-mono text-xs opacity-75">{change.from}</span>
                        <ArrowRight className="w-2 h-2" />
                        <span className="font-mono text-xs">{change.to}</span>
                      </>
                    )}
                    {change.type === 'created' && (
                      <span className="font-mono text-xs">+{change.to}</span>
                    )}
                    {change.type === 'deleted' && (
                      <span className="font-mono text-xs">-{change.from}</span>
                    )}
                  </div>
                ))}
                {allChanges.length > 3 && (
                  <div className="inline-flex items-center px-2 py-1 rounded-md border text-xs bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700">
                    +{allChanges.length - 3} more
                  </div>
                )}
              </div>
            )}
            
            {/* Keep the old simple change display as fallback */}
            {changeDetails && changeDetails.to && allChanges.length === 0 && (
              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border text-xs ${changeDetails.color}`}>
                {changeDetails.from && (
                  <>
                    <span className="font-mono">{changeDetails.from}</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
                <span className="font-mono">{changeDetails.to}</span>
              </div>
            )}
          </div>
        );

        if (isClickable) {
          return (
            <button
              onClick={() => handleLogClick(log)}
              className="text-left w-full p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
            >
              {content}
            </button>
          );
        }

        return <div className="p-2">{content}</div>;
      },
    },
    {
      accessorKey: "user_name",
      header: "Who",
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <div className="font-medium text-sm">{log.user_name}</div>
              <div className="text-xs text-gray-500">{log.user_role}</div>
            </div>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return <Loader variant="bars" text="Loading activity..." />;
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                Error Loading Activity
              </h3>
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button
                variant="outline"
                onClick={fetchLogs}
                className="mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      {/* <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Recent Activity
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              See what's been happening in your system
            </p>
          </div>
        </div>
      </div> */}

      {/* Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Activities
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {logs.length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Today
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {logs.filter(log => 
                  new Date(log.created_at).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Users
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {[...new Set(logs.map(log => log.user_id))].length}
              </p>
            </div>
            <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </Card>
      </div> */}

      {/* Search */}
      {/* <Card className="p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search activity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card> */}

      {/* Activity Table */}
      <Card className="p-6 overflow-visible">
        <div className="w-full overflow-visible">
          <DataTable 
            columns={columns} 
            data={filteredLogs}
            className="overflow-visible w-full"
            tableClassName="overflow-visible w-full"
          />
        </div>
      </Card>
    </div>
  );
}