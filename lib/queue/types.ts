import { EmailOptions } from '../email/types';

export enum QueueMessageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying'
}

export interface QueueMessage {
  id: string;
  type: 'email';
  payload: EmailOptions;
  status: QueueMessageStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: Record<string, any>;
}

export interface QueueOptions {
  maxAttempts?: number;
  retryDelay?: number;
  visibilityTimeout?: number;
  deadLetterQueue?: string;
}

export interface QueueProvider {
  enqueue(message: Omit<QueueMessage, 'id' | 'status' | 'attempts' | 'createdAt' | 'updatedAt'>): Promise<QueueMessage>;
  dequeue(options?: QueueOptions): Promise<QueueMessage | null>;
  complete(messageId: string): Promise<void>;
  fail(messageId: string, error: Error): Promise<void>;
  retry(messageId: string): Promise<void>;
  getMessage(messageId: string): Promise<QueueMessage | null>;
  getMessagesByStatus(status: QueueMessageStatus): Promise<QueueMessage[]>;
} 