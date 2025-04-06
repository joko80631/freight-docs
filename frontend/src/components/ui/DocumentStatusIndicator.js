import React from 'react';
import { statusColors } from '@/lib/theme';

const DOCUMENT_TYPES = {
  BOL: 'Bill of Lading',
  POD: 'Proof of Delivery',
  INVOICE: 'Invoice'
};

const STATUS_CONFIG = {
  complete: {
    label: 'Complete',
    ...statusColors.success,
  },
  partial: {
    label: 'Partial',
    ...statusColors.warning,
  },
  incomplete: {
    label: 'Incomplete',
    ...statusColors.error,
  },
};

/**
 * DocumentStatusIndicator component that shows the status of required documents for a load
 * @param {Object} props - Component props
 * @param {Array} props.documents - Array of documents associated with the load
 * @param {boolean} props.showDetails - Whether to show detailed missing documents
 * @returns {JSX.Element} Document status indicator component
 */
export const DocumentStatusIndicator = ({ status, showLabel = true }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.incomplete;

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${config.bg} ${config.text} ${config.border}`}>
      {showLabel && <span className="text-sm font-medium">{config.label}</span>}
    </div>
  );
};

export const DocumentProgressBar = ({ status, progress }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.incomplete;

  return (
    <div className="w-full">
      <div className="w-full bg-highlight rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${config.bg}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default DocumentStatusIndicator; 