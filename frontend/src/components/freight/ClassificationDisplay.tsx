'use client';

import { cn } from '@/lib/utils';
import { FreightBadge } from './FreightBadge';
import { FileText, FileCheck, FileWarning, FileX } from 'lucide-react';
import { getConfidenceVariant, getConfidenceLabel } from '@/lib/classification';

export interface ClassificationDisplayProps {
  documentType: string;
  confidence: number;
  reason?: string;
  className?: string;
}

const documentIcons = {
  default: <FileText className="h-4 w-4" />,
  success: <FileCheck className="h-4 w-4" />,
  warning: <FileWarning className="h-4 w-4" />,
  error: <FileX className="h-4 w-4" />,
};

export function ClassificationDisplay({
  documentType,
  confidence,
  reason,
  className,
}: ClassificationDisplayProps) {
  const variant = getConfidenceVariant(confidence);

  return (
    <div className={cn('flex items-start gap-3', className)} data-testid="classification-display">
      <div className="mt-1 text-gray-600" data-testid="classification-display-icon">
        {documentIcons[variant]}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900" data-testid="classification-display-type">
            {documentType}
          </span>
          <FreightBadge variant="confidence" confidence={confidence}>
            {getConfidenceLabel(confidence)}
          </FreightBadge>
        </div>
        {reason && (
          <p className="text-sm text-gray-500 line-clamp-2" data-testid="classification-display-reason">
            {reason}
          </p>
        )}
      </div>
    </div>
  );
}

ClassificationDisplay.displayName = 'ClassificationDisplay'; 