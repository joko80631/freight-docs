import * as React from "react"
import { DocumentUpload } from "@/components/documents/DocumentUpload"
import { Toaster } from "@/components/ui/toaster"

export default function DocumentsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground">
          Upload and manage your freight documents
        </p>
      </div>

      <div className="max-w-xl">
        <DocumentUpload />
      </div>

      <Toaster />
    </div>
  )
} 