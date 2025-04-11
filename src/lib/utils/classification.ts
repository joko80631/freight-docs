/**
 * Get the variant for a confidence score
 * @param value The confidence score (0-1)
 * @returns The variant to use for the badge
 */
export function getConfidenceVariant(value: number): 'success' | 'warning' | 'error' {
  if (value >= 0.8) return 'success';
  if (value >= 0.6) return 'warning';
  return 'error';
} 