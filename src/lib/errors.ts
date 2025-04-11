import { EmailError } from './email/errors';

export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'DATABASE_ERROR'
  | 'EMAIL_ERROR'
  | 'FILE_ERROR'
  | 'UNKNOWN_ERROR';

export interface AppError extends Error {
  code: ErrorCode;
  details?: unknown;
  statusCode?: number;
}

export class ApplicationError extends Error implements AppError {
  constructor(
    message: string,
    public code: ErrorCode,
    public details?: unknown,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApplicationError) {
    return error.message;
  }
  
  if (error instanceof EmailError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    if ('message' in error) {
      return String(error.message);
    }
    if ('error' in error) {
      return String(error.error);
    }
  }
  
  return 'An unexpected error occurred';
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof ApplicationError || 
         (error instanceof Error && 'code' in error);
}

export function createError(
  message: string,
  code: ErrorCode,
  details?: unknown,
  statusCode?: number
): AppError {
  return new ApplicationError(message, code, details, statusCode);
} 