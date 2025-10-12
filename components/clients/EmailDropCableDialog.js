"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Eye, Send, X, AlertCircle } from "lucide-react";
import { post } from "@/lib/api/fetcher";
import { useToast } from "@/components/shared/Toast";
import { getDropCableEmailHtml } from "@/lib/email/dropCableTemplate";

export function EmailDropCableDialog({ open, onOpenChange, clientData }) {
  const { success } = useToast();
  const [formData, setFormData] = useState({
    to: "",
    dropTeamDetails: "",
    proposedDate: "",
    proposedTime: "",
  });
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState("");

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        to: "",
        dropTeamDetails: "",
        proposedDate: "",
        proposedTime: "",
      });
      setShowPreview(false);
      setError("");
    }
  }, [open, clientData]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handlePreview = () => {
    if (
      !formData.to ||
      !formData.dropTeamDetails ||
      !formData.proposedDate ||
      !formData.proposedTime
    ) {
      setError("Please fill in all required fields");
      return;
    }
    setLoadingPreview(true);
    try {
      // Use local template generator
      const html = getDropCableEmailHtml({
        proposedDate: formData.proposedDate,
        proposedTime: formData.proposedTime,
        dropTeamDetails: formData.dropTeamDetails,
      });
      setPreviewHtml(html);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating preview:", error);
      setError("Failed to generate email preview. Please try again.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSendEmail = async () => {
    if (
      !formData.to ||
      !formData.dropTeamDetails ||
      !formData.proposedDate ||
      !formData.proposedTime
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setSending(true);
    setError("");
    try {
      // Generate the HTML using the local template
      const html = getDropCableEmailHtml({
        proposedDate: formData.proposedDate,
        proposedTime: formData.proposedTime,
        dropTeamDetails: formData.dropTeamDetails,
      });
      const payload = {
        to: formData.to,
        html,
        subject: "Drop Cable Access Request",
      };
      const response = await post(
        "/drop-cable/email/drop-cable-access",
        payload
      );
      if (response.status === "success") {
        success("Success", "Email sent successfully!");
        onOpenChange(false);
      } else {
        setError(
          "Failed to send email: " + (response.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setError(
        "Failed to send email. Please check your connection and try again."
      );
    } finally {
      setSending(false);
    }
  };

  if (showPreview) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-blue-600" />
              Email Preview
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Email Details Summary */}
            <div className="bg-slate-50 dark:bg-slate-800 border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    To:
                  </span>
                  <span className="ml-2 text-slate-900 dark:text-white">
                    {formData.to}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    Subject:
                  </span>
                  <span className="ml-2 text-slate-900 dark:text-white">
                    Drop Cable Access Request
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    Team Details:
                  </span>
                  <span className="ml-2 text-slate-900 dark:text-white">
                    {formData.dropTeamDetails}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Preview */}
            <div className="border rounded-lg overflow-hidden bg-white">
              <div
                className="min-h-[400px]"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Back to Edit
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {sending ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-blue-600" />
            Send Drop Cable Access Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <Label
              htmlFor="to"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Client Email *
            </Label>
            <Input
              id="to"
              name="to"
              type="email"
              placeholder="client@example.com"
              value={formData.to}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label
              htmlFor="proposedDate"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Proposed Date *
            </Label>
            <Input
              id="proposedDate"
              name="proposedDate"
              type="date"
              value={formData.proposedDate}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label
              htmlFor="proposedTime"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Proposed Time *
            </Label>
            <Input
              id="proposedTime"
              name="proposedTime"
              type="time"
              value={formData.proposedTime}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label
              htmlFor="dropTeamDetails"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Drop Team Details *
            </Label>
            <Textarea
              id="dropTeamDetails"
              name="dropTeamDetails"
              placeholder="e.g., Team A: John Doe, Jane Smith"
              value={formData.dropTeamDetails}
              onChange={handleInputChange}
              rows={3}
              required
              className="mt-1"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Provide details about the team members who will be performing the
              installation.
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={
                !formData.to || !formData.dropTeamDetails || loadingPreview
              }
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {loadingPreview ? "Loading..." : "Preview Email"}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={sending || !formData.to || !formData.dropTeamDetails}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
