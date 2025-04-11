import { EmailOptions, SendResult } from '../types';

export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<SendResult>;
}

export interface SendResult {
  id: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed';
  error?: string;
} 