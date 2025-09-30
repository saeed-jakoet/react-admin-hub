"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Shield, Bell, FileText } from "lucide-react";
import { mockRegions } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage company configuration and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Profile
            </CardTitle>
            <CardDescription>Basic information about your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" defaultValue="Fibre Infrastructure Co." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input id="contact-email" type="email" defaultValue="admin@fibre.co" />
              </div>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Regions
            </CardTitle>
            <CardDescription>Service areas and operational regions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRegions.map((region) => (
                <div key={region.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{region.name}</p>
                    <p className="text-sm text-muted-foreground">Code: {region.code}</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4">Add Region</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles & Permissions
            </CardTitle>
            <CardDescription>Define user roles and access levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["Admin", "Manager", "Field Worker", "Client"].map((role) => (
                <div key={role} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{role}</p>
                    <Badge variant="secondary" className="mt-1">
                      {role === "Admin" ? "Full Access" : role === "Manager" ? "Elevated" : "Limited"}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure alert channels and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {/* TODO: Integrate Twilio for Email/SMS/WhatsApp notifications */}
              Notification channels: Email, SMS, WhatsApp (To be configured)
            </p>
            <Button variant="outline">Configure Alerts</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Data & Compliance
            </CardTitle>
            <CardDescription>Privacy policy and data handling</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Data retention, backup schedules, and compliance documentation will be managed here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
