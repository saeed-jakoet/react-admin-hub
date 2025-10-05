"use client";

import * as React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Filter,
  Download,
  Plus,
  Search,
  Settings2,
  ChevronDown,
  MoreVertical,
  Users,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2,
  Grid3X3,
  List,
  Building2,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { get } from "@/lib/api/fetcher";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { Loader } from "@/components/shared/Loader";

export default function ClientsPage() {
  const [clients, setClients] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState("table"); // table, grid
  const [searchTerm, setSearchTerm] = React.useState("");
  const [columnVisibility, setColumnVisibility] = React.useState({
    name: true,
    email: true,
    phone: true,
    company: true,
    address: true,
    status: true,
    actions: true
  });

  React.useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await get("/client");
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  // Client stats calculations
  const clientStats = React.useMemo(() => {
    if (!clients.length) return { total: 0, active: 0, inactive: 0, withCompany: 0, withoutCompany: 0 };
    
    return clients.reduce((acc, client) => {
      acc.total += 1;
      if (client.is_active) {
        acc.active += 1;
      } else {
        acc.inactive += 1;
      }
      if (client.company_name) {
        acc.withCompany += 1;
      } else {
        acc.withoutCompany += 1;
      }
      return acc;
    }, { total: 0, active: 0, inactive: 0, withCompany: 0, withoutCompany: 0 });
  }, [clients]);

  const getStatusColor = (isActive) => {
    return isActive 
      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
  };

  const getStatusIcon = (isActive) => {
    return isActive 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <XCircle className="w-4 h-4 text-red-500" />;
  };

  // Filter clients based on search term
  const filteredClients = React.useMemo(() => {
    if (!searchTerm) return clients;
    
    return clients.filter(client => 
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const exportData = (type) => {
    if (type === 'csv') {
      const data = ['First Name,Last Name,Email,Phone,Company,Address,Status,Created Date', 
        ...filteredClients.map(c => `"${c.first_name||''}","${c.last_name||''}","${c.email||''}","${c.phone_number||''}","${c.company_name||''}","${c.address||''}","${c.is_active?'Active':'Inactive'}","${new Date(c.created_at).toLocaleDateString()}"`)].join('\n');
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const w = window.open('', '_blank');
      w.document.write(`<!DOCTYPE html><html><head><title>Clients Report</title><style>body{font-family:Arial,sans-serif;margin:20px}h1{color:#1f2937;margin-bottom:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}th{background-color:#f9fafb;font-weight:600}.status-active{color:#059669}.status-inactive{color:#dc2626}</style></head><body><h1>Clients Report</h1><p>Generated: ${new Date().toLocaleDateString()}</p><p>Total: ${filteredClients.length}</p><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Company</th><th>Address</th><th>Status</th><th>Created</th></tr></thead><tbody>${filteredClients.map(c => `<tr><td>${c.first_name} ${c.last_name}</td><td>${c.email||''}</td><td>${c.phone_number||''}</td><td>${c.company_name||''}</td><td>${c.address||''}</td><td class="${c.is_active?'status-active':'status-inactive'}">${c.is_active?'Active':'Inactive'}</td><td>${new Date(c.created_at).toLocaleDateString()}</td></tr>`).join('')}</tbody></table></body></html>`);
      w.document.close();
      w.focus();
      w.print();
      w.close();
    }
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Clients Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #1f2937; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
    th { background-color: #f9fafb; font-weight: 600; }
    .status-active { color: #059669; }
    .status-inactive { color: #dc2626; }
  </style>
</head>
<body>
  <h1>Clients Report</h1>
  <p>Generated on: ${new Date().toLocaleDateString()}</p>
  <p>Total Clients: ${filteredClients.length}</p>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Company</th>
        <th>Address</th>
        <th>Status</th>
        <th>Created</th>
      </tr>
    </thead>
    <tbody>
      ${filteredClients.map(client => `
        <tr>
          <td>${client.first_name} ${client.last_name}</td>
          <td>${client.email || ''}</td>
          <td>${client.phone_number || ''}</td>
          <td>${client.company_name || ''}</td>
          <td>${client.address || ''}</td>
          <td class="${client.is_active ? 'status-active' : 'status-inactive'}">
            ${client.is_active ? 'Active' : 'Inactive'}
          </td>
          <td>${new Date(client.created_at).toLocaleDateString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (loading) {
    return <Loader text="Loading clients..." />;
  }

  const allColumns = [
    { accessorKey: "name", header: "Client Details", cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{row.original.first_name} {row.original.last_name}</div>
          <div className="text-sm text-gray-500 dark:text-slate-400">{row.original.email}</div>
        </div>
      </div>
    )},
    { accessorKey: "phone_number", header: "Contact", cell: ({ row }) => (
      <div className="space-y-1">
        {row.original.phone_number && <div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-gray-400" /><span className="text-gray-900 dark:text-white">{row.original.phone_number}</span></div>}
        <div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-gray-400" /><span className="text-gray-600 dark:text-slate-400">{row.original.email}</span></div>
      </div>
    )},
    { accessorKey: "company_name", header: "Company", cell: ({ row }) => (
      <div className="flex items-center space-x-2"><Building2 className="w-4 h-4 text-gray-400" /><span className="text-gray-900 dark:text-white font-medium">{row.original.company_name || "—"}</span></div>
    )},
    { accessorKey: "address", header: "Address", cell: ({ row }) => (
      <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-gray-400" /><span className="text-gray-600 dark:text-slate-400">{row.original.address || "—"}</span></div>
    )},
    { accessorKey: "is_active", header: "Status", cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        {getStatusIcon(row.original.is_active)}
        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(row.original.is_active)}`}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    )},
    { id: "actions", cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {[{icon: Eye, label: "View Details"}, {icon: Edit, label: "Edit Client"}, {icon: Mail, label: "Send Email"}, {icon: Phone, label: "Call Client"}].map((item, i) => (
            <DropdownMenuItem key={i}><item.icon className="h-4 w-4 mr-2" />{item.label}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )}
  ];

  // Filter columns based on visibility settings
  const visibleColumns = allColumns.filter(column => {
    if (column.accessorKey === "name") return columnVisibility.name;
    if (column.accessorKey === "phone_number") return columnVisibility.phone;
    if (column.accessorKey === "company_name") return columnVisibility.company;
    if (column.accessorKey === "address") return columnVisibility.address;
    if (column.accessorKey === "is_active") return columnVisibility.status;
    if (column.id === "actions") return columnVisibility.actions;
    return true;
  });

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Client Management</h1>
          <p className="text-gray-600 dark:text-slate-400">Manage your client relationships and contacts</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="space-y-6">
        {/* Client Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: "Total Clients", value: clientStats.total, desc: "Across all categories", icon: Users, color: "blue", trend: TrendingUp },
            { label: "Active Clients", value: clientStats.active, desc: "Currently engaged", icon: UserCheck, color: "green", trend: TrendingUp },
            { label: "Inactive Clients", value: clientStats.inactive, desc: "Need attention", icon: UserX, color: "red", trend: TrendingDown },
            { label: "With Company", value: clientStats.withCompany, desc: "Business clients", icon: Building2, color: "purple", trend: Activity },
            { label: "Individual", value: clientStats.withoutCompany, desc: "Personal clients", icon: Users, color: "orange", trend: Activity }
          ].map((stat, i) => (
            <Card key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <stat.trend className={`w-5 h-5 ${stat.color === 'red' ? 'text-red-500' : stat.color === 'green' ? 'text-green-500' : 'text-purple-500'}`} />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className={`text-sm font-medium ${stat.color === 'green' ? 'text-green-600 dark:text-green-400' : stat.color === 'red' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-slate-400'}`}>{stat.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Client Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Left Side - Search & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[300px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <Button variant="outline" className="px-4 py-2 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              
              {[{type: 'csv', label: 'Export CSV'}, {type: 'pdf', label: 'Export PDF'}].map((exp, i) => (
                <Button key={i} variant="outline" onClick={() => exportData(exp.type)} className="px-4 py-2 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700">
                  <Download className="w-4 h-4 mr-2" />{exp.label}
                </Button>
              ))}
            </div>

            {/* Right Side - View Options */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">View as:</span>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1 border border-gray-200 dark:border-slate-600">
                <Button
                  size="sm"
                  variant={viewMode === "table" ? "default" : "ghost"}
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-2 ${
                    viewMode === "table"
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600"
                  } border-0`}
                >
                  <List className="w-4 h-4 mr-2" />
                  Table
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 ${
                    viewMode === "grid"
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600"
                  } border-0`}
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Grid
                </Button>
              </div>

              {/* Column Visibility Control - only show for table view */}
              {viewMode === "table" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="px-3 py-2 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700">
                      <Settings2 className="mr-2 h-4 w-4" />
                      Columns
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.name}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, name: checked }))
                      }
                    >
                      Client Details
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.phone}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, phone: checked }))
                      }
                    >
                      Contact
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.company}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, company: checked }))
                      }
                    >
                      Company
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.address}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, address: checked }))
                      }
                    >
                      Address
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.status}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, status: checked }))
                      }
                    >
                      Status
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.actions}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, actions: checked }))
                      }
                    >
                      Actions
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Clients Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                        {client.first_name} {client.last_name}
                      </h3>
                      <p className="text-gray-500 dark:text-slate-400 text-sm">
                        {client.email}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Client
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="space-y-3">
                    {client.phone_number && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-slate-400 text-sm">Phone</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {client.phone_number}
                        </span>
                      </div>
                    )}
                    
                    {client.company_name && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-slate-400 text-sm">Company</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {client.company_name}
                        </span>
                      </div>
                    )}
                    
                    {client.address && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-slate-400 text-sm">Address</span>
                        <span className="text-gray-900 dark:text-white font-medium text-right">
                          {client.address}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(client.is_active)}`}>
                        {client.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-gray-500 dark:text-slate-400 text-xs">
                        {new Date(client.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // Table View
          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6">
              <DataTable
                showToolbar={false}
                columns={visibleColumns}
                data={filteredClients}
              />
            </div>
          </Card>
        )}
      </div>

      <AddClientDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchClients}
      />
    </>
  );
}
