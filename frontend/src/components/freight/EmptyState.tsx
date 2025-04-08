import React from 'react';
import { LucideIcon } from 'lucide-react';
import { FreightButton } from './FreightButton';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {Icon && (
        <div className="rounded-full bg-gray-100 p-3 mb-4">
          <Icon className="h-6 w-6 text-gray-500" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          <FreightButton onClick={action.onClick}>
            {action.label}
          </FreightButton>
        )}
        {secondaryAction && (
          <FreightButton variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </FreightButton>
        )}
      </div>
    </div>
  );
}; 