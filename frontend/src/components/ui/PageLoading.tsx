import React from 'react';
import { Loader2 } from 'lucide-react';

export function PageLoading() {
  return (
    <div className="flex justify-center items-center h-[calc(100vh-200px)]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
} 