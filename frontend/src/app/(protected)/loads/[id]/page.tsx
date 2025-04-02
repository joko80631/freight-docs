'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, MoreVertical, FileText, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToastNotification } from "@/components/shared";
import { Load, formatDate, getRelativeTime, generateMockLoads } from "@/lib/mock/loads";

// Mock data - will be replaced with API call
const mockLoad: Load = generateMockLoads(1)[0];

const STATUS_COLORS = {
  Active: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  "On Hold": "bg-yellow-100 text-yellow-800",
  Cancelled: "bg-gray-100 text-gray-800",
} as const;

const STATUS_VARIANTS = {
  Active: "default",
  Completed: "secondary",
  "On Hold": "outline",
  Cancelled: "destructive",
} as const;

export default function LoadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { showSuccess } = useToastNotification();
  const [load] = useState(mockLoad); // Will be replaced with API call

  const handleStatusChange = (newStatus: Load["status"]) => {
    showSuccess("Status Updated", `Load status changed to ${newStatus}`);
  };

  const handleEdit = () => {
    showSuccess("Coming Soon", "Load editing will be available in the next phase");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/loads")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{load.reference}</h1>
            <p className="text-muted-foreground">{load.clientName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange("Active")}>
                  Mark as Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("On Hold")}>
                  Put On Hold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("Completed")}>
                  Mark as Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("Cancelled")}>
                  Cancel Load
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">{load.origin}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium">{load.destination}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Created {getRelativeTime(load.dateCreated)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Updated {getRelativeTime(load.dateUpdated)}</span>
            </div>
          </div>
          <Badge
            variant={STATUS_VARIANTS[load.status]}
            className={STATUS_COLORS[load.status]}
          >
            {load.status}
          </Badge>
        </div>
      </div>

      {/* Metadata Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Load Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Carrier</span>
                <p className="text-sm">{load.carrier}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Reference Numbers</span>
                <p className="text-sm">
                  BOL: {load.referenceNumbers?.bol}, POD: {load.referenceNumbers?.pod}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Pickup Date</span>
                <p className="text-sm">
                  {load.pickupDate ? formatDate(load.pickupDate) : "Pending"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Delivery Date</span>
                <p className="text-sm">
                  {load.deliveryDate ? formatDate(load.deliveryDate) : "Pending"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Weight</span>
                <p className="text-sm">{load.weight} lbs</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Dimensions</span>
                <p className="text-sm">
                  {load.dimensions?.length}" x {load.dimensions?.width}" x {load.dimensions?.height}"
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Special Instructions</span>
                <p className="text-sm">{load.specialInstructions}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Created By</span>
                <p className="text-sm">{load.createdBy}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Checklist Section */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {load.documents.map((doc) => (
              <div
                key={doc.type}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {doc.status === "complete" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : doc.status === "missing" ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">{doc.type}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {doc.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === "complete" ? (
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: "creation",
                description: "Load created",
                timestamp: load.dateCreated,
                user: load.createdBy,
              },
              {
                type: "document",
                description: "Bill of Lading uploaded",
                timestamp: new Date(load.dateCreated.getTime() + 30 * 60 * 1000),
                user: "Jane Smith",
              },
              {
                type: "status",
                description: "Status changed to Active",
                timestamp: new Date(load.dateCreated.getTime() + 60 * 60 * 1000),
                user: load.createdBy,
              },
            ].map((activity, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  {index < 2 && (
                    <div className="w-0.5 h-full bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {getRelativeTime(activity.timestamp)} by {activity.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 