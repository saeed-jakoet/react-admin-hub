import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/StatusPill";
import { MapPin, Calendar, DollarSign, Users, Paperclip, Package } from "lucide-react";
import { getProjectById } from "@/lib/repositories/projects";

export default async function ProjectDetailPage({ params }) {
  const project = await getProjectById(params.id);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground">{project.client?.name}</p>
        </div>
        <div className="flex gap-2">
          <StatusPill status={project.status} />
          <Button>Edit Project</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{project.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="font-medium">{project.deadline.toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-medium">${project.budget.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assigned Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.assignedTeams && project.assignedTeams.length > 0 ? (
              <div className="space-y-2">
                {project.assignedTeams.map((team) => (
                  <div key={team.id} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="font-medium">{team.name}</span>
                    <Badge variant="outline">{team.availability}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">No teams assigned</p>
            )}
            <Button variant="outline" className="mt-4 w-full">
              Assign Team
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: List materials with quantities and costs */}
            <p className="text-center text-sm text-muted-foreground">No materials logged yet</p>
            <Button variant="outline" className="mt-4 w-full">
              Add Material
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Attachments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: File upload + preview */}
          <p className="text-center text-sm text-muted-foreground">No attachments yet</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Map View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              {/* TODO: Mapbox with project location pin */}
              Map will show: {project.address}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
