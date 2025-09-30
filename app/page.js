import { KPIStatCard } from "@/components/shared/KPIStatCard";
import { FolderKanban, UsersRound, Wrench, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  // TODO: Fetch real KPIs from API
  const kpis = [
    { label: "Active Projects", value: 12, icon: FolderKanban, change: 8, trend: "up", status: "good" },
    { label: "Teams in Field", value: 5, icon: UsersRound, change: 0, trend: "stable" },
    { label: "Open Faults", value: 3, icon: Wrench, change: -25, trend: "down", status: "warning" },
    { label: "SLA Breaches", value: 1, icon: AlertTriangle, status: "critical" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground">Welcome back, Alice. Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KPIStatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "Project created", target: "Main Street Fibre Rollout", time: "2 hours ago" },
                { action: "Fault reported", target: "Signal Loss on Main St", time: "1 hour ago" },
                { action: "Team assigned", target: "TechCorp HQ Installation", time: "30 minutes ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.target}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Map Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">
                {/* TODO: Integrate Mapbox/Google Maps with project pins */}
                Map Placeholder - Projects & Teams
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
