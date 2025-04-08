'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FileIcon, FileTextIcon, FileText, Download, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatFileSize, formatRelativeTime } from '@/lib/utils';
import { Document } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

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
  
  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="font-medium truncate max-w-[200px]" title={document.name}>
              {document.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileIcon className="h-4 w-4" />
              <span>{formatFileSize(document.size)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
        </p>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(document.id)}
            aria-label={`View details for ${document.name}`}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 