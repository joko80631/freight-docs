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
    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`absolute h-full transition-all duration-300 ease-in-out ${
          progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default DocumentStatusIndicator; 