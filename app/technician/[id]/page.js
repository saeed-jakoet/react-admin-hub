"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Type, PenTool, Trash2, Check, X } from "lucide-react";
import { get } from "@/lib/api/fetcher";
import { getHappyLetterTemplateUrl } from "@/lib/api/happyLetter";
import { uploadDocument } from "@/lib/api/documents";
import SignaturePad from "react-signature-canvas";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Loader } from "@/components/shared/Loader";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function TechnicianOrderDetail() {
  // Prevent zoom on mount
  useEffect(() => {
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, []);
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [templateUrl, setTemplateUrl] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [clientName, setClientName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(0);

  const [pdfDimensions, setPdfDimensions] = useState({ width: 612, height: 792 });
  const pdfContainerRef = useRef(null);
  const pageRef = useRef(null);

  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [fieldsLocked, setFieldsLocked] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [currentSignatureField, setCurrentSignatureField] = useState(null);
  const sigPadRef = useRef(null);

  // Redirect if not technician
  useEffect(() => {
    if (user && user.role !== "technician") {
      router.push("/");
    }
  }, [user, router]);

  // Fetch order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await get(`/drop-cable/${orderId}`);
        const data = response?.status === "success" ? response.data : response;
        setOrder(data);
        const cn = data?.client || data?.clients?.company_name || "";
        setClientName(cn);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId && user?.role === "technician") fetchOrder();
  }, [orderId, user]);

  // Fetch template
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const url = await getHappyLetterTemplateUrl(3600);
        setTemplateUrl(url);
        
        // Fetch PDF once
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        
        // Set blob for react-pdf
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        setPdfFile(blob);
        
        // Load PDF to get actual dimensions
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const firstPage = pdfDoc.getPages()[0];
        const { width, height } = firstPage.getSize();
        setPdfDimensions({ width, height });
      } catch (e) {
        console.error("Failed to fetch template:", e);
      }
    };
    fetchTemplate();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    // Set initial page width when PDF loads
    setTimeout(() => {
      if (pdfContainerRef.current) {
        const containerWidth = pdfContainerRef.current.clientWidth;
        setPageWidth(containerWidth);
      }
    }, 100);
  };

  // Update page width when container resizes
  useEffect(() => {
    const updateWidth = () => {
      if (pdfContainerRef.current) {
        const containerWidth = pdfContainerRef.current.clientWidth;
        setPageWidth(containerWidth);
      }
    };
    
    // Initial width
    const timer = setTimeout(updateWidth, 500);
    
    window.addEventListener('resize', updateWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateWidth);
    };
  }, [pdfFile]);

  // Handle drag/touch
  useEffect(() => {
    if (!dragging || !pageWidth) return;

    const handleMove = (clientX, clientY) => {
      // Calculate the scale factor: rendered width / actual PDF width
      const scale = pageWidth / pdfDimensions.width;
      
      // Calculate movement delta in screen pixels
      const dx = (clientX - dragging.startX);
      const dy = (clientY - dragging.startY);
      
      // Convert screen pixels to PDF points
      const pdfDx = dx / scale;
      const pdfDy = dy / scale;
      
      // Calculate new position in PDF coordinates
      const newX = Math.max(0, Math.min(pdfDimensions.width - dragging.fieldWidth, dragging.originalX + pdfDx));
      const newY = Math.max(0, Math.min(pdfDimensions.height - dragging.fieldHeight, dragging.originalY + pdfDy));
      
      setFields((prev) =>
        prev.map((f) =>
          f.id === dragging.fieldId ? { ...f, x: Math.round(newX), y: Math.round(newY) } : f
        )
      );
    };

    const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };
    const handleEnd = () => setDragging(null);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [dragging, pdfDimensions, pageWidth]);

  // Handle resizing
  useEffect(() => {
    if (!resizing || !pageWidth) return;

    const handleMove = (clientX, clientY) => {
      // Calculate the scale factor
      const scale = pageWidth / pdfDimensions.width;

      // Calculate movement delta in screen pixels
      const deltaX = (clientX - resizing.startX);
      const deltaY = (clientY - resizing.startY);
      
      // Convert to PDF points
      const pdfDeltaX = deltaX / scale;
      const pdfDeltaY = deltaY / scale;

      const newWidth = Math.max(80, resizing.originalWidth + pdfDeltaX);
      const newHeight = Math.max(30, resizing.originalHeight + pdfDeltaY);

      setFields((prev) =>
        prev.map((f) =>
          f.id === resizing.fieldId
            ? { ...f, width: Math.round(newWidth), height: Math.round(newHeight) }
            : f
        )
      );
    };

    const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };
    const handleEnd = () => setResizing(null);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [resizing, pdfDimensions, pageWidth]);

  const addTextField = () => {
    const newField = {
      id: `text_${Date.now()}`,
      type: "text",
      x: 100,
      y: 200,
      width: 250,
      height: 40,
      value: "",
    };
    setFields([...fields, newField]);
    setSelectedField(newField.id);
  };

  const addSignatureField = () => {
    const newField = {
      id: `sig_${Date.now()}`,
      type: "signature",
      x: 100,
      y: 400,
      width: 250,
      height: 80,
      value: null,
    };
    setFields([...fields, newField]);
    setSelectedField(newField.id);
  };

  const deleteField = () => {
    if (!selectedField) return;
    setFields(fields.filter((f) => f.id !== selectedField));
    setSelectedField(null);
  };

  const handleStartDrag = (e, fieldId) => {
    if (fieldsLocked || editingField) return;
    
    e.preventDefault();
    e.stopPropagation();
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    setSelectedField(fieldId);
    setDragging({
      fieldId,
      startX: clientX,
      startY: clientY,
      originalX: field.x,
      originalY: field.y,
      fieldWidth: field.width,
      fieldHeight: field.height,
    });
  };

  const handleStartResize = (e, fieldId) => {
    if (fieldsLocked || editingField) return;
    
    e.preventDefault();
    e.stopPropagation();
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    setSelectedField(fieldId);
    setResizing({
      fieldId,
      startX: clientX,
      startY: clientY,
      originalWidth: field.width,
      originalHeight: field.height,
    });
  };

  const openSignaturePad = (fieldId) => {
    setCurrentSignatureField(fieldId);
    setShowSignaturePad(true);
  };

  const saveSignature = () => {
    if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
      alert("Please sign first");
      return;
    }
    const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL("image/png");
    setFields((prev) =>
      prev.map((f) =>
        f.id === currentSignatureField ? { ...f, value: dataUrl } : f
      )
    );
    setShowSignaturePad(false);
    setCurrentSignatureField(null);
  };

  const closeSignaturePad = () => {
    setShowSignaturePad(false);
    setCurrentSignatureField(null);
    if (sigPadRef.current) {
      sigPadRef.current.clear();
    }
  };

  const submitForm = async () => {
    try {
      setSubmitting(true);
      
      // Build PDF
      const pdfBytes = await fetch(templateUrl).then((r) => r.arrayBuffer());
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      const { height: pageHeight } = lastPage.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Draw fields - convert from screen coordinates to PDF coordinates
      for (const field of fields) {
        // PDF coordinates: (0,0) is bottom-left
        // Screen coordinates: (0,0) is top-left
        // field.x and field.y are already in PDF points
        const pdfX = field.x;
        const pdfY = pageHeight - field.y - field.height;
        
        if (field.type === "text" && field.value) {
          // Match the screen display exactly: text is shown with px-2 py-1 (8px left, 4px top)
          // In PDF, text is drawn from baseline, not top-left
          // We need to calculate where the baseline should be
          const textPaddingX = 8; // matches px-2 in Tailwind
          const textPaddingY = 4; // matches py-1 in Tailwind
          const fontSize = 12;
          
          // PDF text baseline positioning: 
          // Start from bottom of field box, move up by height, then down by padding and font size
          const textBaselineY = pdfY + field.height - fontSize - textPaddingY;
          
          lastPage.drawText(field.value, {
            x: pdfX + textPaddingX,
            y: textBaselineY,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
        } else if (field.type === "signature" && field.value) {
          const pngBytes = await fetch(field.value).then((r) => r.arrayBuffer());
          const pngImage = await pdfDoc.embedPng(pngBytes);
          
          // Match screen display: signature has 2px padding, object-contain
          const padding = 2;
          const availableWidth = field.width - (padding * 2);
          const availableHeight = field.height - (padding * 2);
          
          const imgAspect = pngImage.width / pngImage.height;
          const availableAspect = availableWidth / availableHeight;
          
          let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
          
          if (imgAspect > availableAspect) {
            // Image is wider - fit to width
            drawWidth = availableWidth;
            drawHeight = availableWidth / imgAspect;
            offsetY = (availableHeight - drawHeight) / 2;
          } else {
            // Image is taller - fit to height
            drawHeight = availableHeight;
            drawWidth = availableHeight * imgAspect;
            offsetX = (availableWidth - drawWidth) / 2;
          }
          
          lastPage.drawImage(pngImage, {
            x: pdfX + padding + offsetX,
            y: pdfY + padding + offsetY,
            width: drawWidth,
            height: drawHeight,
          });
        }
      }

      const outBytes = await pdfDoc.save();
      const file = new File([outBytes], "happy_letter_signed.pdf", { type: "application/pdf" });

      // Upload
      await uploadDocument({
        clientName: clientName || "Client",
        clientIdentifier: (clientName || "client").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
        jobType: "drop_cable",
        category: "happy_letter",
        clientId: order.client_id,
        dropCableJobId: order.id,
        circuitNumber: order.circuit_number,
        file,
      });

      alert("Happy letter uploaded successfully!");
      router.back();
    } catch (e) {
      console.error(e);
      alert("Failed to submit: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader variant="bars" size="lg" text="Loading..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <button onClick={() => router.back()} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* PDF Viewer - Full screen */}
      <div 
        ref={pdfContainerRef} 
        className="flex-1 relative overflow-auto bg-gray-100"
      >
        {pdfFile ? (
          <div className="relative inline-block mx-auto">
            <Document
              file={pdfFile}
              onLoadSuccess={onDocumentLoadSuccess}
              className="flex justify-center"
            >
              <div className="relative" ref={pageRef}>
                <Page
                  pageNumber={numPages || 1}
                  width={pageWidth > 0 ? pageWidth : undefined}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
                {/* Field overlays - positioned absolutely on top of PDF canvas */}
                <div 
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{ 
                    width: '100%',
                    height: '100%'
                  }}
                >
                  {fields.map((field) => {
                    const pageRect = pageRef.current?.getBoundingClientRect();
                    if (!pageRect || !pageWidth) return null;
                    
                    // Calculate scale: rendered page width / actual PDF width
                    const scale = pageWidth / pdfDimensions.width;
                    const isEditing = editingField === field.id;
                    
                    return (
                      <div
                        key={field.id}
                        className={`absolute border-2 rounded pointer-events-auto ${
                          selectedField === field.id
                            ? "border-blue-600 bg-blue-500/30"
                            : "border-blue-400 bg-blue-500/20"
                        } ${dragging?.fieldId === field.id ? "shadow-lg" : ""} ${
                          isEditing ? "ring-2 ring-blue-500" : ""
                        }`}
                        style={{
                          left: `${field.x * scale}px`,
                          top: `${field.y * scale}px`,
                          width: `${field.width * scale}px`,
                          height: `${field.height * scale}px`,
                          userSelect: isEditing ? "text" : "none",
                          touchAction: isEditing ? "auto" : "none",
                        }}
                    onMouseDown={(e) => {
                      if (!isEditing && !fieldsLocked) {
                        handleStartDrag(e, field.id);
                      }
                    }}
                    onTouchStart={(e) => {
                      if (!isEditing && !fieldsLocked) {
                        handleStartDrag(e, field.id);
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (fieldsLocked) return;
                      
                      if (field.type === "text" && !dragging && !resizing && !isEditing) {
                        setEditingField(field.id);
                        setSelectedField(field.id);
                        // Focus the input after a tiny delay
                        setTimeout(() => {
                          const input = document.getElementById(`input-${field.id}`);
                          if (input) input.focus();
                        }, 50);
                      } else if (field.type === "signature" && !dragging && !resizing) {
                        openSignaturePad(field.id);
                      }
                    }}
                  >
                    {field.type === "text" && isEditing ? (
                      <input
                        id={`input-${field.id}`}
                        type="text"
                        value={field.value || ""}
                        onChange={(e) => {
                          setFields((prev) =>
                            prev.map((f) => (f.id === field.id ? { ...f, value: e.target.value } : f))
                          );
                        }}
                        onBlur={() => setEditingField(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setEditingField(null);
                          }
                        }}
                        className="w-full h-full px-2 bg-white border-none outline-none text-sm text-black"
                        style={{ fontSize: "16px" }}
                        autoFocus
                      />
                    ) : field.type === "text" ? (
                      <div 
                        className="text-black px-2 py-1 pointer-events-none flex items-start h-full overflow-hidden"
                        style={{ 
                          fontSize: '12px',
                          lineHeight: '12px',
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}
                      >
                        {field.value || "Tap to type"}
                      </div>
                    ) : field.type === "signature" && field.value ? (
                      <img 
                        src={field.value} 
                        alt="Signature" 
                        className="w-full h-full object-contain pointer-events-none"
                        style={{ padding: '2px' }}
                      />
                    ) : (
                      <div className="text-[10px] font-semibold text-blue-900 px-1 truncate pointer-events-none flex items-center justify-center h-full">
                        Tap to sign
                      </div>
                    )}
                    
                    {/* Resize handle - only show when selected and not locked/editing */}
                    {selectedField === field.id && !fieldsLocked && !isEditing && (
                      <div
                        className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-tl-lg cursor-nwse-resize pointer-events-auto"
                        style={{ 
                          borderBottomRightRadius: "0.25rem",
                          touchAction: "none"
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleStartResize(e, field.id);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          handleStartResize(e, field.id);
                        }}
                      >
                        <svg className="w-full h-full p-1 text-white" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M14 14V6l-8 8h8z"/>
                        </svg>
                      </div>
                    )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Document>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">Loading PDF...</div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {!fieldsLocked && (
          <>
            <button
              onClick={addTextField}
              className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-transform"
              title="Add text field"
            >
              <Type className="w-5 h-5" />
            </button>
            <button
              onClick={addSignatureField}
              className="w-12 h-12 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 active:scale-95 transition-transform"
              title="Add signature field"
            >
              <PenTool className="w-5 h-5" />
            </button>
            {selectedField && (
              <button
                onClick={deleteField}
                className="w-12 h-12 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 active:scale-95 transition-transform"
                title="Delete field"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </>
        )}
        <button
          onClick={() => setFieldsLocked(!fieldsLocked)}
          className={`w-12 h-12 ${
            fieldsLocked ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-600 hover:bg-gray-700"
          } text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform`}
          title={fieldsLocked ? "Unlock fields" : "Lock fields"}
        >
          <span className="text-xs font-bold">{fieldsLocked ? "🔒" : "🔓"}</span>
        </button>
      </div>

      {/* Bottom Submit Button */}
      <div className="bg-white border-t border-gray-200 p-4 safe-bottom">
        <button
          onClick={submitForm}
          disabled={submitting || fields.length === 0}
          className="w-full h-12 bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Submit
            </>
          )}
        </button>
      </div>

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Sign Here</h3>
              <button onClick={closeSignaturePad} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="border-2 border-gray-300 rounded-lg bg-gray-50">
                <SignaturePad
                  ref={sigPadRef}
                  canvasProps={{
                    className: "w-full h-48 rounded-lg",
                  }}
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => sigPadRef.current && sigPadRef.current.clear()}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  onClick={saveSignature}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .safe-bottom {
            padding-bottom: calc(env(safe-area-inset-bottom) + 1rem);
          }
        }
        
        /* Prevent all zoom behavior */
        input, textarea, select {
          font-size: 16px !important;
          touch-action: manipulation !important;
        }
        
        * {
          touch-action: pan-x pan-y !important;
        }
        
        body {
          -webkit-text-size-adjust: 100% !important;
          -moz-text-size-adjust: 100% !important;
          -ms-text-size-adjust: 100% !important;
          text-size-adjust: 100% !important;
        }
      `}</style>
    </div>
  );
}
