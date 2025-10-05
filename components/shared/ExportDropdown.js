"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";

export function ExportDropdown({
  data,
  filename = "export",
  columns,
  title = "Data Export",
  className = "",
}) {
  const exportToCSV = () => {
    if (!data || !data.length) {
      console.warn("No data to export");
      return;
    }

    // Create CSV headers
    const headers = columns.map((col) => col.header).join(",");

    // Create CSV rows
    const rows = data.map((item) => {
      return columns
        .map((col) => {
          let value = "";
          if (col.accessorKey) {
            value = item[col.accessorKey] || "";
          } else if (col.accessor) {
            value = col.accessor(item) || "";
          }

          // Handle different data types
          if (typeof value === "boolean") {
            value = value ? "Yes" : "No";
          } else if (value instanceof Date) {
            value = value.toLocaleDateString();
          } else if (typeof value === "object" && value !== null) {
            value = JSON.stringify(value);
          }

          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value).replace(/"/g, '""');
          return stringValue.includes(",") ||
            stringValue.includes('"') ||
            stringValue.includes("\n")
            ? `"${stringValue}"`
            : stringValue;
        })
        .join(",");
    });

    const csvContent = [headers, ...rows].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (!data || !data.length) {
      console.warn("No data to export");
      return;
    }

    // Create table headers
    const tableHeaders = columns
      .map((col) => `<th>${col.header}</th>`)
      .join("");

    // Create table rows
    const tableRows = data
      .map((item) => {
        const cells = columns
          .map((col) => {
            let value = "";
            if (col.accessorKey) {
              value = item[col.accessorKey] || "";
            } else if (col.accessor) {
              value = col.accessor(item) || "";
            }

            // Handle different data types
            if (typeof value === "boolean") {
              value = value ? "Yes" : "No";
            } else if (value instanceof Date) {
              value = value.toLocaleDateString();
            } else if (typeof value === "object" && value !== null) {
              value = JSON.stringify(value);
            }

            // Escape HTML
            const stringValue = String(value)
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");

            return `<td>${stringValue}</td>`;
          })
          .join("");

        return `<tr>${cells}</tr>`;
      })
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #374151;
            }
            h1 { 
              color: #1f2937; 
              margin-bottom: 20px; 
              font-size: 24px;
            }
            .meta {
              margin-bottom: 20px;
              color: #6b7280;
              font-size: 14px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            th, td { 
              border: 1px solid #e5e7eb; 
              padding: 12px 8px; 
              text-align: left; 
              font-size: 14px;
            }
            th { 
              background-color: #f9fafb; 
              font-weight: 600; 
              color: #374151;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            tr:hover {
              background-color: #f3f4f6;
            }
            .status-active { 
              color: #059669; 
              font-weight: 600;
            }
            .status-inactive { 
              color: #dc2626; 
              font-weight: 600;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="meta">
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Records:</strong> ${data.length}</p>
          </div>
          <table>
            <thead>
              <tr>${tableHeaders}</tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:border-slate-600 transition-colors ${className}`}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={exportToCSV}
          className="focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-slate-700 dark:focus:text-slate-100"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={exportToPDF}
          className="focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-slate-700 dark:focus:text-slate-100"
        >
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
