/**
 * Safely extracts an error message from an unknown error object
 * @param error - The error object of unknown type
 * @returns A string containing the error message or a default message
 */
export function getErrorMessage(error: unknown): string {
  return (error as Error)?.message || 'An unexpected error occurred';
} 