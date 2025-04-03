import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ClassificationReasonProps {
  reason: string;
}

export function ClassificationReason({ reason }: ClassificationReasonProps) {
  if (!reason) return null;
  
  return (
    <div className="mt-4 border rounded-md p-4 bg-slate-50">
      <h3 className="text-sm font-medium mb-2">Classification Reason</h3>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{reason}</ReactMarkdown>
      </div>
    </div>
  );
} 