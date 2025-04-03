import { useState } from 'react';
import Image from 'next/image';
import { FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentRendererProps {
  url: string;
  mimeType?: string;
  className?: string;
}

export function DocumentRenderer({ url, mimeType, className }: DocumentRendererProps) {
  const [error, setError] = useState(false);

  // Handle PDF files
  if (mimeType === 'application/pdf') {
    return (
      <iframe
        src={url}
        className={cn('w-full h-[600px] border rounded-lg', className)}
        onError={() => setError(true)}
      />
    );
  }

  // Handle images
  if (mimeType?.startsWith('image/')) {
    return (
      <div className={cn('relative w-full h-[300px]', className)}>
        <Image
          src={url}
          alt="Document preview"
          fill
          className="object-contain"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // Fallback for unsupported types or errors
  if (error || !mimeType) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 border rounded-lg', className)}>
        <FileIcon className="w-12 h-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">Preview not available</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-sm text-blue-500 hover:underline"
        >
          Open file
        </a>
      </div>
    );
  }

  // Default fallback
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 border rounded-lg', className)}>
      <FileIcon className="w-12 h-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-500">Preview not available</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 text-sm text-blue-500 hover:underline"
      >
        Open file
      </a>
    </div>
  );
} 