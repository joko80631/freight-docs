import * as React from "react"
import { Loader2 } from "lucide-react"

export default function DocumentsLoading() {
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  )
} 