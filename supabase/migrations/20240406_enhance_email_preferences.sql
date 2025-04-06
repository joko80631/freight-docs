-- Create enum for notification categories
CREATE TYPE notification_category AS ENUM (
  'account',
  'documents',
  'team',
  'loads',
  'system',
  'marketing'
);

-- Create enum for notification types
CREATE TYPE notification_type AS ENUM (
  'account_updates',
  'password_changes',
  'security_alerts',
  'document_uploads',
  'document_updates',
  'document_deletions',
  'document_classifications',
  'missing_documents',
  'team_invites',
  'team_role_changes',
  'team_member_changes',
  'load_created',
  'load_updated',
  'load_status_changed',
  'load_completed',
  'system_maintenance',
  'system_updates',
  'marketing_newsletter',
  'marketing_promotions'
);

-- Create enum for notification frequency
CREATE TYPE notification_frequency AS ENUM (
  'immediate',
  'daily',
  'weekly',
  'never'
);

-- Create table for notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category notification_category NOT NULL,
  type notification_type NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  frequency notification_frequency NOT NULL DEFAULT 'immediate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Create index for faster lookups
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_category ON notification_preferences(category);
CREATE INDEX idx_notification_preferences_type ON notification_preferences(type);

-- Create table for notification digests
CREATE TABLE notification_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category notification_category NOT NULL,
  frequency notification_frequency NOT NULL,
  last_sent_at TIMESTAMPTZ,
  next_scheduled_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, category, frequency)
);

-- Create index for faster lookups
CREATE INDEX idx_notification_digests_user_id ON notification_digests(user_id);
CREATE INDEX idx_notification_digests_next_scheduled_at ON notification_digests(next_scheduled_at);

-- Create table for pending notifications
CREATE TABLE pending_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category notification_category NOT NULL,
  type notification_type NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  error JSONB
);

-- Create index for faster lookups
CREATE INDEX idx_pending_notifications_user_id ON pending_notifications(user_id);
CREATE INDEX idx_pending_notifications_category ON pending_notifications(category);
CREATE INDEX idx_pending_notifications_type ON pending_notifications(type);
CREATE INDEX idx_pending_notifications_processed_at ON pending_notifications(processed_at);

-- Create function to get default notification preferences by role
CREATE OR REPLACE FUNCTION get_default_notification_preferences(role TEXT)
RETURNS TABLE (
  category notification_category,
  type notification_type,
  enabled BOOLEAN,
  frequency notification_frequency
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.category,
    t.type,
    CASE 
      WHEN role = 'admin' THEN true
      WHEN role = 'document_manager' AND c.category IN ('documents', 'loads') THEN true
      WHEN role = 'load_manager' AND c.category IN ('loads') THEN true
      WHEN role = 'user' AND c.category IN ('account', 'team') THEN true
      ELSE false
    END AS enabled,
    CASE 
      WHEN c.category IN ('account', 'security_alerts') THEN 'immediate'::notification_frequency
      WHEN c.category = 'marketing' THEN 'weekly'::notification_frequency
      ELSE 'daily'::notification_frequency
    END AS frequency
  FROM 
    (SELECT unnest(enum_range(NULL::notification_category)) AS category) c
  CROSS JOIN
    (SELECT unnest(enum_range(NULL::notification_type)) AS type) t
  WHERE 
    (c.category = 'account' AND t.type IN ('account_updates', 'password_changes', 'security_alerts'))
    OR (c.category = 'documents' AND t.type IN ('document_uploads', 'document_updates', 'document_deletions', 'document_classifications', 'missing_documents'))
    OR (c.category = 'team' AND t.type IN ('team_invites', 'team_role_changes', 'team_member_changes'))
    OR (c.category = 'loads' AND t.type IN ('load_created', 'load_updated', 'load_status_changed', 'load_completed'))
    OR (c.category = 'system' AND t.type IN ('system_maintenance', 'system_updates'))
    OR (c.category = 'marketing' AND t.type IN ('marketing_newsletter', 'marketing_promotions'));
END;
$$ LANGUAGE plpgsql;

-- Create function to initialize notification preferences for a new user
CREATE OR REPLACE FUNCTION initialize_notification_preferences()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  pref RECORD;
BEGIN
  -- Get the user's role (default to 'user' if not specified)
  user_role := COALESCE(NEW.role, 'user');
  
  -- Insert default preferences based on role
  FOR pref IN SELECT * FROM get_default_notification_preferences(user_role)
  DO
    INSERT INTO notification_preferences (user_id, category, type, enabled, frequency)
    VALUES (NEW.id, pref.category, pref.type, pref.enabled, pref.frequency);
  END LOOP;
  
  -- Initialize digest preferences
  INSERT INTO notification_digests (user_id, category, frequency, next_scheduled_at)
  VALUES 
    (NEW.id, 'documents', 'daily', NOW() + INTERVAL '1 day'),
    (NEW.id, 'loads', 'daily', NOW() + INTERVAL '1 day'),
    (NEW.id, 'system', 'weekly', NOW() + INTERVAL '1 week'),
    (NEW.id, 'marketing', 'weekly', NOW() + INTERVAL '1 week');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize notification preferences for new users
DROP TRIGGER IF EXISTS initialize_notification_preferences_trigger ON auth.users;
CREATE TRIGGER initialize_notification_preferences_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_notification_preferences();

-- Create function to check if a notification should be sent based on preferences
CREATE OR REPLACE FUNCTION should_send_notification(
  p_user_id UUID,
  p_category notification_category,
  p_type notification_type
)
RETURNS BOOLEAN AS $$
DECLARE
  v_enabled BOOLEAN;
  v_frequency notification_frequency;
  v_is_critical BOOLEAN;
BEGIN
  -- Check if the notification is enabled
  SELECT enabled, frequency INTO v_enabled, v_frequency
  FROM notification_preferences
  WHERE user_id = p_user_id AND category = p_category AND type = p_type;
  
  -- If no preference found, default to not sending
  IF v_enabled IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- If not enabled, don't send
  IF NOT v_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check if this is a critical notification (always send regardless of frequency)
  v_is_critical := p_type IN ('security_alerts', 'account_updates', 'password_changes');
  
  -- If critical or immediate frequency, send
  IF v_is_critical OR v_frequency = 'immediate' THEN
    RETURN TRUE;
  END IF;
  
  -- For non-immediate frequencies, add to pending notifications
  INSERT INTO pending_notifications (user_id, category, type, data)
  VALUES (p_user_id, p_category, p_type, '{}'::jsonb)
  ON CONFLICT DO NOTHING;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification preferences
CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notification preferences
CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can view their own notification digests
CREATE POLICY "Users can view their own notification digests"
  ON notification_digests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notification digests
CREATE POLICY "Users can update their own notification digests"
  ON notification_digests FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can view their own pending notifications
CREATE POLICY "Users can view their own pending notifications"
  ON pending_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all notification preferences
CREATE POLICY "Service role can manage all notification preferences"
  ON notification_preferences FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Service role can manage all notification digests
CREATE POLICY "Service role can manage all notification digests"
  ON notification_digests FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Service role can manage all pending notifications
CREATE POLICY "Service role can manage all pending notifications"
  ON pending_notifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role'); 