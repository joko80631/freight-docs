import { createEmailProvider } from '../email/providers/factory';

export async function sendNotification(
  type: 'email',
  options: {
    to: string;
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }>;
  }
) {
  switch (type) {
    case 'email': {
      const emailProvider = createEmailProvider();
      await emailProvider.send(options);
      break;
    }
    default:
      throw new Error(`Unsupported notification type: ${type}`);
  }
} 