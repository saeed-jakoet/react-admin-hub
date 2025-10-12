"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, MapPin, UserCheck, Activity, Zap } from "lucide-react";
import { mockTeams, mockStaff, mockRegions } from "@/lib/mock-data";

export default function TeamsPage() {
  const [teams] = React.useState(mockTeams);

  return (
    <div className="flex items-center justify-center mt-10">
      <h1 className="text-center mt-50 text-xl">Coming soon...</h1>
    </div>
    // <div className="p-6 space-y-6">
    //   <div className="flex items-center justify-between">
    //     <div>
    //       <h1 className="text-3xl font-bold">Teams</h1>
    //       <p className="text-muted-foreground">Manage field teams and assignments</p>
    //     </div>
    //     <Button>
    //       <Plus className="mr-2 h-4 w-4" />
    //       Create Team
    //     </Button>
    //   </div>

    //   <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    //         {teams.map((team) => {
    //           const lead = mockStaff.find((s) => s.id === team.leadId);
    //           const region = mockRegions.find((r) => r.id === team.regionId);
    //           const members = mockStaff.filter((s) => team.memberIds.includes(s.id));

    //           return (
    //             <Card key={team.id} className="group border border-border rounded-xl hover:bg-muted/30 transition-all duration-300 hover:shadow-lg">
    //               <CardHeader className="pb-4">
    //                 <CardTitle className="flex items-center justify-between">
    //                   <div className="flex items-center gap-3">
    //                     <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center shadow-lg">
    //                       <Users className="h-6 w-6 text-primary" />
    //                     </div>
    //                     <div>
    //                       <h3 className="text-lg font-semibold text-foreground">{team.name}</h3>
    //                       <p className="text-sm text-muted-foreground">{region?.name}</p>
    //                     </div>
    //                   </div>
    //                   <Badge
    //                     variant={team.availability === "available" ? "default" : "secondary"}
    //                     className={team.availability === "available" ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}
    //                   >
    //                     {team.availability}
    //                   </Badge>
    //                 </CardTitle>
    //               </CardHeader>

    //               <CardContent className="space-y-4">
    //                 <div className="grid grid-cols-2 gap-4">
    //                   <div>
    //                     <p className="text-sm text-muted-foreground flex items-center gap-2">
    //                       <UserCheck className="h-4 w-4" />
    //                       Team Lead
    //                     </p>
    //                     <p className="font-medium text-foreground">{lead?.name}</p>
    //                   </div>
    //                   <div>
    //                     <p className="text-sm text-muted-foreground flex items-center gap-2">
    //                       <MapPin className="h-4 w-4" />
    //                       Region
    //                     </p>
    //                     <p className="font-medium text-foreground">{region?.code}</p>
    //                   </div>
    //                 </div>

    //                 <div>
    //                   <p className="text-sm text-muted-foreground mb-2">Members ({members.length})</p>
    //                   <div className="flex flex-wrap gap-1">
    //                     {members.map((member) => (
    //                       <Badge key={member.id} variant="outline" className="text-xs bg-muted/50 hover:bg-muted">
    //                         {member.name.split(" ")[0]}
    //                       </Badge>
    //                     ))}
    //                   </div>
    //                 </div>

    //                 <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
    //                   View Details
    //                 </Button>
    //               </CardContent>
    //             </Card>
    //           );
    //         })}
    //   </div>
    // </div>
  );
}
