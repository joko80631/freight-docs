import * as React from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function DocumentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground">
          Upload and manage your freight documents
        </p>
      </div>

      <div className="max-w-xl">
        <div className="border-2 border-destructive rounded-lg p-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Something went wrong!</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || "An error occurred while loading the documents page."}
          </p>
          <Button
            variant="outline"
            onClick={() => reset()}
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
} 