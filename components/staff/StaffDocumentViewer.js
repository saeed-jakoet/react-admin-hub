"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Eye,
  Upload,
  Search,
  Filter,
  MoreVertical,
  File,
  FileImage,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  User,
  Heart,
  Briefcase
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStaffDocuments } from "@/lib/hooks/useStaffDocuments";
import { Loader } from "@/components/shared/Loader";

const documentTypes = [
  { value: "all", label: "All Documents" },
  { value: "id", label: "ID Documents", icon: User },
  { value: "medical", label: "Medical Certificates", icon: Heart },
  { value: "employment_contract", label: "Employment Contracts", icon: Briefcase }
];

const getFileIcon = (type, documentType) => {
  // First check by document type (staff-specific)
  switch (documentType) {
    case 'id':
      return <User className="w-8 h-8 text-blue-500" />;
    case 'medical':
      return <Heart className="w-8 h-8 text-red-500" />;
    case 'employment_contract':
      return <Briefcase className="w-8 h-8 text-purple-500" />;
    default:
      break;
  }

  // Fallback to file extension
  const ext = type?.toLowerCase();
  if (ext?.includes('pdf')) {
    return <FileText className="w-8 h-8 text-red-500" />;
  } else if (ext?.includes('doc')) {
    return <FileText className="w-8 h-8 text-blue-500" />;
  } else if (ext?.includes('jpg') || ext?.includes('jpeg') || ext?.includes('png')) {
    return <FileImage className="w-8 h-8 text-green-500" />;
  } else {
    return <File className="w-8 h-8 text-gray-500" />;
  }
};

const getDocumentTypeColor = (documentType) => {
  const colors = {
    id: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    medical: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    employment_contract: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
  };
  return colors[documentType] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
};

const getDocumentTypeLabel = (documentType) => {
  const labels = {
    id: "ID Document",
    medical: "Medical Certificate", 
    employment_contract: "Employment Contract"
  };
  return labels[documentType] || documentType || "Document";
};

export function StaffDocumentViewer({ staffId }) {
  const { documents, loading, error, refetch } = useStaffDocuments(staffId);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("all");
  const [selectedDocument, setSelectedDocument] = React.useState(null);
  const [viewerOpen, setViewerOpen] = React.useState(false);

  const filteredDocuments = React.useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "all" || doc.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [documents, searchTerm, selectedType]);

  const handlePreview = (document) => {
    setSelectedDocument(document);
    setViewerOpen(true);
  };

  const handleDownload = (document) => {
    if (document.url) {
      // Open the signed URL in a new tab to download
      window.open(document.url, '_blank');
    } else {
      console.error("No download URL available for document:", document.name);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <Loader variant="bars" text="Loading documents..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to load documents
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error}
        </p>
        <Button onClick={refetch} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Staff Documents
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            View and manage staff documentation
          </p>
        </div>
        <Button onClick={refetch} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getFileIcon(document.name, document.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {document.name || "Unnamed Document"}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {document.size ? `${Math.round(document.size / 1024)} KB` : "Unknown size"}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handlePreview(document)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(document)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <Badge className={getDocumentTypeColor(document.type)} variant="secondary">
                  {getDocumentTypeLabel(document.type)}
                </Badge>
                {document.last_modified && (
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    <p>Modified {new Date(document.last_modified).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div className="mt-3 flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePreview(document)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownload(document)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No documents found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || selectedType !== "all" 
              ? "Try adjusting your search or filter criteria"
              : "No documents have been uploaded for this staff member yet"
            }
          </p>
        </Card>
      )}

      {/* Document Preview Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedDocument?.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(selectedDocument)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.size ? `${Math.round(selectedDocument.size / 1024)} KB` : "Unknown size"} • 
              {selectedDocument?.type ? ` ${getDocumentTypeLabel(selectedDocument.type)}` : " Document"}
              {selectedDocument?.last_modified && ` • Modified ${new Date(selectedDocument.last_modified).toLocaleDateString()}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 max-h-[70vh] overflow-auto">
            {selectedDocument?.url ? (
              <div className="w-full">
                {/* For PDFs and images, show iframe or img */}
                {selectedDocument.name?.toLowerCase().endsWith('.pdf') ? (
                  <iframe 
                    src={selectedDocument.url}
                    className="w-full h-96 border rounded-lg"
                    title="Document Preview"
                  />
                ) : selectedDocument.name?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img 
                    src={selectedDocument.url}
                    alt="Document Preview"
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      {getFileIcon(selectedDocument.name, selectedDocument.type)}
                      <p className="text-gray-600 dark:text-gray-400 mt-4">
                        Preview not available for this file type
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        Click download to view the full document
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Document URL not available
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}