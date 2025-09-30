"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Upload, Search } from "lucide-react";
import { mockDocuments } from "@/lib/mock-data";

const typeColors = {
  contract: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "site-plan": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  invoice: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  checklist: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  report: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  photo: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

export default function DocumentsPage() {
  const [documents] = React.useState(mockDocuments);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Manage contracts, plans, and reports</p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search documents..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-muted p-3">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{doc.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={typeColors[doc.type]}>
                      {doc.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {(doc.size / 1024 / 1024).toFixed(2)} MB • {doc.uploadedAt.toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {doc.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TODO: Add file preview modal, pagination, filtering by type/tags */}
    </div>
  );
}
