'use client';

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertFooter,
} from "@/components/ui/alert";

export function FallbackError({ error, resetErrorBoundary }) {
  return (
    <div className="flex h-[50vh] items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <div className="font-semibold">Something went wrong</div>
        <AlertDescription>
          <p className="text-sm text-muted-foreground">
            {error?.message || "An unexpected error occurred"}
          </p>
        </AlertDescription>
        <AlertFooter>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={resetErrorBoundary}
          >
            Try again
          </Button>
        </AlertFooter>
      </Alert>
    </div>
  );
} 