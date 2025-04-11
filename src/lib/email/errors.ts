export enum EmailErrorCode {
  INVALID_RECIPIENT = 'INVALID_RECIPIENT',
  INVALID_SENDER = 'INVALID_SENDER',
  INVALID_SUBJECT = 'INVALID_SUBJECT',
  INVALID_CONTENT = 'INVALID_CONTENT',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  TEMPLATE_RENDER_ERROR = 'TEMPLATE_RENDER_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
  DUPLICATE = 'DUPLICATE',
  UNKNOWN = 'UNKNOWN',
}

export class EmailError extends Error {
  constructor(
    public code: EmailErrorCode,
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'EmailError';
  }
} 