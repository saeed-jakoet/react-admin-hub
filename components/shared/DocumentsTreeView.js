"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Download,
  Eye,
  Search,
  Calendar,
  Hash,
  MapPin,
  AlertCircle,
  RefreshCw,
  Building2,
  Cable,
  X,
  FileCheck,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { get } from "@/lib/api/fetcher";
import { Loader } from "@/components/shared/Loader";

const DocumentsTreeView = ({ clientId }) => {
  // State management
  const [allJobs, setAllJobs] = useState({});
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedJobs, setExpandedJobs] = useState(new Set());
  const hasFetchedRef = useRef(false); // Prevent duplicate fetches (StrictMode/HMR)
  const loadingJobsRef = useRef(new Set()); // Track in-flight doc fetches per jobKey

  // Filtering and search
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Job types configuration - only include implemented endpoints
  // TO ENABLE A NEW JOB TYPE: Set implemented: true when you create the API endpoint
  const jobTypes = useMemo(() => [
    {
      name: "Drop Cable Installations",
      type: "drop_cable",
      apiEndpoint: "/drop-cable",
      documentType: "drop_cable",
      icon: Cable,
      color: "blue",
      implemented: true, // ✅ IMPLEMENTED
    },
    {
      name: "Floating Civils",
      type: "floating_civils",
      apiEndpoint: "/floating-civils",
      documentType: "floating_civils",
      icon: Cable,
      color: "red",
      implemented: false, // ❌ TODO: Implement /floating-civils/client/:id endpoint
    },
    {
      name: "Civils",
      type: "civils",
      apiEndpoint: "/civils",
      documentType: "civils",
      icon: Cable,
      color: "orange",
      implemented: false, // ❌ TODO: Implement /floating-civils/client/:id endpoint
    },
    {
      name: "Link Build",
      type: "link_build",
      apiEndpoint: "/link-build",
      documentType: "link_build",
      icon: Cable,
      color: "purple",
      implemented: false, // ❌ TODO: Implement /link-build/client/:id endpoint
    },
    {
      name: "Access Build",
      type: "access_build",
      apiEndpoint: "/access-build",
      documentType: "access_build",
      icon: Cable,
      color: "teal",
      implemented: false, // ❌ TODO: Implement /access-build/client/:id endpoint
    },
    {
      name: "Root Build",
      type: "root_build",
      apiEndpoint: "/root-build",
      documentType: "root_build",
      icon: Cable,
      color: "indigo",
      implemented: false, // ❌ TODO: Implement /root-build/client/:id endpoint
    },
    {
      name: "Maintenance",
      type: "maintenance",
      apiEndpoint: "/maintenance",
      documentType: "maintenance",
      icon: Cable,
      color: "yellow",
      implemented: false, // ❌ TODO: Implement /maintenance/client/:id endpoint
    },
    {
      name: "Relocations",
      type: "relocations",
      apiEndpoint: "/relocations",
      documentType: "relocations",
      icon: Cable,
      color: "pink",
      implemented: false, // ❌ TODO: Implement /relocations/client/:id endpoint
    },
  ], []);

  // Reset fetch guard when client changes
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [clientId, jobTypes]);

  // Fetch only jobs for implemented job types (documents will be lazy-loaded per expansion)
  useEffect(() => {
    const fetchAllJobsAndDocuments = async () => {
      if (!clientId) return;
      if (hasFetchedRef.current) return; // Guard against duplicate runs in dev StrictMode/HMR

      try {
        setLoading(true);
        setError(null);

        const allJobsData = {};

        // Only fetch from implemented endpoints
        const implementedJobTypes = jobTypes.filter((jt) => jt.implemented);

        // Fetch jobs for each implemented job type
        for (const jobType of implementedJobTypes) {
          try {
            const response = await get(
              `${jobType.apiEndpoint}/client/${clientId}`
            );
            const jobs = response.data || [];

            if (jobs.length > 0) {
              allJobsData[jobType.type] = jobs;
            } else {
              console.log(
                `No ${jobType.name} jobs found for client ${clientId}`
              );
            }
          } catch (err) {
            // Log error but continue with other job types
            if (err.message?.includes("404") || err.status === 404) {
              console.warn(
                `Endpoint ${jobType.apiEndpoint}/client/${clientId} not implemented yet (404)`
              );
            } else {
              console.error(`Error fetching ${jobType.type} jobs:`, err);
            }
          }
        }

        setAllJobs(allJobsData);
        // Clear any previous documents when switching clients; documents will be fetched on-demand
        setDocuments({});
        hasFetchedRef.current = true;
      } catch (err) {
        console.error("Error fetching jobs and documents:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllJobsAndDocuments();
  }, [clientId, jobTypes]);

  // Fetch documents for a job (lazy-load on expand, with de-dupe)
  const fetchDocumentsForJob = async (jobTypeKey, job) => {
    const jobKey = `${jobTypeKey}_${job.id}`;
    if (documents[jobKey]) return; // already loaded
    if (loadingJobsRef.current.has(jobKey)) return; // in-flight

    const jobTypeConfig = jobTypes.find((jt) => jt.type === jobTypeKey);
    if (!jobTypeConfig) return;

    try {
      loadingJobsRef.current.add(jobKey);
      const docResponse = await get(
        `/documents/job/${jobTypeConfig.documentType}/${job.id}`
      );
      const docs = docResponse.data || [];
      setDocuments((prev) => ({ ...prev, [jobKey]: docs }));
    } catch (docErr) {
      console.error(`Error fetching documents for ${jobTypeKey} job ${job.id}:`, docErr);
      setDocuments((prev) => ({ ...prev, [jobKey]: [] }));
    } finally {
      loadingJobsRef.current.delete(jobKey);
    }
  };

  // Toggle job expansion
  const toggleJobExpansion = (jobTypeKey, job) => {
    const jobKey = `${jobTypeKey}_${job.id}`;
    const newExpanded = new Set(expandedJobs);

    if (newExpanded.has(jobKey)) {
      newExpanded.delete(jobKey);
    } else {
      newExpanded.add(jobKey);
      if (!documents[jobKey]) {
        // Lazy-load documents for this job on first expand
        fetchDocumentsForJob(jobTypeKey, job);
      }
    }

    setExpandedJobs(newExpanded);
  };

  // Handle document actions
  const handleDocumentAction = async (documentId, action = "view") => {
    try {
      const response = await get(
        `/documents/signed-url?id=${documentId}&expires=3600`
      );
      const signedUrl = response.data?.url;

      if (signedUrl) {
        if (action === "download") {
          const link = document.createElement("a");
          link.href = signedUrl;
          link.download = "";
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          window.open(signedUrl, "_blank");
        }
      }
    } catch (err) {
      console.error("Error getting signed URL:", err);
      alert("Failed to access document. Please try again.");
    }
  };

  // Filter and search logic
  const filteredJobsByType = useMemo(() => {
    const result = {};

    Object.entries(allJobs).forEach(([jobType, jobs]) => {
      const filteredJobs = jobs.filter((job) => {
        // Job type filter
        const matchesJobType =
          jobTypeFilter === "all" || jobType === jobTypeFilter;

        // Search filter
        const matchesSearch =
          !searchTerm ||
          [
            job.circuit_number,
            job.site_b_name,
            job.physical_address_site_b,
            job.technician_name,
            job.client,
            job.access_id,
            job.link_id,
            job.maintenance_type,
            job.location,
          ].some((field) =>
            field?.toLowerCase().includes(searchTerm.toLowerCase())
          );

        return matchesJobType && matchesSearch;
      });

      if (filteredJobs.length > 0) {
        result[jobType] = filteredJobs;
      }
    });

    return result;
  }, [allJobs, searchTerm, jobTypeFilter]);

  // Get all documents for filtering
  const allDocuments = useMemo(() => {
    const docs = [];
    Object.entries(documents).forEach(([jobKey, jobDocs]) => {
      const [jobType, jobId] = jobKey.split("_");
      const jobs = allJobs[jobType] || [];
      const job = jobs.find((j) => j.id === jobId);
      jobDocs.forEach((doc) => {
        docs.push({ ...doc, job, jobType });
      });
    });
    return docs;
  }, [documents, allJobs]);

  // Get unique values for filters
  const availableJobTypes = useMemo(
    () =>
      jobTypes.filter((jt) => allJobs[jt.type] && allJobs[jt.type].length > 0),
    [allJobs, jobTypes]
  );

  const uniqueCategories = useMemo(
    () => [...new Set(allDocuments.map((doc) => doc.category).filter(Boolean))],
    [allDocuments]
  );

  // Format category display
  const formatCategory = (category) => {
    const categoryMap = {
      "as-built": "As-Built",
      planning: "Planning",
      happy_letter: "Happy Letter",
    };
    return categoryMap[category] || category;
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      "as-built": "bg-emerald-50 text-emerald-700 border-emerald-200",
      planning: "bg-blue-50 text-blue-700 border-blue-200",
      happy_letter: "bg-purple-50 text-purple-700 border-purple-200",
    };
    return colors[category] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Statistics
  const stats = useMemo(() => {
    const totalJobs = Object.values(filteredJobsByType).reduce(
      (acc, jobs) => acc + jobs.length,
      0
    );
    const totalDocs = allDocuments.length;
    const jobTypesWithDocs = Object.keys(filteredJobsByType).length;

    return { totalJobs, totalDocs, jobTypesWithDocs };
  }, [filteredJobsByType, allDocuments]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setJobTypeFilter("all");
    setCategoryFilter("all");
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Documents
          </h3>
        </div>
        <Loader variant="bars" text="Loading documents..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Documents
          </h3>
        </div>
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-300">
            Error loading documents: {error}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="ml-auto"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Documents
          </h3>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs font-medium">
            {stats.totalJobs} Jobs
          </Badge>
          <Badge variant="secondary" className="text-xs font-medium">
            {stats.totalDocs} Documents
          </Badge>
          <Badge variant="secondary" className="text-xs font-medium">
            {stats.jobTypesWithDocs} Job Types
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <Input
            placeholder="Search circuits, sites, or documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 h-9 text-sm"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Filter Row */}
        <div className="flex gap-2 flex-wrap">
          {/* Job Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
                <Building2 className="w-3 h-3" />
                Job Type:{" "}
                {jobTypeFilter === "all"
                  ? "All"
                  : availableJobTypes.find((jt) => jt.type === jobTypeFilter)
                      ?.name || jobTypeFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setJobTypeFilter("all")}>
                All Order Types
              </DropdownMenuItem>
              {availableJobTypes.map((jobType) => (
                <DropdownMenuItem
                  key={jobType.type}
                  onClick={() => setJobTypeFilter(jobType.type)}
                >
                  {jobType.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
                <FileText className="w-3 h-3" />
                Category:{" "}
                {categoryFilter === "all"
                  ? "All"
                  : formatCategory(categoryFilter)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setCategoryFilter("all")}>
                All Categories
              </DropdownMenuItem>
              {uniqueCategories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                >
                  {formatCategory(category)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {(searchTerm ||
            jobTypeFilter !== "all" ||
            categoryFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 text-xs"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Professional Document Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                All Orders Documents
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[600px] overflow-y-auto">
          {Object.keys(filteredJobsByType).length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-8 h-8 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                No jobs found
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {searchTerm || jobTypeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Expand a job to load its documents"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {Object.entries(filteredJobsByType).map(([jobTypeKey, jobs]) => {
                const jobTypeConfig = jobTypes.find(
                  (jt) => jt.type === jobTypeKey
                );
                if (!jobTypeConfig) return null;

                return (
                  <div key={jobTypeKey}>
                    {/* Job Type Header */}
                    <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <jobTypeConfig.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {jobTypeConfig.name}
                        </span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"}
                        </Badge>
                      </div>
                    </div>

                    {/* Jobs in this type */}
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                      {jobs.map((job, index) => {
                        const isExpanded = expandedJobs.has(
                          `${jobTypeKey}_${job.id}`
                        );
                        const jobKey = `${jobTypeKey}_${job.id}`;
                        const jobDocs = documents[jobKey] || [];
                        const docCount = jobDocs.length;

                        // Group documents by category
                        const groupedDocs = jobDocs.reduce((acc, doc) => {
                          const category = doc.category || "other";
                          if (!acc[category]) acc[category] = [];
                          acc[category].push(doc);
                          return acc;
                        }, {});

                        return (
                          <div key={job.id}>
                            {/* Job Row */}
                            <div
                              className={`${
                                index % 2 === 0
                                  ? "bg-white dark:bg-gray-800"
                                  : "bg-gray-50/50 dark:bg-gray-700/50"
                              } hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}
                            >
                              <div className="px-4 py-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <button
                                      onClick={() =>
                                        toggleJobExpansion(jobTypeKey, job)
                                      }
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                      )}
                                    </button>

                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                        {job.circuit_number ||
                                          job.access_id ||
                                          job.link_id ||
                                          job.maintenance_type ||
                                          "No Identifier"}
                                      </span>

                                      {(job.site_b_name || job.location) && (
                                        <>
                                          <span className="text-gray-400 dark:text-gray-500">
                                            →
                                          </span>
                                          <div className="flex items-center gap-1 min-w-0">
                                            <MapPin className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-300 text-sm truncate">
                                              {job.site_b_name || job.location}
                                            </span>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    {/* Status Badge */}
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-2 py-1"
                                    >
                                      {formatStatus(job.status)}
                                    </Badge>

                                    {/* Document Count */}
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                      <FileCheck className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                      <span>
                                        {docCount} doc
                                        {docCount !== 1 ? "s" : ""}
                                      </span>
                                    </div>

                                    {/* Expand Button */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        toggleJobExpansion(jobTypeKey, job)
                                      }
                                      className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                    >
                                      {isExpanded ? "Collapse" : "Expand"}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Documents Section */}
                            {isExpanded && (
                              <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                                <div className="p-4">
                                  {Object.entries(groupedDocs)
                                    .filter(
                                      ([category]) =>
                                        categoryFilter === "all" ||
                                        category === categoryFilter
                                    )
                                    .map(([category, categoryDocs]) => (
                                      <div
                                        key={category}
                                        className="mb-4 last:mb-0"
                                      >
                                        {/* Category Header */}
                                        <div className="flex items-center gap-2 mb-2">
                                          <FolderOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                          <Badge
                                            variant="outline"
                                            className={`${getCategoryColor(
                                              category
                                            )} text-xs font-medium`}
                                          >
                                            {formatCategory(category)}
                                          </Badge>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            ({categoryDocs.length} file
                                            {categoryDocs.length !== 1
                                              ? "s"
                                              : ""}
                                            )
                                          </span>
                                        </div>

                                        {/* Document Grid */}
                                        <div className="grid gap-2">
                                          {categoryDocs.map((doc) => (
                                            <div
                                              key={doc.id}
                                              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm transition-all group"
                                            >
                                              <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />

                                              <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                                  {doc.file_name}
                                                </div>
                                                {doc.created_at && (
                                                  <div className="flex items-center gap-1 mt-1">
                                                    <Calendar className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                      {new Date(
                                                        doc.created_at
                                                      ).toLocaleDateString()}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>

                                              {/* Document Actions */}
                                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() =>
                                                    handleDocumentAction(
                                                      doc.id,
                                                      "view"
                                                    )
                                                  }
                                                  className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300"
                                                  title="View document"
                                                >
                                                  <Eye className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() =>
                                                    handleDocumentAction(
                                                      doc.id,
                                                      "download"
                                                    )
                                                  }
                                                  className="h-7 w-7 p-0 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-700 dark:hover:text-green-300"
                                                  title="Download document"
                                                >
                                                  <Download className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DocumentsTreeView;
