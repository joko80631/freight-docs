import React from 'react';
import { statusColors } from '@/lib/theme';

interface ConfidenceBadgeProps {
  confidence: number;
  showPercentage?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  showPercentage = true,
}) => {
  let status;
  let colors;

  if (confidence >= 0.8) {
    status = 'success';
    colors = statusColors.success;
  } else if (confidence >= 0.5) {
    status = 'warning';
    colors = statusColors.warning;
  } else {
    status = 'error';
    colors = statusColors.error;
  }

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${colors.bg} ${colors.text} ${colors.border}`}>
      {showPercentage && (
        <span className="text-sm font-medium">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </div>
  );
}; 