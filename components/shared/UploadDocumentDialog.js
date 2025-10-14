"use client";

import React, { useState } from "react";
import { Upload, File, X, Check, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const documentCategories = [
  { value: "as-built", label: "As-Built", description: "As-built documentation" },
  { value: "planning", label: "Planning", description: "Planning documents" },
  { value: "happy_letter", label: "Happy Letter", description: "Client satisfaction confirmation" },
];

export default function UploadDocumentDialog({ 
  open, 
  onOpenChange, 
  onUpload, 
  jobData,
  uploading = false 
}) {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError("");

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError("");
    
    // Check if it's a PDF
    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file only.");
      return;
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      setError("File size must be less than 50MB.");
      return;
    }

    setFile(selectedFile);
    // Filename is derived from category server-side; no manual naming here
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    if (!category) {
      setError("Please select a document category.");
      return;
    }

    try {
      await onUpload({
        file,
        category,
        jobData
      });
      
      // Reset form on success
      handleClose();
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    }
  };

  const handleClose = () => {
    setFile(null);
    setCategory("");
    setError("");
    setDragActive(false);
    onOpenChange(false);
  };

  const getCategoryDisplay = () => {
    const cat = documentCategories.find(c => c.value === category);
    return cat ? cat.label : "Select category";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Upload Document
          </DialogTitle>
          <DialogDescription>
            Upload a PDF document for {jobData?.circuit_number || "this job"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label>PDF File</Label>
            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl p-6 transition-colors",
                dragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
                file && "border-green-500 bg-green-50 dark:bg-green-900/20"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              
              <div className="text-center">
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <File className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-green-700 dark:text-green-300">
                        {file.name}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="ml-auto text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      Drop your PDF here
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      or <span className="text-blue-600 font-medium">click to browse</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Maximum file size: 50MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Auto-named based on category */}
          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-600 dark:text-gray-300">
            The file will be automatically named based on the selected category:
            <ul className="list-disc ml-6 mt-2">
              <li>As-Built → asbuilt.pdf</li>
              <li>Planning → planning.pdf</li>
              <li>Happy Letter → happyletter.pdf</li>
            </ul>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Document Category</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-white dark:bg-gray-950"
                  disabled={uploading}
                >
                  {getCategoryDisplay()}
                  <Upload className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {documentCategories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className="group flex flex-col items-start p-3 cursor-pointer hover:bg-gray-700 focus:bg-gray-700 hover:text-white focus:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700 dark:hover:text-white dark:focus:text-white"
                  >
                    <div className="font-medium group-hover:text-white group-focus:text-white dark:group-hover:text-white dark:group-focus:text-white">{cat.label}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300 group-hover:text-white group-focus:text-white dark:group-hover:text-white dark:group-focus:text-white">{cat.description}</div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || !category || uploading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Upload Document
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}