import { getEmailRecoveryService } from '@/lib/email/recovery';
import { getEmailMonitoringService, EmailEventType } from '@/lib/email/monitoring';
import { EmailSendError } from '@/lib/email/errors';
import { EmailOptions } from '@/lib/email/types';

describe('Email Recovery System', () => {
  let recoveryService: ReturnType<typeof getEmailRecoveryService>;
  let monitoringService: ReturnType<typeof getEmailMonitoringService>;
  
  beforeEach(() => {
    // Reset the services for each test
    recoveryService = getEmailRecoveryService();
    monitoringService = getEmailMonitoringService();
    
    // Clear any existing retry records
    // This is a bit of a hack since we don't have a public method to clear the queue
    // In a real implementation, we would have a method to reset the service for testing
    (recoveryService as any).retryQueue = [];
  });
  
  describe('addToRetryQueue', () => {
    it('should add a failed email to the retry queue', () => {
      // Create test data
      const emailId = 'test-email-123';
      const options: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        content: 'This is a test email',
      };
      const error = new EmailSendError('Failed to send email');
      
      // Add to retry queue
      const retryRecord = recoveryService.addToRetryQueue(emailId, options, error);
      
      // Verify the retry record was created
      expect(retryRecord).not.toBeNull();
      expect(retryRecord?.originalEmailId).toBe(emailId);
      expect(retryRecord?.recipient).toBe('test@example.com');
      expect(retryRecord?.subject).toBe('Test Email');
      expect(retryRecord?.attempts).toBe(0);
      expect(retryRecord?.error?.code).toBe('SEND_ERROR');
      
      // Verify the retry record was added to the queue
      const records = recoveryService.getRetryRecords();
      expect(records.length).toBe(1);
      expect(records[0].id).toBe(retryRecord?.id);
    });
    
    it('should not add non-retryable errors to the queue', () => {
      // Create test data with a non-retryable error
      const emailId = 'test-email-123';
      const options: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        content: 'This is a test email',
      };
      const error = new Error('Invalid recipient');
      
      // Add to retry queue
      const retryRecord = recoveryService.addToRetryQueue(emailId, options, error);
      
      // Verify no retry record was created
      expect(retryRecord).toBeNull();
      
      // Verify the queue is empty
      const records = recoveryService.getRetryRecords();
      expect(records.length).toBe(0);
    });
  });
  
  describe('getRetryRecords', () => {
    it('should return all retry records', () => {
      // Add multiple retry records
      const emailId1 = 'test-email-1';
      const emailId2 = 'test-email-2';
      const options: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        content: 'This is a test email',
      };
      const error = new EmailSendError('Failed to send email');
      
      recoveryService.addToRetryQueue(emailId1, options, error);
      recoveryService.addToRetryQueue(emailId2, options, error);
      
      // Get all retry records
      const records = recoveryService.getRetryRecords();
      
      // Verify all records were returned
      expect(records.length).toBe(2);
    });
    
    it('should return records for a specific recipient', () => {
      // Add retry records for different recipients
      const emailId1 = 'test-email-1';
      const emailId2 = 'test-email-2';
      const options1: EmailOptions = {
        to: 'test1@example.com',
        subject: 'Test Email 1',
        content: 'This is a test email',
      };
      const options2: EmailOptions = {
        to: 'test2@example.com',
        subject: 'Test Email 2',
        content: 'This is a test email',
      };
      const error = new EmailSendError('Failed to send email');
      
      recoveryService.addToRetryQueue(emailId1, options1, error);
      recoveryService.addToRetryQueue(emailId2, options2, error);
      
      // Get retry records for the first recipient
      const records = recoveryService.getRetryRecordsByRecipient('test1@example.com');
      
      // Verify only records for the specified recipient were returned
      expect(records.length).toBe(1);
      expect(records[0].recipient).toBe('test1@example.com');
    });
  });
  
  describe('retryEmail', () => {
    it('should retry a specific email', async () => {
      // Add a retry record
      const emailId = 'test-email-123';
      const options: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        content: 'This is a test email',
      };
      const error = new EmailSendError('Failed to send email');
      
      const retryRecord = recoveryService.addToRetryQueue(emailId, options, error);
      expect(retryRecord).not.toBeNull();
      
      // Mock the email provider to simulate a successful retry
      // This is a bit of a hack since we don't have a proper way to mock the provider
      // In a real implementation, we would use a proper mocking framework
      const originalGetEmailProvider = (global as any).getEmailProvider;
      (global as any).getEmailProvider = jest.fn().mockReturnValue({
        sendEmail: jest.fn().mockResolvedValue({
          success: true,
          emailId: 'new-email-456',
        }),
      });
      
      // Retry the email
      const result = await recoveryService.retryEmail(retryRecord!.id);
      
      // Verify the retry was successful
      expect(result).toBe(true);
      
      // Verify the retry record was removed from the queue
      const records = recoveryService.getRetryRecords();
      expect(records.length).toBe(0);
      
      // Restore the original provider
      (global as any).getEmailProvider = originalGetEmailProvider;
    });
    
    it('should handle retry failures', async () => {
      // Add a retry record
      const emailId = 'test-email-123';
      const options: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        content: 'This is a test email',
      };
      const error = new EmailSendError('Failed to send email');
      
      const retryRecord = recoveryService.addToRetryQueue(emailId, options, error);
      expect(retryRecord).not.toBeNull();
      
      // Mock the email provider to simulate a failed retry
      const originalGetEmailProvider = (global as any).getEmailProvider;
      (global as any).getEmailProvider = jest.fn().mockReturnValue({
        sendEmail: jest.fn().mockResolvedValue({
          success: false,
          error: {
            code: 'SEND_ERROR',
            message: 'Failed to send email again',
          },
        }),
      });
      
      // Retry the email
      const result = await recoveryService.retryEmail(retryRecord!.id);
      
      // Verify the retry failed
      expect(result).toBe(false);
      
      // Verify the retry record is still in the queue with updated attempt count
      const records = recoveryService.getRetryRecords();
      expect(records.length).toBe(1);
      expect(records[0].attempts).toBe(1);
      
      // Restore the original provider
      (global as any).getEmailProvider = originalGetEmailProvider;
    });
  });
  
  describe('handleBounce', () => {
    it('should handle email bounces', () => {
      // Add a retry record
      const emailId = 'test-email-123';
      const options: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        content: 'This is a test email',
      };
      const error = new EmailSendError('Failed to send email');
      
      recoveryService.addToRetryQueue(emailId, options, error);
      
      // Handle a bounce for the email
      recoveryService.handleBounce(emailId, 'test@example.com', 'Mailbox full');
      
      // Verify the retry record was removed from the queue
      const records = recoveryService.getRetryRecords();
      expect(records.length).toBe(0);
      
      // Verify the bounce was logged
      const events = monitoringService.getEventsByType(EmailEventType.BOUNCED);
      expect(events.length).toBe(1);
      expect(events[0].emailId).toBe(emailId);
      expect(events[0].recipient).toBe('test@example.com');
      expect(events[0].error?.message).toBe('Mailbox full');
    });
  });
}); 