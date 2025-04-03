import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, FileText, Upload, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";

const DOCUMENT_TYPES = {
  BOL: {
    label: 'Bill of Lading',
    required: true,
  },
  POD: {
    label: 'Proof of Delivery',
    required: true,
  },
  INVOICE: {
    label: 'Invoice',
    required: true,
  },
  OTHER: {
    label: 'Other Documents',
    required: false,
  },
};

const STATUS_ICONS = {
  complete: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  pending: <Clock className="h-5 w-5 text-yellow-500" />,
  missing: <AlertCircle className="h-5 w-5 text-red-500" />,
};

const STATUS_LABELS = {
  complete: 'Complete',
  pending: 'Pending Verification',
  missing: 'Missing',
};

export default function DocumentChecklist({ 
  load, 
  onUpload, 
  onView, 
  onReplace,
  className 
}) {
  const getDocumentStatus = (type) => {
    const document = load.documents?.find(doc => doc.type === type);
    if (!document) return 'missing';
    if (document.status === 'verified') return 'complete';
    return 'pending';
  };

  const handleAction = (type, action) => {
    switch (action) {
      case 'upload':
        onUpload?.(type);
        break;
      case 'view':
        onView?.(type);
        break;
      case 'replace':
        onReplace?.(type);
        break;
      default:
        break;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Document Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(DOCUMENT_TYPES).map(([type, { label, required }]) => {
            const status = getDocumentStatus(type);
            const document = load.documents?.find(doc => doc.type === type);

            return (
              <div
                key={type}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {STATUS_ICONS[status]}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{label}</p>
                      {required && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {STATUS_LABELS[status]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {status === 'complete' ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAction(type, 'view')}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAction(type, 'replace')}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Replace
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAction(type, 'upload')}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 