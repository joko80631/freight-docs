'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Download, Link, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const getConfidenceColor = (confidence) => {
  if (confidence >= 0.9) return 'bg-green-100 text-green-800';
  if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

export default function DocumentsTable({ documents }) {
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const { toast } = useToast();
  const router = useRouter();

  const handleDocumentClick = (documentId) => {
    router.push(`/documents/${documentId}`);
  };

  const handleDownload = async (document) => {
    try {
      // TODO: Implement download logic
      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (document) => {
    try {
      // TODO: Implement delete logic
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Load</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow
              key={document.id}
              className="cursor-pointer"
              onClick={() => handleDocumentClick(document.id)}
            >
              <TableCell className="font-medium">{document.name}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    getConfidenceColor(document.classification_confidence),
                    "font-medium"
                  )}
                >
                  {document.document_type}
                </Badge>
              </TableCell>
              <TableCell>
                {Math.round(document.classification_confidence * 100)}%
              </TableCell>
              <TableCell>
                {document.load_id ? (
                  <Badge variant="outline">Load #{document.load_id}</Badge>
                ) : (
                  <span className="text-muted-foreground">Not linked</span>
                )}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>{document.file_size}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(document);
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement link to load
                      }}
                    >
                      <Link className="mr-2 h-4 w-4" />
                      Link to Load
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(document);
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 