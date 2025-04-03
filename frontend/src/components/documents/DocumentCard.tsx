import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FileIcon, FileTextIcon } from 'lucide-react';
import Image from 'next/image';
import { formatFileSize, formatRelativeTime } from '@/lib/utils';
import { Document } from '@/types/document';

export interface DocumentCardProps {
  document: Document;
  onViewDetails: (id: string) => void;
}

export function DocumentCard({ document, onViewDetails }: DocumentCardProps) {
  const supabase = createClientComponentClient();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchThumbnail = async () => {
      if (!document.storage_path) return;
      
      try {
        const { data, error } = await supabase
          .storage
          .from('documents')
          .createSignedUrl(document.storage_path, 3600); // 1 hour expiry for thumbnail
          
        if (!error && data) {
          setThumbnailUrl(data.signedUrl);
        }
      } catch (error) {
        console.error('Error fetching thumbnail:', error);
      }
    };
    
    fetchThumbnail();
  }, [document.storage_path, supabase]);
  
  const confidencePercent = Math.round((document.confidence_score || 0) * 100);
  const confidenceColor = confidencePercent >= 85 
    ? 'text-green-500 bg-green-100' 
    : confidencePercent >= 60 
      ? 'text-yellow-500 bg-yellow-100' 
      : 'text-red-500 bg-red-100';
  
  return (
    <div 
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" 
      onClick={() => onViewDetails(document.id)}
    >
      <div className="aspect-[4/3] relative bg-slate-100">
        {thumbnailUrl ? (
          document.name.toLowerCase().endsWith('.pdf') ? (
            <div className="flex items-center justify-center h-full">
              <FileTextIcon className="h-12 w-12 text-slate-300" />
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">PDF</div>
            </div>
          ) : (
            <div className="relative h-full w-full">
              <Image 
                src={thumbnailUrl}
                alt={document.name}
                fill
                className="object-cover"
              />
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <FileIcon className="h-12 w-12 text-slate-300" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm truncate" title={document.name}>
          {document.name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100">
            {document.type?.toUpperCase() || 'UNCLASSIFIED'}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${confidenceColor}`}>
            {confidencePercent}%
          </span>
        </div>
        {document.loads && (
          <div className="mt-2 text-xs text-slate-500">
            Linked to: {document.loads.reference_number}
          </div>
        )}
        <div className="mt-2 text-xs text-slate-500">
          {formatRelativeTime(document.uploaded_at)}
        </div>
      </div>
    </div>
  );
} 