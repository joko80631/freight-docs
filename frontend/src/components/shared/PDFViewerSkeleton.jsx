import { LoadingSkeleton } from "./LoadingSkeleton";

export function PDFViewerSkeleton({ className = "" }) {
  return (
    <div className={`w-full rounded-lg border bg-card ${className}`}>
      {/* PDF Viewer Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <LoadingSkeleton variant="text" className="w-32" />
          <div className="flex gap-2">
            <LoadingSkeleton variant="button" className="w-8" />
            <LoadingSkeleton variant="button" className="w-8" />
          </div>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="aspect-[3/4] w-full p-4">
        <div className="h-full w-full rounded-md bg-muted">
          <div className="flex h-full items-center justify-center">
            <LoadingSkeleton variant="text" className="w-48" />
          </div>
        </div>
      </div>

      {/* PDF Viewer Footer */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <LoadingSkeleton variant="text" className="w-24" />
          <div className="flex gap-2">
            <LoadingSkeleton variant="button" className="w-8" />
            <LoadingSkeleton variant="button" className="w-8" />
          </div>
        </div>
      </div>
    </div>
  );
} 