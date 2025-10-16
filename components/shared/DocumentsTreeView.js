"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronRight,
  ChevronDown,
  Download,
  Eye,
  Search,
  Hash,
  AlertCircle,
  RefreshCw,
  Building2,
  Cable,
  X,
  FolderOpen,
  Folder,
  File,
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
  const [expandedJobTypes, setExpandedJobTypes] = useState(new Set());
  const [expandedJobs, setExpandedJobs] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const hasFetchedRef = useRef(false);
  const loadingJobsRef = useRef(new Set());

  // Filtering and search
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Job types configuration
  const jobTypes = useMemo(
    () => [
      {
        name: "Drop Cable Installations",
        type: "drop_cable",
        apiEndpoint: "/drop-cable",
        documentType: "drop_cable",
        icon: Cable,
        implemented: true,
      },
      {
        name: "Floating Civils",
        type: "floating_civils",
        apiEndpoint: "/floating-civils",
        documentType: "floating_civils",
        icon: Cable,
        implemented: false,
      },
      {
        name: "Civils",
        type: "civils",
        apiEndpoint: "/civils",
        documentType: "civils",
        icon: Cable,
        implemented: false,
      },
      {
        name: "Link Build",
        type: "link_build",
        apiEndpoint: "/link-build",
        documentType: "link_build",
        icon: Cable,
        implemented: false,
      },
      {
        name: "Access Build",
        type: "access_build",
        apiEndpoint: "/access-build",
        documentType: "access_build",
        icon: Cable,
        implemented: false,
      },
      {
        name: "Root Build",
        type: "root_build",
        apiEndpoint: "/root-build",
        documentType: "root_build",
        icon: Cable,
        implemented: false,
      },
      {
        name: "Maintenance",
        type: "maintenance",
        apiEndpoint: "/maintenance",
        documentType: "maintenance",
        icon: Cable,
        implemented: false,
      },
      {
        name: "Relocations",
        type: "relocations",
        apiEndpoint: "/relocations",
        documentType: "relocations",
        icon: Cable,
        implemented: false,
      },
    ],
    []
  );

  // Reset fetch guard when client changes
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [clientId, jobTypes]);

  // Fetch jobs
  useEffect(() => {
    const fetchAllJobsAndDocuments = async () => {
      if (!clientId) return;
      if (hasFetchedRef.current) return;

      try {
        setLoading(true);
        setError(null);

        const allJobsData = {};
        const implementedJobTypes = jobTypes.filter((jt) => jt.implemented);

        for (const jobType of implementedJobTypes) {
          try {
            const response = await get(
              `${jobType.apiEndpoint}/client/${clientId}`
            );
            const jobs = response.data || [];

            if (jobs.length > 0) {
              allJobsData[jobType.type] = jobs;
            }
          } catch (err) {
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

  // Fetch documents for a job
  const fetchDocumentsForJob = async (jobTypeKey, job) => {
    const jobKey = `${jobTypeKey}_${job.id}`;
    if (documents[jobKey]) return;
    if (loadingJobsRef.current.has(jobKey)) return;

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
      console.error(
        `Error fetching documents for ${jobTypeKey} job ${job.id}:`,
        docErr
      );
      setDocuments((prev) => ({ ...prev, [jobKey]: [] }));
    } finally {
      loadingJobsRef.current.delete(jobKey);
    }
  };

  // Toggle job type expansion
  const toggleJobType = (jobTypeKey) => {
    const newExpanded = new Set(expandedJobTypes);
    if (newExpanded.has(jobTypeKey)) {
      newExpanded.delete(jobTypeKey);
    } else {
      newExpanded.add(jobTypeKey);
    }
    setExpandedJobTypes(newExpanded);
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
        fetchDocumentsForJob(jobTypeKey, job);
      }
    }

    setExpandedJobs(newExpanded);
  };

  // Toggle category expansion
  const toggleCategory = (categoryKey) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
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

  // Filter logic
  const filteredJobsByType = useMemo(() => {
    const result = {};

    Object.entries(allJobs).forEach(([jobType, jobs]) => {
      const filteredJobs = jobs.filter((job) => {
        const matchesJobType =
          jobTypeFilter === "all" || jobType === jobTypeFilter;

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

  // Get all documents
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

  // Format helpers
  const formatCategory = (category) => {
    const categoryMap = {
      "as-built": "As-Built",
      planning: "Planning",
      happy_letter: "Happy Letter",
    };
    return categoryMap[category] || category;
  };

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
      <Card className="p-6 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Documents
          </h3>
        </div>
        <Loader variant="bars" text="Loading documents..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Documents
          </h3>
        </div>
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Documents
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {stats.totalJobs} jobs · {stats.totalDocs} documents
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search jobs and documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:border-slate-300 dark:focus:border-slate-500 focus:ring-slate-200 dark:focus:ring-slate-700"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <Folder className="w-3.5 h-3.5" />
              {jobTypeFilter === "all"
                ? "All Types"
                : availableJobTypes.find((jt) => jt.type === jobTypeFilter)
                    ?.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setJobTypeFilter("all")}>
              All Types
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

        {(searchTerm || jobTypeFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Tree View */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
        {Object.keys(filteredJobsByType).length === 0 ? (
          <div className="text-center py-16">
            <Folder className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-1">
              No jobs found
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {searchTerm || jobTypeFilter !== "all"
                ? "Try adjusting your filters"
                : "No data available for this client"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Object.entries(filteredJobsByType).map(([jobTypeKey, jobs]) => {
              const jobTypeConfig = jobTypes.find(
                (jt) => jt.type === jobTypeKey
              );
              if (!jobTypeConfig) return null;

              const isJobTypeExpanded = expandedJobTypes.has(jobTypeKey);

              return (
                <div key={jobTypeKey}>
                  {/* Job Type Level */}
                  <div
                    onClick={() => toggleJobType(jobTypeKey)}
                    className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isJobTypeExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <Folder className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                      <span className="font-medium text-sm text-slate-700 dark:text-slate-200">
                        {jobTypeConfig.name}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs font-normal dark:bg-slate-800 dark:text-slate-200"
                    >
                      {jobs.length}
                    </Badge>
                  </div>

                  {/* Jobs Level */}
                  {isJobTypeExpanded && (
                    <div className="bg-slate-50/50 dark:bg-slate-800/50">
                      {jobs.map((job) => {
                        const jobKey = `${jobTypeKey}_${job.id}`;
                        const isJobExpanded = expandedJobs.has(jobKey);
                        const jobDocs = documents[jobKey] || [];

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
                              onClick={() =>
                                toggleJobExpansion(jobTypeKey, job)
                              }
                              className="flex items-center gap-2 pl-10 pr-4 py-2.5 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 cursor-pointer select-none border-l-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {isJobExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                )}
                                <Hash className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="text-sm text-slate-700 dark:text-slate-200 truncate">
                                    {job.circuit_number ||
                                      job.access_id ||
                                      job.link_id ||
                                      job.maintenance_type ||
                                      "No ID"}
                                  </span>
                                  {(job.site_b_name || job.location) && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                      · {job.site_b_name || job.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {formatStatus(job.status)}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-xs font-normal dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                                >
                                  {jobDocs.length}
                                </Badge>
                              </div>
                            </div>

                            {/* Categories Level */}
                            {isJobExpanded && (
                              <div className="bg-slate-50 dark:bg-slate-800">
                                {Object.keys(groupedDocs).length === 0 ? (
                                  <div className="pl-16 pr-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                                    No documents
                                  </div>
                                ) : (
                                  Object.entries(groupedDocs)
                                    .filter(
                                      ([category]) =>
                                        categoryFilter === "all" ||
                                        category === categoryFilter
                                    )
                                    .map(([category, categoryDocs]) => {
                                      const categoryKey = `${jobKey}_${category}`;
                                      const isCategoryExpanded =
                                        expandedCategories.has(categoryKey);

                                      return (
                                        <div key={category}>
                                          {/* Category Row */}
                                          <div
                                            onClick={() =>
                                              toggleCategory(categoryKey)
                                            }
                                            className="flex items-center gap-2 pl-16 pr-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer select-none"
                                          >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                              {isCategoryExpanded ? (
                                                <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                              ) : (
                                                <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                              )}
                                              <FolderOpen className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                              <span className="text-xs text-slate-600 dark:text-slate-300">
                                                {formatCategory(category)}
                                              </span>
                                            </div>
                                            <Badge
                                              variant="outline"
                                              className="text-xs font-normal dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                                            >
                                              {categoryDocs.length}
                                            </Badge>
                                          </div>

                                          {/* Documents Level */}
                                          {isCategoryExpanded && (
                                            <div className="bg-white/50 dark:bg-slate-900/50">
                                              {categoryDocs.map((doc) => (
                                                <div
                                                  key={doc.id}
                                                  className="flex items-center gap-2 pl-24 pr-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 group"
                                                >
                                                  <File className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                                  <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-slate-700 dark:text-slate-200 truncate">
                                                      {doc.file_name}
                                                    </div>
                                                    {doc.created_at && (
                                                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                        {new Date(
                                                          doc.created_at
                                                        ).toLocaleDateString()}
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDocumentAction(
                                                          doc.id,
                                                          "view"
                                                        );
                                                      }}
                                                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                                                      title="View"
                                                    >
                                                      <Eye className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                                                    </button>
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDocumentAction(
                                                          doc.id,
                                                          "download"
                                                        );
                                                      }}
                                                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                                                      title="Download"
                                                    >
                                                      <Download className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                                                    </button>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsTreeView;
