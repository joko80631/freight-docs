import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LoadErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function LoadErrorFallback({ error, resetErrorBoundary }: LoadErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Load Error</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm text-muted-foreground">
            {error?.message || "An error occurred while loading the load"}
          </p>
        </AlertDescription>
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={resetErrorBoundary}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </Alert>
    </div>
  );
} 