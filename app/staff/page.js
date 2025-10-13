"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MoreVertical,
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
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
import useSWR, { mutate } from 'swr';
import { AddStaffDialog } from "@/components/staff/AddStaffDialog";
import { useToast } from "@/components/shared/Toast";
import { StaffGridView } from "@/components/staff/StaffGridView";
import { Loader } from "@/components/shared/Loader";
import Header from "@/components/shared/Header";
import { useAuth } from "@/components/providers/AuthProvider";

export default function StaffPage() {
  const { success, error: toastError } = useToast();

  // Toast handler for Add/Edit
  const handleDialogSuccess = (action = "add") => {
    mutate(["/staff"]);
    if (action === "edit") {
      success("Staff Updated", "Staff member was updated successfully.");
    } else {
      success("Staff Added", "Staff member was added successfully.");
    }
  };
  const router = useRouter();
  const { user } = useAuth();
  // SWR for staff
  const { data: staffData, isLoading: loading, error } = useSWR(
    ['/staff'],
    () => get('/staff'),
    { revalidateOnFocus: true, dedupingInterval: 60000 }
  );
  const staff = staffData?.data || [];
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewModeState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("staffViewMode") || "table";
    }
    return "table";
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Wrap setViewMode to persist
  const setViewMode = useCallback((mode) => {
    setViewModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("staffViewMode", mode);
    }
  }, []);



  // Staff stats calculations
  const staffStats = useMemo(() => {
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
  const filteredStaff = useMemo(() => {
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
      accessor: (member) =>
        member.hire_date
          ? new Date(member.hire_date).toLocaleDateString()
          : "—",
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
              {`${(row.original.first_name?.[0] || "").toUpperCase()}${(row.original.surname?.[0] || "").toUpperCase()}`}
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
            {row.original.role?.replace("_", " ") || "—"}
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

  const canAddStaff =
    (user?.role || user?.user_metadata?.role) === "super_admin";

  // Stats cards for Header
  const statsCards = [
    {
      label: "Total Staff",
      value: staffStats.total,
      desc: "Team members",
      icon: Users,
      color: "blue",
      trend: TrendingUp,
      bgGradient: "from-blue-500/10 to-blue-600/10",
      iconBg: "bg-blue-500",
    },
    {
      label: "System Access",
      value: staffStats.withAccess,
      desc: "Active accounts",
      icon: UserCheck,
      color: "green",
      trend: TrendingUp,
      bgGradient: "from-emerald-500/10 to-emerald-600/10",
      iconBg: "bg-emerald-500",
    },
    {
      label: "No Access",
      value: staffStats.withoutAccess,
      desc: "Pending setup",
      icon: UserX,
      color: "red",
      trend: TrendingDown,
      bgGradient: "from-red-500/10 to-red-600/10",
      iconBg: "bg-red-500",
    },
    {
      label: "Departments",
      value: Object.keys(staffStats.byRole).length,
      desc: "Active roles",
      icon: Shield,
      color: "purple",
      trend: TrendingUp,
      bgGradient: "from-purple-500/10 to-purple-600/10",
      iconBg: "bg-purple-500",
    },
  ];

  return (
    <>
      <Header
        title={
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900"></div>
            </div>
            <span>Staff Management</span>
          </div>
        }
        stats={
          <p className="text-gray-600 dark:text-slate-400">
            Manage employees, roles, and system access
          </p>
        }
        actions={
          canAddStaff && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          )
        }
        // showStatsCards={true}
        statsCards={statsCards}
      />

      <div className="space-y-6">
        {/* Staff Display */}
        {viewMode === "grid" ? (
          <StaffGridView
            staff={filteredStaff}
            getAccessColor={getAccessColor}
            getAccessIcon={getAccessIcon}
            onStaffClick={handleRowClick}
            onViewModeChange={setViewMode}
          />
        ) : (
          <DataTable
            columns={allColumns}
            data={filteredStaff}
            searchEnabled={true}
            searchTerm={searchTerm}
            onSearch={(e) => setSearchTerm(e.target.value)}
            searchPlaceholder="Search staff..."
            exportEnabled={true}
            exportData={filteredStaff}
            exportColumns={exportColumns}
            exportFilename="staff-export"
            exportTitle="Staff Report"
            viewModeEnabled={true}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onRowClick={handleRowClick}
          />
        )}
      </div>

      <AddStaffDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => handleDialogSuccess("add")}
        onError={() => {
          toastError("Error", "Failed to add staff member.");
        }}
        disabled={!canAddStaff}
      />
    </>
  );
}
