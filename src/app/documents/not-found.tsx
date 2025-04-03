import * as React from "react"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"
import Link from "next/link"

export default function DocumentsNotFound() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground">
          Upload and manage your freight documents
        </p>
      </div>

      <div className="max-w-xl">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <FileQuestion className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Document Not Found</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The document you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button
            variant="outline"
            asChild
          >
            <Link href="/documents">
              Back to Documents
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 