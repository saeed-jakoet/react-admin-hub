"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react";
import { mockTeams, mockStaff, mockRegions } from "@/lib/mock-data";

export default function TeamsPage() {
  const [teams] = React.useState(mockTeams);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">Manage field teams and assignments</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const lead = mockStaff.find((s) => s.id === team.leadId);
          const region = mockRegions.find((r) => r.id === team.regionId);
          const members = mockStaff.filter((s) => team.memberIds.includes(s.id));

          return (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {team.name}
                  </span>
                  <Badge variant={team.availability === "available" ? "default" : "secondary"}>
                    {team.availability}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Team Lead</p>
                  <p className="font-medium">{lead?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Region</p>
                  <p className="font-medium">{region?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Members ({members.length})</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {members.map((member) => (
                      <Badge key={member.id} variant="outline" className="text-xs">
                        {member.name.split(" ")[0]}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
