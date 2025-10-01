import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KPIStatCard({ label, value, icon: Icon, change, trend, status }) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const statusColors = {
    good: "text-green-600",
    warning: "text-amber-600",
    critical: "text-red-600",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className={cn("text-3xl font-bold", status && statusColors[status])}>{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendIcon className="h-3 w-3" />
                <span>{Math.abs(change)}% from last period</span>
              </div>
            )}
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
