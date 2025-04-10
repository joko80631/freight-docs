import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TeamErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function TeamErrorFallback({ error, resetErrorBoundary }: TeamErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Team Error</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm text-muted-foreground">
            {error?.message || "An error occurred while loading the team"}
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