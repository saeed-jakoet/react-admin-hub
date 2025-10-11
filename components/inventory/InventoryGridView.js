"use client";

import * as React from "react";
import { Package, MapPin, Eye, Edit, Trash2, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  GridView, 
  GridCard, 
  GridCardHeader, 
  GridCardSection, 
  GridCardItem, 
  GridCardFooter 
} from "@/components/shared/GridView";

export function InventoryGridView({ 
  items, 
  getCategoryColor, 
  getCategoryDotColor, 
  getStockIcon, 
  getStockStatus,
  onViewModeChange 
}) {
  const renderInventoryCard = (item) => {
    const status = getStockStatus(item.quantity, item.minimum_quantity);
    
    const dropdownItems = [
      { icon: Eye, label: "View Details", onClick: () => console.log("View", item.id) },
      { icon: Edit, label: "Edit Item", onClick: () => console.log("Edit", item.id) },
      { icon: Trash2, label: "Delete", onClick: () => console.log("Delete", item.id), className: "text-red-600" }
    ];

    return (
      <GridCard key={item.id} dropdownItems={dropdownItems}>
        <GridCardHeader
          icon={
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(item.category)}`}>
              <Package className="w-6 h-6" />
            </div>
          }
          title={item.item_name}
          subtitle={item.item_code}
        />

        <GridCardSection>
          <GridCardItem
            icon={<div className={`w-3 h-3 rounded-full ${getCategoryDotColor(item.category)}`}></div>}
            label="Category"
            value={
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getCategoryColor(item.category)}`}>
                {item.category}
              </span>
            }
          />
          
          <GridCardItem
            icon={getStockIcon(item.quantity, item.minimum_quantity)}
            label="Stock Level"
            value={`${item.quantity} ${item.unit}`}
          />
          
          <GridCardItem
            icon={<MapPin className="w-4 h-4" />}
            label="Location"
            value={item.location}
          />
          
          {item.cost_price && (
            <GridCardItem
              icon={<div className="w-4 h-4">R</div>}
              label="Unit Price"
              value={`R ${item.cost_price}`}
            />
          )}
        </GridCardSection>

        <GridCardFooter>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStockIcon(item.quantity, item.minimum_quantity)}
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
            {item.supplier_name && (
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Supplier</p>
                <p className="text-xs font-medium text-gray-600 dark:text-slate-300 truncate">
                  {item.supplier_name}
                </p>
              </div>
            )}
          </div>
        </GridCardFooter>
      </GridCard>
    );
  };

  return (
    <div className="space-y-4">
      {/* View Mode Toggle for Grid View */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewModeChange("table")}
          className="flex items-center gap-2"
        >
          <Table className="w-4 h-4" />
          Switch to Table View
        </Button>
      </div>
      
      <GridView items={items} renderCard={renderInventoryCard} />
    </div>
  );
}