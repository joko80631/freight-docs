import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ExternalLink } from 'lucide-react';
import { Document } from '@/types/database';
import Link from 'next/link';

interface LoadDocumentListProps {
  documents: Document[];
}

export function LoadDocumentList({ documents }: LoadDocumentListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Attached Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents attached to this load.</p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{doc.type?.toUpperCase() || 'UNCLASSIFIED'}</Badge>
                      {doc.confidence_score && (
                        <Badge variant="secondary">
                          {Math.round(doc.confidence_score * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/documents/${doc.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 