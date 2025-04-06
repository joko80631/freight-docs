# Background Processing System

This directory contains the implementation of the background processing system for handling asynchronous tasks, specifically email sending.

## Components

### 1. Queue Abstraction

The queue system provides a generic interface for handling asynchronous tasks:

- `QueueProvider`: Interface defining the contract for queue implementations
- `QueueMessage`: Type definition for messages in the queue
- `QueueMessageStatus`: Enum for tracking message status

### 2. Supabase Implementation

The Supabase implementation (`SupabaseQueueProvider`) provides:

- Persistent storage of queued messages
- Atomic message dequeuing with locking
- Automatic cleanup of expired locks
- Retry mechanism for failed messages

### 3. Edge Function Processor

The Edge Function (`process-email-queue`) handles:

- Processing queued email messages
- Sending emails via Resend
- Updating message status
- Error handling and retries

## Database Schema

The email queue table (`email_queue`) includes:

- Message metadata (id, type, status)
- Payload data
- Attempt tracking
- Timestamps
- Error information
- Lock management

## Usage

1. Initialize the queue provider:

```typescript
import { SupabaseQueueProvider } from './providers/supabase-queue';

const queueProvider = new SupabaseQueueProvider(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

2. Enqueue an email:

```typescript
const message = await queueProvider.enqueue({
  type: 'email',
  payload: {
    to: 'user@example.com',
    subject: 'Hello',
    content: '<p>Hello World</p>',
  },
  maxAttempts: 3,
});
```

3. The Edge Function will automatically process the queue.

## Deployment

1. Set up environment variables in `.env`:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   RESEND_API_KEY=your_resend_api_key
   SUPABASE_PROJECT_ID=your_project_id
   ```

2. Run the deployment script:
   ```bash
   ./supabase/functions/deploy.sh
   ```

## Monitoring

The system provides several ways to monitor the queue:

1. Check message status:
   ```typescript
   const failedMessages = await queueProvider.getMessagesByStatus(QueueMessageStatus.FAILED);
   ```

2. View specific message:
   ```typescript
   const message = await queueProvider.getMessage(messageId);
   ```

## Error Handling

The system includes:

- Automatic retries for failed messages
- Maximum attempt limits
- Error details storage
- Dead letter queue support (optional)

## Best Practices

1. Always set appropriate `maxAttempts` for messages
2. Monitor failed messages regularly
3. Implement proper error handling in the Edge Function
4. Use appropriate visibility timeout for your use case
5. Consider implementing a dead letter queue for failed messages 