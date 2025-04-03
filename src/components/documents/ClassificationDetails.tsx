import React from 'react';
import { Document } from '@/types/document';
import { usePermissions } from '@/hooks/usePermissions';
import { ClassificationSummary } from './ClassificationSummary';
import { ReclassifyForm } from './ReclassifyForm';
import { ClassificationHistory } from './ClassificationHistory';

interface ClassificationDetailsProps {
  document: Document;
  onReclassify: (updatedDoc: Document) => void;
}

export function ClassificationDetails({
  document,
  onReclassify,
}: ClassificationDetailsProps) {
  const { canReclassify } = usePermissions();

  return (
    <div className="space-y-6">
      <ClassificationSummary document={document} />
      
      {canReclassify && (
        <ReclassifyForm document={document} onReclassify={onReclassify} />
      )}
      
      <ClassificationHistory history={document.classification_history} />
    </div>
  );
} 