'use client';

import { memo } from 'react';

const DOCUMENT_TYPES = {
  BOL: 'Bill of Lading',
  POD: 'Proof of Delivery',
  INVOICE: 'Invoice'
};

const STATUS_COLORS = {
  complete: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  incomplete: 'bg-red-100 text-red-800'
};

const STATUS_ICONS = {
  complete: '✅',
  partial: '🟡',
  incomplete: '🔴'
};

const STATUS_DESCRIPTIONS = {
  complete: 'All required documents are present and completed',
  partial: 'Some documents are present but not all',
  incomplete: 'No documents or all documents are incomplete'
};

/**
 * DocumentStatusIndicator component that shows the status of required documents for a load
 * @param {Object} props - Component props
 * @param {Array} props.documents - Array of documents associated with the load
 * @param {boolean} props.showDetails - Whether to show detailed missing documents
 * @returns {JSX.Element} Document status indicator component
 */
const DocumentStatusIndicator = memo(({ documents = [], showDetails = true }) => {
  // Calculate document status:
  // - Complete: All required documents are present and completed
  // - Partial: Some documents are present but not all
  // - Incomplete: No documents or all documents are incomplete
  const requiredDocs = Object.keys(DOCUMENT_TYPES);
  const completedDocs = documents.filter(doc => doc.status === 'completed');
  const missingDocs = requiredDocs.filter(type => 
    !completedDocs.some(doc => doc.type === type)
  );

  const completionPercentage = (completedDocs.length / requiredDocs.length) * 100;
  
  let status;
  if (completionPercentage === 100) {
    status = 'complete';
  } else if (completionPercentage > 0) {
    status = 'partial';
  } else {
    status = 'incomplete';
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 group relative">
        <span className={STATUS_ICONS[status]} />
        <span 
          className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}
          title={STATUS_DESCRIPTIONS[status]}
        >
          {completedDocs.length}/{requiredDocs.length} Documents
        </span>
      </div>
      
      {showDetails && missingDocs.length > 0 && (
        <div className="text-xs text-gray-600">
          Missing: {missingDocs.map(type => DOCUMENT_TYPES[type]).join(', ')}
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            status === 'complete' ? 'bg-green-500' :
            status === 'partial' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
});

DocumentStatusIndicator.displayName = 'DocumentStatusIndicator';

export default DocumentStatusIndicator; 