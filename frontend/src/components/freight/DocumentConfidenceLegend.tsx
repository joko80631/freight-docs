'use client';

import { FreightCard } from './FreightCard';
import { FreightBadge } from './FreightBadge';

export function DocumentConfidenceLegend() {
  return (
    <FreightCard variant="subtle">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Classification Confidence</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <FreightBadge variant="confidence" confidence={95}>
              High
            </FreightBadge>
            <p className="text-sm text-gray-700">
              Very reliable classification (85%+ confidence)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <FreightBadge variant="confidence" confidence={75}>
              Medium
            </FreightBadge>
            <p className="text-sm text-gray-700">
              Good classification (60-85% confidence)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <FreightBadge variant="confidence" confidence={45}>
              Low
            </FreightBadge>
            <p className="text-sm text-gray-700">
              Uncertain classification (&lt;60% confidence)
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Our AI analyzes document content and structure to determine document type and confidence level.
          Higher confidence indicates more reliable classification.
        </p>
      </div>
    </FreightCard>
  );
} 