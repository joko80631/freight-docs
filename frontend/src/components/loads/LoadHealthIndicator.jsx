import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { calculateLoadHealth } from '@/lib/loadValidation';

const HEALTH_VARIANTS = {
  healthy: 'success',
  'at-risk': 'warning',
  blocked: 'destructive',
  unknown: 'secondary',
};

const HEALTH_LABELS = {
  healthy: 'Healthy',
  'at-risk': 'At Risk',
  blocked: 'Blocked',
  unknown: 'Unknown',
};

const HEALTH_ICONS = {
  healthy: '🟢',
  'at-risk': '🟡',
  blocked: '🔴',
  unknown: '⚪',
};

export default function LoadHealthIndicator({ 
  load, 
  className,
  showLabel = true,
  showTooltip = true,
}) {
  const health = calculateLoadHealth(load);
  const variant = HEALTH_VARIANTS[health.level] || 'secondary';
  const label = HEALTH_LABELS[health.level] || 'Unknown';
  const icon = HEALTH_ICONS[health.level] || '⚪';
  
  const content = (
    <Badge 
      variant={variant} 
      className={cn("flex items-center gap-1", className)}
    >
      <span>{icon}</span>
      {showLabel && <span>{label}</span>}
    </Badge>
  );
  
  if (!showTooltip) {
    return content;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">Load Health: {label}</p>
            {health.issues.length > 0 ? (
              <ul className="text-sm list-disc pl-4">
                {health.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">All required documents are present and verified.</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 