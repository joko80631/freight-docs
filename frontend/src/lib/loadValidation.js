/**
 * Utility functions for validating load operations
 */

// Define required documents for each status
const REQUIRED_DOCUMENTS = {
  DELIVERED: ['BOL', 'POD', 'INVOICE'],
  IN_TRANSIT: ['BOL'],
  PENDING: [],
  CANCELLED: [],
};

/**
 * Check if a load has all required documents for a specific status
 * @param {Object} load - The load object with documents array
 * @param {string} targetStatus - The status to check requirements for
 * @returns {Object} - Validation result with isValid and missingDocuments
 */
export function validateStatusTransition(load, targetStatus) {
  // If no documents required for this status, it's always valid
  if (!REQUIRED_DOCUMENTS[targetStatus] || REQUIRED_DOCUMENTS[targetStatus].length === 0) {
    return { isValid: true, missingDocuments: [] };
  }

  // Get all documents for this load
  const loadDocuments = load.documents || [];
  
  // Check if all required documents exist and are verified
  const missingDocuments = REQUIRED_DOCUMENTS[targetStatus].filter(docType => {
    const document = loadDocuments.find(doc => doc.type === docType);
    return !document || document.status !== 'verified';
  });

  return {
    isValid: missingDocuments.length === 0,
    missingDocuments,
  };
}

/**
 * Get a human-readable message explaining why a status transition is invalid
 * @param {string[]} missingDocuments - Array of missing document types
 * @returns {string} - Human-readable message
 */
export function getStatusTransitionMessage(missingDocuments) {
  if (missingDocuments.length === 0) {
    return "Status transition is valid";
  }

  const documentLabels = {
    BOL: "Bill of Lading",
    POD: "Proof of Delivery",
    INVOICE: "Invoice",
  };

  const missingLabels = missingDocuments.map(type => documentLabels[type] || type);
  
  if (missingLabels.length === 1) {
    return `Cannot complete load: Missing ${missingLabels[0]}`;
  } else if (missingLabels.length === 2) {
    return `Cannot complete load: Missing ${missingLabels[0]} and ${missingLabels[1]}`;
  } else {
    const lastItem = missingLabels.pop();
    return `Cannot complete load: Missing ${missingLabels.join(', ')}, and ${lastItem}`;
  }
}

/**
 * Calculate the health status of a load based on its documents
 * @param {Object} load - The load object with documents array
 * @returns {Object} - Health status with level and issues
 */
export function calculateLoadHealth(load) {
  const loadDocuments = load.documents || [];
  const requiredTypes = ['BOL', 'POD', 'INVOICE'];
  
  // Count documents by status
  const documentCounts = {
    verified: 0,
    pending: 0,
    missing: 0,
  };
  
  requiredTypes.forEach(type => {
    const document = loadDocuments.find(doc => doc.type === type);
    if (!document) {
      documentCounts.missing++;
    } else if (document.status === 'verified') {
      documentCounts.verified++;
    } else {
      documentCounts.pending++;
    }
  });
  
  // Determine health level
  let healthLevel;
  let issues = [];
  
  if (documentCounts.verified === requiredTypes.length) {
    healthLevel = 'healthy';
  } else if (documentCounts.missing === requiredTypes.length) {
    healthLevel = 'blocked';
    issues.push('No documents uploaded');
  } else if (documentCounts.missing > 0 || documentCounts.pending > 0) {
    healthLevel = 'at-risk';
    
    if (documentCounts.missing > 0) {
      issues.push(`${documentCounts.missing} required document(s) missing`);
    }
    
    if (documentCounts.pending > 0) {
      issues.push(`${documentCounts.pending} document(s) pending verification`);
    }
  } else {
    healthLevel = 'unknown';
  }
  
  return {
    level: healthLevel,
    issues,
    documentCounts,
  };
} 