"use client";

import { useState, useCallback } from "react";
import { X, Upload, FileText, Camera, MapPin, Calendar, User, Building, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

export default function AsBuiltDocumentDialog({ 
  open, 
  onOpenChange, 
  jobData, 
  onGenerate,
  generating = false 
}) {
  const [formData, setFormData] = useState({
    // AS-BUILT REPORT Header - exactly matching PDF
    precinct: "Artificial Site – Western Cape",
    premises: `Open Communications (Pty) Ltd - ${jobData?.client || "Client Name"} - ${jobData?.circuit_number || ""}`,
    scopeOfWorks: "Existing DFA Budi Box located in Basement. Installed new 4F Drop Fibre from existing DFA Infrastructure to end Client – 60m. Installed new Mousepad & Faceplate.",
    
    // AS-BUILT INFORMATION - matching PDF exactly
    draftedBy: "Thurston Sass",
    asBuiltDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    companyName: "Fiber Africa",
    contactName: "Vernon Claassen",
    contactNumber: "079 644 2970",
    email: "vernon@fiberafrica.co.za",
    onSiteContact: "Malcolm Teare",
    onSiteContactNumber: "083 267 6305",
    centreManagement: "-",
    centreManagementContact: "-",
    centreManagementEmail: "-",
    
    // SITE INFORMATION - matching PDF exactly
    circuitNumber: jobData?.circuit_number || "",
    siteType: "Drop Cable Installation",
    siteAddress: jobData?.physical_address_site_b || "Willie Van Schoor",
    clientName: jobData?.client || "-",
    suburb: "Bellville",
    region: "Western Region",
    latitude: "-33.884790°",
    longitude: "18.633900°",
    numberOfBuildings: "-",
    singleEntry: false,
    dualEntry: true,
    clientBuild: "",
    siteOwner: "",
    fiberFloated: "",
    
    // AS-BUILT REPORT APPROVAL - matching PDF exactly
    projectNo: jobData?.circuit_number || "GFC21-0007233",
    revision: "00",
    controlDoc: "COG-FRM-005 Rev. 005",
    approvalDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    approverName: "",
    approverSignature: "",
    approverDate: "",
    
    // Additional technical details
    installationType: "Fiber",
    distance: "60m",
    installationNotes: "Installed new 4F Drop Fiber from existing DFA Infrastructure to end Client.",
    
    // Route Photos section
    routeDescription: "",
    equipmentInstalled: "Mousepad & Faceplate",
    
    // Legal notice exactly from PDF
    legalNotice: "Kindly note that certain terms and conditions will be applicable which shall be made available on request by us, and or can be found at http://www.dfafrica.co.za/documents/legal/Terms_Conditions_Premises.pdf.",
  });

  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      handleFiles(imageFiles);
    }
  }, []);

  // Handle file input
  const handleFileInput = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      handleFiles(imageFiles);
    }
  };

  // Process uploaded files
  const handleFiles = (files) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          file,
          preview: e.target.result,
          caption: "",
          category: "route_photos", // route_photos, equipment, installation, completion
        };
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Update image caption
  const updateImageCaption = (imageId, caption) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, caption } : img
    ));
  };

  // Update image category
  const updateImageCategory = (imageId, category) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, category } : img
    ));
  };

  // Handle document generation
  const handleGenerateDocument = () => {
    const documentData = {
      ...formData,
      images: images.map(img => ({
        file: img.file,
        caption: img.caption,
        category: img.category,
      })),
      jobId: jobData?.id,
      clientId: jobData?.client_id,
    };
    
    onGenerate(documentData);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      precinct: "Artificial Site – Western Cape",
      premises: `Open Communications (Pty) Ltd - ${jobData?.client || "Client Name"} - ${jobData?.circuit_number || ""}`,
      scopeOfWorks: "Existing DFA Budi Box located in Basement. Installed new 4F Drop Fibre from existing DFA Infrastructure to end Client – 60m. Installed new Mousepad & Faceplate.",
      draftedBy: "Thurston Sass",
      asBuiltDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      companyName: "Fiber Africa",
      contactName: "Vernon Claassen",
      contactNumber: "079 644 2970",
      email: "vernon@fiberafrica.co.za",
      onSiteContact: "Malcolm Teare",
      onSiteContactNumber: "083 267 6305",
      centreManagement: "-",
      centreManagementContact: "-",
      centreManagementEmail: "-",
      circuitNumber: jobData?.circuit_number || "",
      siteType: "Drop Cable Installation",
      siteAddress: jobData?.physical_address_site_b || "Willie Van Schoor",
      clientName: jobData?.client || "-",
      suburb: "Bellville",
      region: "Western Region",
      latitude: "-33.884790°",
      longitude: "18.633900°",
      numberOfBuildings: "-",
      singleEntry: false,
      dualEntry: true,
      clientBuild: "",
      siteOwner: "",
      fiberFloated: "",
      projectNo: jobData?.circuit_number || "GFC21-0007233",
      revision: "00",
      controlDoc: "COG-FRM-005 Rev. 005",
      approvalDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      approverName: "",
      approverSignature: "",
      approverDate: "",
      installationType: "Fiber",
      distance: "60m",
      installationNotes: "Installed new 4F Drop Fiber from existing DFA Infrastructure to end Client.",
      routeDescription: "",
      equipmentInstalled: "Mousepad & Faceplate",
      legalNotice: "Kindly note that certain terms and conditions will be applicable which shall be made available on request by us, and or can be found at http://www.dfafrica.co.za/documents/legal/Terms_Conditions_Premises.pdf.",
    });
    setImages([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="w-6 h-6" />
            AS - BUILT REPORT
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate professional as-built documentation matching the exact PDF format
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* AS-BUILT REPORT Header Section - Exact PDF Match */}
          <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
            <h2 className="font-bold text-2xl mb-4 text-center text-blue-900 dark:text-blue-100">AS - BUILT REPORT</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="precinct" className="font-semibold">PRECINCT:</Label>
                <Input
                  id="precinct"
                  value={formData.precinct}
                  onChange={(e) => handleInputChange("precinct", e.target.value)}
                  className="font-medium"
                />
              </div>
              
              <div>
                <Label htmlFor="premises" className="font-semibold">PREMISES:</Label>
                <Input
                  id="premises"
                  value={formData.premises}
                  onChange={(e) => handleInputChange("premises", e.target.value)}
                  className="font-medium"
                />
              </div>
              
              <div>
                <Label htmlFor="scopeOfWorks" className="font-semibold">Scope of Works:</Label>
                <textarea
                  id="scopeOfWorks"
                  value={formData.scopeOfWorks}
                  onChange={(e) => handleInputChange("scopeOfWorks", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-vertical"
                />
              </div>
            </div>
          </Card>

          {/* AS-BUILT INFORMATION Section - Exact PDF Match */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 text-center bg-gray-200 dark:bg-gray-700 py-2 rounded">AS - BUILT INFORMATION</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="draftedBy" className="font-medium">Drafted By:</Label>
                <Input
                  id="draftedBy"
                  value={formData.draftedBy}
                  onChange={(e) => handleInputChange("draftedBy", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="asBuiltDate" className="font-medium">AS - BUILT Date:</Label>
                <Input
                  id="asBuiltDate"
                  value={formData.asBuiltDate}
                  onChange={(e) => handleInputChange("asBuiltDate", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="companyName" className="font-medium">Company Name:</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="contactName" className="font-medium">Contact Name:</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange("contactName", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="contactNumber" className="font-medium">Contact number:</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="font-medium">E-mail:</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="onSiteContact" className="font-medium">On Site Contact:</Label>
                <Input
                  id="onSiteContact"
                  value={formData.onSiteContact}
                  onChange={(e) => handleInputChange("onSiteContact", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="onSiteContactNumber" className="font-medium">Contact Number:</Label>
                <Input
                  id="onSiteContactNumber"
                  value={formData.onSiteContactNumber}
                  onChange={(e) => handleInputChange("onSiteContactNumber", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="centreManagement" className="font-medium">Centre Management:</Label>
                <Input
                  id="centreManagement"
                  value={formData.centreManagement}
                  onChange={(e) => handleInputChange("centreManagement", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="centreManagementContact" className="font-medium">Contact:</Label>
                <Input
                  id="centreManagementContact"
                  value={formData.centreManagementContact}
                  onChange={(e) => handleInputChange("centreManagementContact", e.target.value)}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="centreManagementEmail" className="font-medium">Email:</Label>
                <Input
                  id="centreManagementEmail"
                  type="email"
                  value={formData.centreManagementEmail}
                  onChange={(e) => handleInputChange("centreManagementEmail", e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* SITE INFORMATION Section - Exact PDF Match */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 text-center bg-gray-200 dark:bg-gray-700 py-2 rounded">SITE INFORMATION</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="circuitNumber" className="font-medium">Circuit Number:</Label>
                <Input
                  id="circuitNumber"
                  value={formData.circuitNumber}
                  onChange={(e) => handleInputChange("circuitNumber", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="siteType" className="font-medium">Site Type:</Label>
                <Input
                  id="siteType"
                  value={formData.siteType}
                  onChange={(e) => handleInputChange("siteType", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="siteAddress" className="font-medium">Site Address:</Label>
                <Input
                  id="siteAddress"
                  value={formData.siteAddress}
                  onChange={(e) => handleInputChange("siteAddress", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="clientName" className="font-medium">Client Name:</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="suburb" className="font-medium">Suburb:</Label>
                <Input
                  id="suburb"
                  value={formData.suburb}
                  onChange={(e) => handleInputChange("suburb", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="region" className="font-medium">Region:</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="latitude" className="font-medium">Latitude:</Label>
                <Input
                  id="latitude"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="longitude" className="font-medium">Longitude:</Label>
                <Input
                  id="longitude"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="numberOfBuildings" className="font-medium">Number of Buildings:</Label>
                <Input
                  id="numberOfBuildings"
                  value={formData.numberOfBuildings}
                  onChange={(e) => handleInputChange("numberOfBuildings", e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <Label className="font-medium">Entry Type:</Label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="entryType"
                      checked={formData.singleEntry}
                      onChange={() => {
                        handleInputChange("singleEntry", true);
                        handleInputChange("dualEntry", false);
                      }}
                    />
                    <span>Single Entry</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="entryType"
                      checked={formData.dualEntry}
                      onChange={() => {
                        handleInputChange("singleEntry", false);
                        handleInputChange("dualEntry", true);
                      }}
                    />
                    <span>Dual Entry</span>
                  </label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="clientBuild" className="font-medium">Client Build:</Label>
                <Input
                  id="clientBuild"
                  value={formData.clientBuild}
                  onChange={(e) => handleInputChange("clientBuild", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="siteOwner" className="font-medium">Site Owner:</Label>
                <Input
                  id="siteOwner"
                  value={formData.siteOwner}
                  onChange={(e) => handleInputChange("siteOwner", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="fiberFloated" className="font-medium">Fiber Floated:</Label>
                <Input
                  id="fiberFloated"
                  value={formData.fiberFloated}
                  onChange={(e) => handleInputChange("fiberFloated", e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Installation Details Section */}
          <Card className="p-6 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
            <h3 className="font-bold text-lg mb-4 text-green-900 dark:text-green-100">INSTALLATION DETAILS</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="installationType" className="font-medium">Type:</Label>
                <Input
                  id="installationType"
                  value={formData.installationType}
                  onChange={(e) => handleInputChange("installationType", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="distance" className="font-medium">Distance:</Label>
                <Input
                  id="distance"
                  value={formData.distance}
                  onChange={(e) => handleInputChange("distance", e.target.value)}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="installationNotes" className="font-medium">Note:</Label>
                <textarea
                  id="installationNotes"
                  value={formData.installationNotes}
                  onChange={(e) => handleInputChange("installationNotes", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-vertical"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="equipmentInstalled" className="font-medium">Equipment Installed:</Label>
                <Input
                  id="equipmentInstalled"
                  value={formData.equipmentInstalled}
                  onChange={(e) => handleInputChange("equipmentInstalled", e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* AS-BUILT REPORT APPROVAL Section - Exact PDF Match */}
          <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
            <h3 className="font-bold text-lg mb-4 text-center bg-yellow-200 dark:bg-yellow-700 py-2 rounded">AS - BUILT REPORT APPROVAL</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectNo" className="font-medium">PROJECT NO:</Label>
                <Input
                  id="projectNo"
                  value={formData.projectNo}
                  onChange={(e) => handleInputChange("projectNo", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="revision" className="font-medium">REVISION:</Label>
                <Input
                  id="revision"
                  value={formData.revision}
                  onChange={(e) => handleInputChange("revision", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="controlDoc" className="font-medium">CONTROL DOC:</Label>
                <Input
                  id="controlDoc"
                  value={formData.controlDoc}
                  onChange={(e) => handleInputChange("controlDoc", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="approvalDate" className="font-medium">DATE:</Label>
                <Input
                  id="approvalDate"
                  value={formData.approvalDate}
                  onChange={(e) => handleInputChange("approvalDate", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="approverName" className="font-medium">Name:</Label>
                <Input
                  id="approverName"
                  value={formData.approverName}
                  onChange={(e) => handleInputChange("approverName", e.target.value)}
                  placeholder="………………………………."
                />
              </div>
              
              <div>
                <Label htmlFor="approverSignature" className="font-medium">Signature:</Label>
                <Input
                  id="approverSignature"
                  value={formData.approverSignature}
                  onChange={(e) => handleInputChange("approverSignature", e.target.value)}
                  placeholder="………………………………."
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="approverDate" className="font-medium">Date:</Label>
                <Input
                  id="approverDate"
                  value={formData.approverDate}
                  onChange={(e) => handleInputChange("approverDate", e.target.value)}
                  placeholder="………………………………."
                />
              </div>
            </div>
          </Card>

          {/* Route Photos Section - matching PDF */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Route Photos
            </h3>
            
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Drag and drop route photos here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Include installation, equipment, and completion photos
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload').click()}
              >
                Choose Files
              </Button>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="mt-6 space-y-4">
                {images.map((image) => (
                  <div key={image.id} className="flex gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={image.preview}
                        alt="Preview"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <Label className="font-medium">Photo Details</Label>
                        <button
                          onClick={() => removeImage(image.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Category</Label>
                          <select
                            value={image.category}
                            onChange={(e) => updateImageCategory(image.id, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="route_photos">Route Photos</option>
                            <option value="equipment">Equipment</option>
                            <option value="installation">Installation Process</option>
                            <option value="completion">Completion</option>
                            <option value="site_conditions">Site Conditions</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-sm">Caption</Label>
                          <Input
                            placeholder="Photo description..."
                            value={image.caption}
                            onChange={(e) => updateImageCaption(image.id, e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Legal Notice Section - Exact PDF Match */}
          <Card className="p-6 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
            <h3 className="font-bold text-lg mb-4">LEGAL NOTICE</h3>
            <div>
              <Label htmlFor="legalNotice" className="font-medium">Terms and Conditions:</Label>
              <textarea
                id="legalNotice"
                value={formData.legalNotice}
                onChange={(e) => handleInputChange("legalNotice", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-vertical"
                readOnly
              />
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={generating}
            >
              Reset Form
            </Button>
            <Button
              onClick={handleGenerateDocument}
              disabled={generating || !formData.circuitNumber || !formData.premises}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating AS-BUILT PDF...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate AS-BUILT PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}