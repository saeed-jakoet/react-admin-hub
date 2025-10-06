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
  Plus,
  Search,
  Filter,
  MoreVertical,
  File,
  FileImage,
  FileSpreadsheet,
  X
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
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock documents data - will be replaced with real API call
const mockDocuments = [
  {
    id: 1,
    name: "Service Agreement 2024.pdf",
    type: "pdf",
    size: "2.4 MB",
    category: "contracts",
    uploadedAt: "2024-01-15T10:30:00Z",
    uploadedBy: "John Smith",
    url: "/documents/service-agreement-2024.pdf"
  },
  {
    id: 2,
    name: "Project Quotation.pdf",
    type: "pdf",
    size: "1.8 MB",
    category: "quotes",
    uploadedAt: "2024-01-20T14:20:00Z",
    uploadedBy: "Sarah Johnson",
    url: "/documents/project-quotation.pdf"
  },
  {
    id: 3,
    name: "Equipment List.xlsx",
    type: "spreadsheet",
    size: "845 KB",
    category: "reports",
    uploadedAt: "2024-02-01T09:15:00Z",
    uploadedBy: "Mike Davis",
    url: "/documents/equipment-list.xlsx"
  },
  {
    id: 4,
    name: "Site Photos.zip",
    type: "archive",
    size: "15.2 MB",
    category: "images",
    uploadedAt: "2024-02-10T16:45:00Z",
    uploadedBy: "Lisa Chen",
    url: "/documents/site-photos.zip"
  },
  {
    id: 5,
    name: "Network Diagram.png",
    type: "image",
    size: "3.1 MB",
    category: "diagrams",
    uploadedAt: "2024-02-15T11:30:00Z",
    uploadedBy: "Tom Wilson",
    url: "/documents/network-diagram.png"
  }
];

const categories = [
  { value: "all", label: "All Documents" },
  { value: "contracts", label: "Contracts" },
  { value: "quotes", label: "Quotes" },
  { value: "reports", label: "Reports" },
  { value: "images", label: "Images" },
  { value: "diagrams", label: "Diagrams" }
];

const getFileIcon = (type) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-8 h-8 text-red-500" />;
    case 'spreadsheet':
      return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    case 'image':
      return <FileImage className="w-8 h-8 text-blue-500" />;
    default:
      return <File className="w-8 h-8 text-gray-500" />;
  }
};

const getCategoryColor = (category) => {
  const colors = {
    contracts: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    quotes: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    reports: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    images: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    diagrams: "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400"
  };
  return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
};

export default function DocumentViewer({ clientId }) {
  const [documents, setDocuments] = React.useState(mockDocuments);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedDocument, setSelectedDocument] = React.useState(null);
  const [viewerOpen, setViewerOpen] = React.useState(false);

  const filteredDocuments = React.useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchTerm, selectedCategory]);

  const handlePreview = (document) => {
    setSelectedDocument(document);
    setViewerOpen(true);
  };

  const handleDownload = (document) => {
    // In a real app, this would trigger a download
    console.log("Downloading:", document.name);
  };

  const handleUpload = () => {
    // In a real app, this would open a file upload dialog
    console.log("Upload new document");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Documents & Files
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Manage client documents, contracts, and files
          </p>
        </div>
        <Button onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getFileIcon(document.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {document.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {document.size}
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
              <Badge className={getCategoryColor(document.category)} variant="secondary">
                {document.category}
              </Badge>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                <p>Uploaded by {document.uploadedBy}</p>
                <p>{new Date(document.uploadedAt).toLocaleDateString()}</p>
              </div>
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

      {filteredDocuments.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No documents found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || selectedCategory !== "all" 
              ? "Try adjusting your search or filter criteria"
              : "Upload your first document to get started"
            }
          </p>
          <Button onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
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
              {selectedDocument?.size} • Uploaded by {selectedDocument?.uploadedBy}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 max-h-[70vh] overflow-auto">
            {selectedDocument?.type === 'pdf' && (
              <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    PDF preview would appear here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Click download to view the full document
                  </p>
                </div>
              </div>
            )}
            
            {selectedDocument?.type === 'image' && (
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center p-8">
                <div className="text-center">
                  <FileImage className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Image preview: {selectedDocument?.name}
                  </p>
                </div>
              </div>
            )}
            
            {selectedDocument?.type === 'spreadsheet' && (
              <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileSpreadsheet className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Spreadsheet preview would appear here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Download to view in Excel or Google Sheets
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