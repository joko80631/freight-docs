import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function FallbackError({ error, resetErrorBoundary }) {
  return (
    <div className="flex h-[50vh] items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm text-muted-foreground">
            {error?.message || "An unexpected error occurred"}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={resetErrorBoundary}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
} 