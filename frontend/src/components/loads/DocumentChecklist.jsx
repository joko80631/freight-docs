import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, FileText, Upload, RefreshCw } from 'lucide-react';

const DOCUMENT_STATUS = {
  COMPLETE: 'complete',
  PENDING: 'pending',
  MISSING: 'missing'
};

const STATUS_CONFIG = {
  [DOCUMENT_STATUS.COMPLETE]: {
    icon: CheckCircle2,
    color: 'text-green-500',
    label: 'Complete'
  },
  [DOCUMENT_STATUS.PENDING]: {
    icon: Clock,
    color: 'text-yellow-500',
    label: 'Pending'
  },
  [DOCUMENT_STATUS.MISSING]: {
    icon: AlertCircle,
    color: 'text-red-500',
    label: 'Missing'
  }
};

export default function DocumentChecklist({ 
  documents = [], 
  onViewDocument, 
  onUploadDocument, 
  onReplaceDocument 
}) {
  const getDocumentStatus = (doc) => {
    if (!doc) return DOCUMENT_STATUS.MISSING;
    if (doc.verified) return DOCUMENT_STATUS.COMPLETE;
    return DOCUMENT_STATUS.PENDING;
  };

  const renderDocumentAction = (doc, status) => {
    switch (status) {
      case DOCUMENT_STATUS.COMPLETE:
        return (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDocument(doc)}
            >
              <FileText className="mr-2 h-4 w-4" />
              View
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onReplaceDocument(doc)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Replace
            </Button>
          </div>
        );
      case DOCUMENT_STATUS.PENDING:
        return (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDocument(doc)}
          >
            <FileText className="mr-2 h-4 w-4" />
            View
          </Button>
        );
      case DOCUMENT_STATUS.MISSING:
        return (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onUploadDocument(doc?.type)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => {
            const status = getDocumentStatus(doc);
            const StatusIcon = STATUS_CONFIG[status].icon;
            
            return (
              <div
                key={doc?.type || 'missing'}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <StatusIcon className={`h-5 w-5 ${STATUS_CONFIG[status].color}`} />
                  <div>
                    <p className="font-medium">{doc?.type || 'Document'}</p>
                    <p className="text-sm text-muted-foreground">
                      {STATUS_CONFIG[status].label}
                    </p>
                  </div>
                </div>
                {renderDocumentAction(doc, status)}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 