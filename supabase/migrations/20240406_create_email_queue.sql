-- Create enum for message status
CREATE TYPE queue_message_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'retrying'
);

-- Create email queue table
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status queue_message_status NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  error JSONB,
  metadata JSONB,
  locked_until TIMESTAMPTZ,
  locked_by TEXT
);

-- Create index for status and created_at
CREATE INDEX idx_email_queue_status_created_at ON email_queue (status, created_at);

-- Create function to safely dequeue a message
CREATE OR REPLACE FUNCTION dequeue_message(
  p_max_attempts INTEGER DEFAULT 3,
  p_visibility_timeout INTEGER DEFAULT 300
)
RETURNS SETOF email_queue
LANGUAGE plpgsql
AS $$
DECLARE
  v_message_id UUID;
  v_locked_until TIMESTAMPTZ;
BEGIN
  -- Calculate lock expiration time
  v_locked_until := NOW() + (p_visibility_timeout || ' seconds')::INTERVAL;

  -- Find and lock a message that:
  -- 1. Is in pending or retrying status
  -- 2. Has not exceeded max attempts
  -- 3. Is not currently locked or lock has expired
  -- 4. Is ordered by created_at (FIFO)
  UPDATE email_queue
  SET 
    status = 'processing',
    locked_until = v_locked_until,
    locked_by = current_setting('app.current_user_id', TRUE),
    updated_at = NOW()
  WHERE id = (
    SELECT id
    FROM email_queue
    WHERE (status = 'pending' OR status = 'retrying')
      AND attempts < p_max_attempts
      AND (locked_until IS NULL OR locked_until < NOW())
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$;

-- Create function to clean up expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE email_queue
  SET 
    status = CASE 
      WHEN attempts >= max_attempts THEN 'failed'::queue_message_status
      ELSE 'pending'::queue_message_status
    END,
    locked_until = NULL,
    locked_by = NULL,
    updated_at = NOW()
  WHERE status = 'processing'
    AND locked_until < NOW();
END;
$$;

-- Create a cron job to clean up expired locks every minute
SELECT cron.schedule(
  'cleanup-expired-locks',
  '* * * * *',  -- Every minute
  $$
  SELECT cleanup_expired_locks();
  $$
); 