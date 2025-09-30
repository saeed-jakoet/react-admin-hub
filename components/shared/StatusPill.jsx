import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  planned: { label: "Planned", className: "bg-status-planned/10 text-status-planned border-status-planned/20" },
  "in-progress": { label: "In Progress", className: "bg-status-in-progress/10 text-status-in-progress border-status-in-progress/20" },
  blocked: { label: "Blocked", className: "bg-status-blocked/10 text-status-blocked border-status-blocked/20" },
  completed: { label: "Completed", className: "bg-status-completed/10 text-status-completed border-status-completed/20" },
  open: { label: "Open", className: "bg-status-open/10 text-status-open border-status-open/20" },
  resolved: { label: "Resolved", className: "bg-status-resolved/10 text-status-resolved border-status-resolved/20" },
};

export function StatusPill({ status, className }) {
  const config = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <Badge variant="outline" className={cn("font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
