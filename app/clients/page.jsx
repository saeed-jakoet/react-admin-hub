"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, MapPin, FolderKanban, UserPlus } from "lucide-react";
import { mockClients, mockProjects } from "@/lib/mock-data";
import { StatusPill } from "@/components/shared/StatusPill";

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = React.useState(mockClients[0].id);

  const client = mockClients.find((c) => c.id === selectedClient);
  const clientProjects = mockProjects.filter((p) => p.clientId === selectedClient);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage client accounts and projects</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <Tabs value={selectedClient} onValueChange={setSelectedClient} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          {mockClients.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>
              {c.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {mockClients.map((c) => (
          <TabsContent key={c.id} value={c.id} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Client Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="outline">{c.type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">{c.contactName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {c.contactEmail}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {c.contactPhone}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{c.address}</span>
                    </div>
                  </div>
                  {c.slaHours && (
                    <div>
                      <p className="text-sm text-muted-foreground">SLA Response Time</p>
                      <p className="font-medium">{c.slaHours} hours</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5" />
                    Projects ({clientProjects.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clientProjects.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.type}</p>
                        </div>
                        <StatusPill status={p.status} />
                      </div>
                    ))}
                    {clientProjects.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground">No projects yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
