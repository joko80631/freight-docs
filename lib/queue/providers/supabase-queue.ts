import { createClient } from '@supabase/supabase-js';
import { QueueMessage, QueueMessageStatus, QueueOptions, QueueProvider } from '../types';

export class SupabaseQueueProvider implements QueueProvider {
  private client;
  private readonly tableName = 'email_queue';

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async enqueue(message: Omit<QueueMessage, 'id' | 'status' | 'attempts' | 'createdAt' | 'updatedAt'>): Promise<QueueMessage> {
    const { data, error } = await this.client
      .from(this.tableName)
      .insert({
        ...message,
        status: QueueMessageStatus.PENDING,
        attempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformMessage(data);
  }

  async dequeue(options: QueueOptions = {}): Promise<QueueMessage | null> {
    const { maxAttempts = 3, visibilityTimeout = 300 } = options;

    // Start a transaction to safely dequeue a message
    const { data, error } = await this.client.rpc('dequeue_message', {
      p_max_attempts: maxAttempts,
      p_visibility_timeout: visibilityTimeout,
    });

    if (error) throw error;
    if (!data) return null;

    return this.transformMessage(data);
  }

  async complete(messageId: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .update({
        status: QueueMessageStatus.COMPLETED,
        processedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', messageId);

    if (error) throw error;
  }

  async fail(messageId: string, error: Error): Promise<void> {
    const { error: updateError } = await this.client
      .from(this.tableName)
      .update({
        status: QueueMessageStatus.FAILED,
        error: {
          code: error.name,
          message: error.message,
          details: error,
        },
        updatedAt: new Date().toISOString(),
      })
      .eq('id', messageId);

    if (updateError) throw updateError;
  }

  async retry(messageId: string): Promise<void> {
    // First get the current message to increment attempts
    const { data: message, error: fetchError } = await this.client
      .from(this.tableName)
      .select('attempts')
      .eq('id', messageId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await this.client
      .from(this.tableName)
      .update({
        status: QueueMessageStatus.RETRYING,
        attempts: (message.attempts || 0) + 1,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', messageId);

    if (error) throw error;
  }

  async getMessage(messageId: string): Promise<QueueMessage | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select()
      .eq('id', messageId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return this.transformMessage(data);
  }

  async getMessagesByStatus(status: QueueMessageStatus): Promise<QueueMessage[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select()
      .eq('status', status);

    if (error) throw error;
    return data.map(this.transformMessage);
  }

  private transformMessage(data: any): QueueMessage {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      processedAt: data.processedAt ? new Date(data.processedAt) : undefined,
    };
  }
} 