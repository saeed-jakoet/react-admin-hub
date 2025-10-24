"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { get } from "@/lib/api/fetcher";
import dynamic from "next/dynamic";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Loader } from "@/components/shared/Loader";

// Dynamically import react-pdf components on the client only
const PDFDocument = dynamic(
  () =>
    import("react-pdf").then((mod) => {
      // Set worker when module loads
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
      return mod.Document;
    }),
  { ssr: false }
);
const PDFPage = dynamic(() => import("react-pdf").then((m) => m.Page), {
  ssr: false,
});

export default function PlanningDocumentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pdfReady, setPdfReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);

  // Ensure we only render the PDF after first client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchPlanningDoc() {
      try {
        setLoading(true);
        setError(null);
        setPdfReady(false);
        setNumPages(null);

        // Fetch all documents for this drop cable job
        const response = await get(`/documents/job/drop_cable/${id}`);
        const documents = response?.data || [];

        // Find the planning document
        const planningDoc = documents.find(
          (doc) => doc.category === "planning"
        );

        if (!planningDoc) {
          setError("No planning document found for this job.");
          setLoading(false);
          return;
        }

        // Get signed URL for the planning document
        const urlResponse = await get(
          `/documents/signed-url?id=${planningDoc.id}&expires=3600`
        );

        if (urlResponse?.data?.url) {
          setPdfUrl(urlResponse.data.url);
          // Longer delay to ensure worker is ready after navigation
          setTimeout(() => {
            setPdfReady(true);
            setLoading(false);
          }, 300);
        } else {
          setError("Failed to retrieve document URL.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching planning document:", err);
        setError("Failed to load planning document. Please try again.");
        setLoading(false);
      }
    }

    if (id) {
      fetchPlanningDoc();
    }
    
    // Cleanup on unmount
    return () => {
      setPdfReady(false);
      setNumPages(null);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader
          variant="bars"
          size="lg"
          text="Loading your planning document..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Document Not Available
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Planning Document
                </h1>
                <p className="text-sm text-gray-500">
                  Installation planning and technical specifications
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF as images, no controls */}
      <div
        className="flex-1 w-full h-full overflow-auto bg-white"
        style={{ minHeight: 0 }}
      >
        {!pdfLoaded && (
          <div className="flex items-center justify-center h-full">
            <Loader variant="bars" size="lg" text="Loading your planning document..." />
          </div>
        )}
        {mounted && pdfUrl && !loading && pdfReady && (
          <PDFDocument
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setPdfLoaded(true);
            }}
            loading={<div />}
            error={
              <div className="flex items-center justify-center h-full text-red-600">
                Failed to load PDF
              </div>
            }
            key={pdfUrl}
          >
            {numPages &&
              Array.from({ length: numPages }, (_, i) => (
                <PDFPage
                  key={i}
                  pageNumber={i + 1}
                  width={
                    typeof window !== "undefined" ? window.innerWidth : 400
                  }
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="mx-auto"
                />
              ))}
          </PDFDocument>
        )}
      </div>
    </div>
  );
}
