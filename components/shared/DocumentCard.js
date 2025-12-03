"use client";

import { useState, useEffect } from "react";
import {
  File,
  Eye,
  Download,
  Trash2,
  MoreVertical,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { get, del } from "@/lib/api/fetcher";

export default function DocumentCard({ 
  doc, 
  onDelete, 
  onError,
  accentColor = "blue" // "blue" or "purple"
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const fileName = doc.category || doc.file_name?.replace(/\.[^/.]+$/, "") || "Document";
  const extension = doc.file_name?.split(".").pop()?.toUpperCase() || "PDF";
  const uploadDate = new Date(doc.created_at).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  // Fetch signed URL for preview
  useEffect(() => {
    const fetchPreviewUrl = async () => {
      try {
        const response = await get(`/documents/signed-url?id=${doc.id}`);
        // API returns { data: { url: "..." } }
        if (response?.data?.url) {
          setPreviewUrl(response.data.url);
        } else {
          setImageError(true);
        }
      } catch (err) {
        console.error("Failed to fetch preview URL:", err);
        setImageError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewUrl();
  }, [doc.id]);

  const handleView = async (e) => {
    e?.stopPropagation();
    try {
      if (previewUrl) {
        window.open(previewUrl, "_blank");
      } else {
        const response = await get(`/documents/signed-url?id=${doc.id}`);
        if (response?.data?.url) {
          window.open(response.data.url, "_blank");
        }
      }
    } catch (err) {
      onError?.("Failed to open document");
    }
  };

  const handleDownload = async (e) => {
    e?.stopPropagation();
    try {
      const url = previewUrl || (await get(`/documents/signed-url?id=${doc.id}`))?.data?.url;
      if (url) {
        const link = document.createElement("a");
        link.href = url;
        link.download = doc.file_name || "document.pdf";
        link.click();
      }
    } catch (err) {
      onError?.("Failed to download document");
    }
  };

  const handleDelete = async (e) => {
    e?.stopPropagation();
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await del(`/documents/${doc.id}`);
        onDelete?.();
      } catch (err) {
        onError?.("Failed to delete document");
      }
    }
  };

  const hoverBorderColor = accentColor === "purple" 
    ? "hover:border-purple-300 dark:hover:border-purple-600" 
    : "hover:border-blue-300 dark:hover:border-blue-600";

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg ${hoverBorderColor} transition-all duration-200 cursor-pointer`}
      onClick={handleView}
    >
      {/* Preview Area */}
      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : imageError || !previewUrl ? (
          // Fallback to file icon
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <File className="w-12 h-12 text-white/90" />
            <span className="absolute bottom-2 text-[10px] font-bold text-white/90">
              {extension}
            </span>
          </div>
        ) : (
          // PDF Preview using iframe or object
          <div className="absolute inset-0">
            {extension === "PDF" ? (
              <iframe
                src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                className="w-full h-full border-0 pointer-events-none"
                title={fileName}
                onError={() => setImageError(true)}
              />
            ) : (
              <img
                src={previewUrl}
                alt={fileName}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            )}
            {/* Overlay gradient for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        )}
        
        {/* Extension Badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-semibold text-white">
          {extension}
        </div>
      </div>
      
      {/* File Info */}
      <div className="p-3 space-y-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={fileName}>
          {fileName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {uploadDate}
        </p>
      </div>

      {/* Hover Actions Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="h-9 px-3"
          onClick={handleView}
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary" className="h-9 w-9 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleView}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
