import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MoreVertical, Download, Link, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';
import { useRouter } from 'next/navigation';
import useDocumentStore from '../../store/documentStore';
import { useToast } from '../ui/use-toast';
import { Checkbox } from '../ui/checkbox';

const getConfidenceColor = (confidence) => {
  if (confidence >= 0.8) return 'bg-green-100 text-green-800';
  if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

export default function DocumentCard({ document, onSelect, isSelected }) {
  const router = useRouter();
  const { deleteDocument, linkToLoad, unlinkFromLoad } = useDocumentStore();
  const { toast } = useToast();

  const handleDocumentClick = (e) => {
    // Don't navigate if clicking on checkbox or dropdown
    if (
      e.target.closest('.checkbox-container') || 
      e.target.closest('.dropdown-container')
    ) {
      return;
    }
    router.push(`/documents/${document.id}`);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(document.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await deleteDocument(document.id);
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const handleLinkToLoad = async (e) => {
    e.stopPropagation();
    // TODO: Implement link to load modal
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onSelect(!isSelected);
  };

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={handleDocumentClick}
    >
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div 
                className="checkbox-container"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleCheckboxChange}
                  aria-label={`Select ${document.name}`}
                />
              </div>
              <h3 className="font-medium leading-none">{document.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="dropdown-container">
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
                    handleDownload(e);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLinkToLoad(e);
                  }}
                >
                  <Link className="mr-2 h-4 w-4" />
                  {document.load_id ? 'Unlink from Load' : 'Link to Load'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(e);
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                getConfidenceColor(document.classification_confidence),
                'font-medium'
              )}
            >
              {document.document_type}
            </Badge>
            <Badge variant="outline">
              {Math.round(document.classification_confidence * 100)}% confidence
            </Badge>
          </div>
          {document.load_id && (
            <Badge variant="outline" className="mt-2">
              Linked to Load #{document.load_id}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {document.file_size} • {document.file_type}
        </div>
      </CardFooter>
    </Card>
  );
} 