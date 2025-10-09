"use client";

import * as React from "react";
import { get } from "@/lib/api/fetcher";

export function useStaffDocuments(staffId) {
  const [documents, setDocuments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchDocuments = React.useCallback(async () => {
    if (!staffId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await get(`/staff/${staffId}/documents`);
      setDocuments(response.data || []);
    } catch (err) {
      console.error("Error fetching staff documents:", err);
      setError(err.message || "Failed to fetch documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments
  };
}