/**
 * Determines the confidence variant based on a confidence percentage value
 * @param value - Confidence percentage (0-100)
 * @returns 'success' | 'warning' | 'error'
 */
export function getConfidenceVariant(value: number): 'success' | 'warning' | 'error' {
  if (value >= 85) return 'success';
  if (value >= 60) return 'warning';
  return 'error';
}

/**
 * Gets the confidence level label based on a confidence percentage value
 * @param value - Confidence percentage (0-100)
 * @returns 'High' | 'Medium' | 'Low'
 */
export function getConfidenceLabel(value: number): 'High' | 'Medium' | 'Low' {
  if (value >= 85) return 'High';
  if (value >= 60) return 'Medium';
  return 'Low';
} 