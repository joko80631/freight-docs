import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Grid, List, Download, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getStatusColor = (status) => {
  switch (status) {
    case 'classified':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getConfidenceColor = (score) => {
  if (score >= 0.9) return 'text-green-500';
  if (score >= 0.7) return 'text-yellow-500';
  return 'text-red-500';
};

const DocumentView = ({ documents, onView, onDownload, onDelete }) => {
  const [viewMode, setViewMode] = useState('grid');

  if (!documents?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No documents found
      </div>
    );
  }

  const renderGridItem = (doc) => (
    <Card key={doc.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
          <div className="text-4xl">📄</div>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium truncate">{doc.name}</h3>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{doc.type}</span>
            <Badge className={getStatusColor(doc.status)}>
              {doc.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {format(new Date(doc.created_at), 'MMM d, yyyy')}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(doc)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(doc)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(doc)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderListItem = (doc) => (
    <Card key={doc.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">📄</div>
            <div>
              <h3 className="font-medium">{doc.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{doc.type}</span>
                <span>•</span>
                <span>{format(new Date(doc.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={getStatusColor(doc.status)}>
              {doc.status}
            </Badge>
            {doc.confidence_score && (
              <span className={`text-sm ${getConfidenceColor(doc.confidence_score)}`}>
                {Math.round(doc.confidence_score * 100)}% confidence
              </span>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(doc)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(doc)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(doc)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map(renderGridItem)}
        </div>
      ) : (
        <div>
          {documents.map(renderListItem)}
        </div>
      )}
    </div>
  );
};

export default DocumentView; 