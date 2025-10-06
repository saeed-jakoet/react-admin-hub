"use client";

import * as React from "react";
import { Building2, Mail, Phone, MapPin, User, Eye, Edit, Trash2 } from "lucide-react";
import { 
  GridView, 
  GridCard, 
  GridCardHeader, 
  GridCardSection, 
  GridCardItem, 
  GridCardFooter 
} from "@/components/shared/GridView";

export function ClientsGridView({ 
  clients, 
  getStatusColor, 
  getStatusIcon, 
  onClientClick 
}) {
  const renderClientCard = (client) => {
    const dropdownItems = [
      { 
        icon: Eye, 
        label: "View Details", 
        onClick: () => onClientClick?.(client) 
      },
      { 
        icon: Edit, 
        label: "Edit Client", 
        onClick: () => console.log("Edit", client.id) 
      },
      { 
        icon: Trash2, 
        label: "Delete", 
        onClick: () => console.log("Delete", client.id), 
        className: "text-red-600" 
      }
    ];

    return (
      <GridCard 
        key={client.id} 
        onClick={() => onClientClick?.(client)}
        dropdownItems={dropdownItems}
      >
        <GridCardHeader
          icon={
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          }
          title={client.company_name || `${client.first_name} ${client.last_name}`}
          subtitle={client.company_name ? `${client.first_name} ${client.last_name}` : client.email}
        />

        <GridCardSection>
          <GridCardItem
            icon={<Mail className="w-4 h-4" />}
            label="Email"
            value={client.email}
          />
          
          {client.phone_number && (
            <GridCardItem
              icon={<Phone className="w-4 h-4" />}
              label="Phone"
              value={client.phone_number}
            />
          )}
          
          {!client.company_name && (
            <GridCardItem
              icon={<User className="w-4 h-4" />}
              label="Contact Person"
              value={`${client.first_name} ${client.last_name}`}
            />
          )}
          
          {client.address && (
            <GridCardItem
              icon={<MapPin className="w-4 h-4" />}
              label="Address"
              value={client.address}
            />
          )}
        </GridCardSection>

        <GridCardFooter>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(client.is_active)}
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(client.is_active)}`}>
                {client.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Joined</p>
              <p className="text-xs font-medium text-gray-600 dark:text-slate-300">
                {new Date(client.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </GridCardFooter>
      </GridCard>
    );
  };

  return <GridView items={clients} renderCard={renderClientCard} />;
}