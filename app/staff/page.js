"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Plus,
  MoreVertical,
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Eye,
  Edit,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { get } from "@/lib/api/fetcher";
import { AddStaffDialog } from "@/components/staff/AddStaffDialog";
import { StaffGridView } from "@/components/staff/StaffGridView";
import { Loader } from "@/components/shared/Loader";
import { TableControls } from "@/components/shared/TableControls";
import { useAuth } from "@/components/providers/AuthProvider";

export default function StaffPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [staff, setStaff] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [viewMode, setViewModeState] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("staffViewMode") || "table";
    }
    return "table";
  });
  const [searchTerm, setSearchTerm] = React.useState("");

  // Wrap setViewMode to persist
  const setViewMode = React.useCallback((mode) => {
    setViewModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("staffViewMode", mode);
    }
  }, []);

  React.useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await get("/staff");
      setStaff(response.data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  // Staff stats calculations
  const staffStats = React.useMemo(() => {
    if (!staff.length)
      return {
        total: 0,
        withAccess: 0,
        withoutAccess: 0,
        byRole: {},
      };

    return staff.reduce(
      (acc, member) => {
        acc.total += 1;
        if (member.auth_user_id) {
          acc.withAccess += 1;
        } else {
          acc.withoutAccess += 1;
        }
        if (member.role) {
          acc.byRole[member.role] = (acc.byRole[member.role] || 0) + 1;
        }
        return acc;
      },
      { total: 0, withAccess: 0, withoutAccess: 0, byRole: {} }
    );
  }, [staff]);

  const getAccessColor = (hasAccess) => {
    return hasAccess
      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
  };

  const getAccessIcon = (hasAccess) => {
    return hasAccess ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  // Filter staff based on search term
  const filteredStaff = React.useMemo(() => {
    if (!searchTerm) return staff;

    return staff.filter(
      (member) =>
        `${member.first_name} ${member.surname}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staff, searchTerm]);

  // Export columns configuration
  const exportColumns = [
    { header: "First Name", accessorKey: "first_name" },
    { header: "Surname", accessorKey: "surname" },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phone_number" },
    { header: "Position", accessorKey: "position" },
    { header: "Department", accessorKey: "department" },
    { header: "Role", accessorKey: "role" },
    {
      header: "System Access",
      accessor: (member) => (member.auth_user_id ? "Has Access" : "No Access"),
    },
    {
      header: "Hire Date",
      accessor: (member) => member.hire_date ? new Date(member.hire_date).toLocaleDateString() : "—",
    },
  ];

  const handleRowClick = (member) => {
    router.push(`/staff/${member.id}`);
  };

  if (loading) {
    return <Loader variant="bars" text="Loading staff..." />;
  }

  const allColumns = [
    {
      accessorKey: "name",
      header: "Staff Details",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 shadow-md ring-2 ring-white dark:ring-slate-800 bg-blue-600">
            <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">
              {`${(row.original.first_name?.[0] || '').toUpperCase()}${(row.original.surname?.[0] || '').toUpperCase()}`}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {`${row.original.first_name || ""} ${row.original.surname || ""}`.trim()}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {row.original.position || "Staff Member"}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">
              {row.original.email || "—"}
            </span>
          </div>
          {row.original.phone_number && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-slate-400">
                {row.original.phone_number}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-slate-400">
            {row.original.department || "—"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-medium capitalize">
            {row.original.role?.replace('_', ' ') || "—"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "auth_user_id",
      header: "System Access",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          {getAccessIcon(row.original.auth_user_id)}
          <span
            className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${getAccessColor(
              row.original.auth_user_id
            )}`}
          >
            {row.original.auth_user_id ? "Active" : "No Access"}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {[
              { icon: Eye, label: "View Details" },
              { icon: Edit, label: "Edit Staff" },
              { icon: Mail, label: "Send Email" },
              { icon: Phone, label: "Call Staff" },
            ].map((item, i) => (
              <DropdownMenuItem key={i}>
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const canAddStaff = (user?.role || user?.user_metadata?.role) === "super_admin";

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Staff Management
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Manage employees, roles, and system access
          </p>
        </div>
        {canAddStaff && (
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Staff Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Total Staff",
              value: staffStats.total,
              desc: "Team members",
              icon: Users,
              color: "blue",
              trend: TrendingUp,
            },
            {
              label: "System Access",
              value: staffStats.withAccess,
              desc: "Active accounts",
              icon: UserCheck,
              color: "green",
              trend: TrendingUp,
            },
            {
              label: "No Access",
              value: staffStats.withoutAccess,
              desc: "Pending setup",
              icon: UserX,
              color: "red",
              trend: TrendingDown,
            },
            {
              label: "Departments",
              value: Object.keys(staffStats.byRole).length,
              desc: "Active roles",
              icon: Shield,
              color: "purple",
              trend: TrendingUp,
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center`}
                  >
                    <stat.icon
                      className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                    />
                  </div>
                  <stat.trend
                    className={`w-5 h-5 ${
                      stat.color === "red"
                        ? "text-red-500"
                        : stat.color === "green"
                        ? "text-green-500"
                        : "text-purple-500"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      stat.color === "green"
                        ? "text-green-600 dark:text-green-400"
                        : stat.color === "red"
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-slate-400"
                    }`}
                  >
                    {stat.desc}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Staff Controls */}
        <TableControls
          searchTerm={searchTerm}
          onSearch={(e) => setSearchTerm(e.target.value)}
          exportData={filteredStaff}
          exportColumns={exportColumns}
          exportFilename="staff-export"
          exportTitle="Staff Report"
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchPlaceholder="Search staff..."
        />

        {/* Staff Display */}
        {viewMode === "grid" ? (
          <StaffGridView
            staff={filteredStaff}
            getAccessColor={getAccessColor}
            getAccessIcon={getAccessIcon}
            onStaffClick={handleRowClick}
          />
        ) : (
          // Table View
          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6">
              <DataTable
                showToolbar={false}
                columns={allColumns}
                data={filteredStaff}
                onRowClick={handleRowClick}
              />
            </div>
          </Card>
        )}
      </div>

      <AddStaffDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchStaff}
        disabled={!canAddStaff}
      />
    </>
  );
}