"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/shared/StatusPill";
import { Plus, AlertCircle } from "lucide-react";
import { mockFaults } from "@/lib/mock-data";

const priorityColors = {
  low: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  high: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  critical: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

export default function MaintenancePage() {
  const [faults] = React.useState(mockFaults);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance & Faults</h1>
          <p className="text-muted-foreground">Track and resolve network issues</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Report Fault
        </Button>
      </div>

      <div className="grid gap-4">
        {faults.map((fault) => (
          <Card key={fault.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-1" />
                  <div>
                    <CardTitle className="text-xl">{fault.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{fault.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={priorityColors[fault.priority]}>
                    {fault.priority}
                  </Badge>
                  <StatusPill status={fault.status} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reported By</p>
                  <p className="font-medium">{fault.reportedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{fault.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reported</p>
                  <p className="font-medium">{fault.reportedAt.toLocaleString()}</p>
                </div>
                {fault.slaDeadline && (
                  <div>
                    <p className="text-sm text-muted-foreground">SLA Deadline</p>
                    <p className="font-medium">{fault.slaDeadline.toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm">Assign Team</Button>
                <Button size="sm" variant="outline">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
