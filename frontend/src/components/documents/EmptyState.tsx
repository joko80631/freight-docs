import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadIcon } from 'lucide-react';

interface EmptyStateProps {
  onUpload: () => void;
}

export function EmptyState({ onUpload }: EmptyStateProps) {
  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="py-12 text-center">
        <UploadIcon className="mx-auto h-8 w-8 text-neutral-400" />
        <h3 className="mt-4 text-lg font-medium">No documents yet</h3>
        <p className="mt-2 text-sm text-neutral-500">Upload your first document to get started.</p>
        <div className="mt-6">
          <Button onClick={onUpload}>Upload Document</Button>
        </div>
      </CardContent>
    </Card>
  );
} 