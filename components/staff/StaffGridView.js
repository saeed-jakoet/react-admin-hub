"use client";

import * as React from "react";
import { Mail, Phone, MapPin, Briefcase, Shield, Eye, Edit, Key, UserX, Table } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  GridView, 
  GridCard, 
  GridCardHeader, 
  GridCardSection, 
  GridCardItem, 
  GridCardFooter 
} from "@/components/shared/GridView";

export function StaffGridView({ 
  staff, 
  getAccessColor, 
  getAccessIcon, 
  onStaffClick, 
  onViewModeChange
}) {
  const renderStaffCard = (member) => {
    const dropdownItems = [
      { 
        icon: Eye, 
        label: "View Details", 
        onClick: () => onStaffClick?.(member) 
      },
      { 
        icon: Edit, 
        label: "Edit Staff", 
        onClick: () => console.log("Edit", member.id) 
      },
      { 
        icon: member.auth_user_id ? UserX : Key, 
        label: member.auth_user_id ? "Remove Access" : "Grant Access", 
        onClick: () => console.log(member.auth_user_id ? "Remove" : "Grant", member.id) 
      }
    ];

    const fullName = `${member.first_name || ""} ${member.surname || ""}`.trim() || "Staff Member";

    return (
      <GridCard 
        key={member.id} 
        onClick={() => onStaffClick?.(member)}
        dropdownItems={dropdownItems}
      >
        <GridCardHeader
          icon={
            <div className="relative">
              <Avatar className="w-12 h-12 shadow-md ring-2 ring-white dark:ring-slate-800 bg-blue-600">
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-lg">
                  {`${(member.first_name?.[0] || '').toUpperCase()}${(member.surname?.[0] || '').toUpperCase()}`}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 ${
                  member.auth_user_id ? "bg-emerald-500" : "bg-slate-400"
                } rounded-full border-2 border-white dark:border-slate-800`}
              ></div>
            </div>
          }
          title={fullName}
          subtitle={member.position || "Staff Member"}
        />

        <GridCardSection>
          <GridCardItem
            icon={<Mail className="w-4 h-4" />}
            label="Email"
            value={member.email || "—"}
          />
          
          {member.phone_number && (
            <GridCardItem
              icon={<Phone className="w-4 h-4" />}
              label="Phone"
              value={member.phone_number}
            />
          )}
          
          {member.department && (
            <GridCardItem
              icon={<Briefcase className="w-4 h-4" />}
              label="Department"
              value={member.department}
            />
          )}
          
          {member.role && (
            <GridCardItem
              icon={<Shield className="w-4 h-4" />}
              label="Role"
              value={member.role.replace('_', ' ')}
              className="capitalize"
            />
          )}
        </GridCardSection>

        <GridCardFooter>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getAccessIcon(member.auth_user_id)}
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getAccessColor(member.auth_user_id)}`}>
                {member.auth_user_id ? "Has Access" : "No Access"}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                {member.hire_date ? "Hired" : "Created"}
              </p>
              <p className="text-xs font-medium text-gray-600 dark:text-slate-300">
                {member.hire_date 
                  ? new Date(member.hire_date).toLocaleDateString()
                  : member.created_at 
                    ? new Date(member.created_at).toLocaleDateString()
                    : "—"
                }
              </p>
            </div>
          </div>
        </GridCardFooter>
      </GridCard>
    );
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        {onViewModeChange && (
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            onClick={() => onViewModeChange("table")}
            title="Switch to Table View"
          >
            <Table className="w-4 h-4" />
            Table View
          </button>
        )}
      </div>
      <GridView items={staff} renderCard={renderStaffCard} />
    </>
  );
}