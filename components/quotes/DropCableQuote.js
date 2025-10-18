"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";

import jsPDF from "jspdf";
import { getDueDateForWeek } from "@/lib/utils/dueDateForWeek";

export default function DropCableQuote({ quoteData, clientInfo, onClose }) {
  const quoteRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const formatCurrency = (amount) => {
    return `R${Number(amount || 0).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const generatePDF = async (preview = false) => {
    if (!quoteRef.current) return;

    try {
      setGenerating(true);
      
      const canvas = await html2canvas(quoteRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Handle multi-page PDFs if content is too tall
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page - stretch to full width, no margins
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      if (preview) {
        // Open in new window
        setPreviewing(true);
        const pdfBlob = pdf.output("blob");
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, "_blank");
        setTimeout(() => {
          URL.revokeObjectURL(url);
          setPreviewing(false);
        }, 1000);
      } else {
        // Download
        const filename = `Quote_${clientInfo.company_name.replace(/[^a-z0-9]/gi, "_")}_Week${quoteData.week}_${new Date().toISOString().split("T")[0]}.pdf`;
        pdf.save(filename);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const total = quoteData.items.reduce((sum, item) => sum + (item.total || 0), 0);


  // Calculate due date: last day of the month for the selected week
  const weekNumber = quoteData.week;
  const year = new Date().getFullYear();
  const dueDateObj = getDueDateForWeek(weekNumber, year);
  const dueDateFormatted = dueDateObj.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).toUpperCase();

  // Generate quote number
  const quoteNumber = `${clientInfo.company_name.substring(0, 4).toUpperCase()}-Q${String(quoteData.week).padStart(2, "0")}${new Date().getFullYear().toString().substring(2)}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full my-8">
        {/* Action Bar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Quote Preview</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => generatePDF(true)}
              disabled={generating || previewing}
              className="gap-2"
            >
              {previewing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Preview PDF
                </>
              )}
            </Button>
            <Button
              onClick={() => generatePDF(false)}
              disabled={generating || previewing}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Quote Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(100vh-200px)] flex justify-center bg-gray-100">
          <div ref={quoteRef} className="bg-white shadow-lg" style={{ width: "220mm", padding: "12mm" }}>
            {/* Company Header */}
            <div className="flex items-start justify-between mb-4 pb-3 border-b-2 border-blue-600">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-blue-900 mb-1.5">FIBER AFRICA (PTY) LTD</h1>
                <div className="text-xs text-gray-700 space-y-0.5">
                  <p className="font-medium">E-mail: admin@fiberafrica.co.za</p>
                  <p>The Hub, 2 Engine Avenue, Montague Gardens, Western Cape, 7441</p>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 pt-1.5 border-t border-gray-200">
                  Company Reg No. 2018/318249/07 | VAT No. 4920288976
                </p>
              </div>
              <div className="ml-6">
                  <Image
                  src="https://res.cloudinary.com/di3tech8i/image/upload/v1760287427/logo_t75170.png"
                  alt="Fiber Africa Logo"
                  className="w-28 h-22 object-contain"
                  crossOrigin="anonymous"
                />
              </div>
            </div>

            {/* Quote Header */}
            <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-blue-900">QUOTATION</h2>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">Quote Number</p>
                  <p className="text-sm font-bold text-blue-900 mt-0.5">{quoteNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-300">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1.5">Client Information</p>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">{clientInfo.company_name}</h3>
                  <p className="text-xs text-gray-600">{clientInfo.address || "Address not provided"}</p>
                </div>
                <div className="text-xs">
                  <p className="text-xs text-gray-500 uppercase mb-2">Quote Details</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-semibold text-gray-900">{dueDateFormatted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Manager:</span>
                      <span className="font-semibold text-gray-900">{clientInfo.first_name} {clientInfo.last_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Title */}
            <div className="mb-3">
              <h3 className="font-semibold text-xs bg-blue-50 px-3 py-1.5 rounded border-l-4 border-blue-600">
                Drop Cable_Table Bay_SL (Week {quoteData.week}) - {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </h3>
            </div>

            {/* Items Table */}
            <div className="mb-4">
              <table className="w-full border-collapse border border-gray-300" style={{ fontSize: "9px" }}>
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="border border-gray-300 px-1.5 py-1.5 text-center font-semibold">No</th>
                    <th className="border border-gray-300 px-1.5 py-1.5 text-center font-semibold">Circuit</th>
                    <th className="border border-gray-300 px-1.5 py-1.5 text-center font-semibold">Site B</th>
                    <th className="border border-gray-300 px-1.5 py-1.5 text-center font-semibold">County</th>
                    <th className="border border-gray-300 px-1.5 py-1.5 text-center font-semibold">PM</th>
                    <th className="border border-gray-300 px-1.5 py-1.5 text-center font-semibold">Dist</th>
                    <th className="border border-gray-300 px-1.5 py-1.5 text-center font-semibold">Survey</th>
                    <th className="border border-gray-300 px-1.5 py-1.5 text-center font-semibold">Callout</th>
                    <th className="border border-gray-300 px-1.5 py-1.5 text-center font-semibold">Install</th>
                    <th className="border border-gray-300 px-1.5 py-1.5 text-center font-semibold">Mousepad</th>
                    <th className="border border-gray-300 px-1.5 py-1.5 text-center font-semibold">Misc</th>
                    <th className="border border-gray-300 px-1.5 py-1.5 text-center font-semibold bg-blue-800">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 px-1.5 py-1.5 text-gray-700">{index + 1}</td>
                      <td className="border border-gray-300 px-1.5 py-1.5 text-gray-700 font-medium">{item.circuit_number}</td>
                      <td className="border border-gray-300 px-1.5 py-1.5 text-gray-700">{item.site_b_name}</td>
                      <td className="border border-gray-300 px-1.5 py-1.5 text-gray-700">{item.county === "tablebay" ? "Table Bay" : item.county || "-"}</td>
                      <td className="border border-gray-300 px-1.5 py-1.5 text-gray-700">{item.pm || "-"}</td>
                      <td className="border border-gray-300 px-1.5 py-1.5 text-center text-gray-700">{item.distance || 0}m</td>
                      <td className="border border-gray-300 px-1.5 py-1.5 text-center text-gray-700">{formatCurrency(item.survey_planning_cost || 0)}</td>
                      <td className="border border-gray-300 px-1.5 py-1.5 text-center text-gray-700">{formatCurrency(item.callout_cost || 0)}</td>
                      <td className="border border-gray-300 px-1.5 py-1.5 text-center text-gray-700">{formatCurrency(item.installation_cost || 0)}</td>
                      <td className="border border-gray-300 px-1.5 py-1.5 text-center text-gray-700">{formatCurrency(item.mousepad_cost || 0)}</td>
                      <td className="border border-gray-300 px-1.5 py-1.5 text-center text-gray-700">{formatCurrency(item.additional_cost || 0)}</td>
                      <td className="border border-gray-300 px-1.5 py-1.5 text-center font-bold text-gray-900 bg-blue-50">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-4">
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-5 py-2.5 rounded-lg shadow-lg">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-sm">TOTAL AMOUNT</span>
                  <span className="font-bold text-xl">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-xs text-gray-600 pt-3 border-t-2 border-gray-300">
              <p className="font-bold text-gray-800 mb-2">Terms & Conditions</p>
              <ul className="space-y-1 text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2 text-blue-600 font-bold">•</span>
                  <span>Payment terms: 30 days from date of invoice</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-600 font-bold">•</span>
                  <span>Prices are valid for 30 days from quote date</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-600 font-bold">•</span>
                  <span>All prices are in South African Rand (ZAR)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}