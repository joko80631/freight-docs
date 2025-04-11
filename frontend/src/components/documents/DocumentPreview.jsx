'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Loader2,
  Download,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { DocumentIcon } from '@/components/icons/DocumentIcon';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const SUPPORTED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const SUPPORTED_PDF_TYPES = ['pdf'];
const SUPPORTED_TEXT_TYPES = ['txt', 'csv', 'json', 'xml', 'html', 'md'];

export default function DocumentPreview({ document, onDownload }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [textContent, setTextContent] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(document.url);
  const [urlExpired, setUrlExpired] = useState(false);

  const fileType = document.file_type.toLowerCase();
  const isPDF = SUPPORTED_PDF_TYPES.includes(fileType);
  const isImage = SUPPORTED_IMAGE_TYPES.includes(fileType);
  const isText = SUPPORTED_TEXT_TYPES.includes(fileType);

  useEffect(() => {
    if (isText) {
      fetchTextContent();
    }
  }, [documentUrl]);

  const fetchTextContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setUrlExpired(false);
      
      const response = await fetch(documentUrl);
      
      if (response.status === 403) {
        setUrlExpired(true);
        throw new Error('Document URL has expired');
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch text content');
      }
      
      const text = await response.text();
      setTextContent(text);
    } catch (error) {
      setError(error.message);
      if (!urlExpired) {
        toast.error('Failed to load text content');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    setUrlExpired(false);
  };

  const handleDocumentLoadError = (error) => {
    // Check if the error is due to URL expiry
    if (error.message && (
      error.message.includes('403') || 
      error.message.includes('Forbidden') ||
      error.message.includes('expired')
    )) {
      setUrlExpired(true);
      setError('Document URL has expired');
    } else {
      setError(error.message);
      toast.error('Failed to load document');
    }
    setIsLoading(false);
  };

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleRetry = async () => {
    setError(null);
    setIsLoading(true);
    
    if (urlExpired) {
      try {
        // Request a fresh URL from the server
        const response = await fetch(`/api/documents/${document.id}/url`);
        if (!response.ok) {
          throw new Error('Failed to refresh document URL');
        }
        
        const data = await response.json();
        setDocumentUrl(data.url);
        
        // Automatically retry loading the content
        if (isText) {
          fetchTextContent();
        }
        // For PDFs and images, the URL update will trigger a reload
      } catch (error) {
        setError('Failed to refresh document URL');
        setIsLoading(false);
        toast.error('Failed to refresh document URL');
      }
    } else if (isText) {
      fetchTextContent();
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-full">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 mb-4">
              <DocumentIcon className="w-full h-full text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 text-center">{document.name}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
        <div className="text-center space-y-2">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-destructive font-medium">Failed to load document</p>
          <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry}>
            {urlExpired ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh URL
              </>
            ) : (
              'Try Again'
            )}
          </Button>
          {onDownload && (
            <Button onClick={onDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Instead
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPDF && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevPage}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {pageNumber} of {numPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={pageNumber >= (numPages || 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Slider
            value={[scale * 100]}
            min={50}
            max={200}
            step={10}
            className="w-24"
            onValueChange={([value]) => setScale(value / 100)}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={scale >= 2.0}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRotate}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex justify-center">
        {isPDF ? (
          <Document
            file={documentUrl}
            onLoadSuccess={handleDocumentLoadSuccess}
            onLoadError={handleDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        ) : isImage ? (
          <img
            src={documentUrl}
            alt={document.name}
            className={cn(
              'max-w-full h-auto',
              'rounded-lg shadow-lg'
            )}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease-in-out'
            }}
            onError={(e) => {
              // Check if the error is due to URL expiry
              if (e.target.naturalWidth === 0 && e.target.naturalHeight === 0) {
                setUrlExpired(true);
                setError('Document URL has expired');
              } else {
                setError('Failed to load image');
              }
              setIsLoading(false);
            }}
          />
        ) : isText ? (
          <div className="w-full max-h-[600px] overflow-auto bg-muted rounded-lg p-4">
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {textContent}
            </pre>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Preview not available for this file type
              </p>
              <Badge variant="secondary">
                {document.file_type.toUpperCase()}
              </Badge>
              {onDownload && (
                <div className="mt-4">
                  <Button onClick={onDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 