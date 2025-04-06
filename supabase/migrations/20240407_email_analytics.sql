-- Create table for email events
CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed')),
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB,
  location_info JSONB
);

-- Create index for faster lookups
CREATE INDEX idx_email_events_email_id ON email_events(email_id);
CREATE INDEX idx_email_events_user_id ON email_events(user_id);
CREATE INDEX idx_email_events_event_type ON email_events(event_type);
CREATE INDEX idx_email_events_created_at ON email_events(created_at);

-- Create table for email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB
);

-- Create index for faster lookups
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_is_active ON email_templates(is_active);

-- Create table for email campaigns
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  subject_line TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB
);

-- Create index for faster lookups
CREATE INDEX idx_email_campaigns_template_id ON email_campaigns(template_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled_at ON email_campaigns(scheduled_at);

-- Create table for email recipients
CREATE TABLE email_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounce_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Create index for faster lookups
CREATE INDEX idx_email_recipients_campaign_id ON email_recipients(campaign_id);
CREATE INDEX idx_email_recipients_user_id ON email_recipients(user_id);
CREATE INDEX idx_email_recipients_status ON email_recipients(status);

-- Create table for email links
CREATE TABLE email_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  tracking_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Create index for faster lookups
CREATE INDEX idx_email_links_campaign_id ON email_links(campaign_id);

-- Create table for email link clicks
CREATE TABLE email_link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES email_links(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES email_recipients(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB,
  location_info JSONB,
  metadata JSONB
);

-- Create index for faster lookups
CREATE INDEX idx_email_link_clicks_link_id ON email_link_clicks(link_id);
CREATE INDEX idx_email_link_clicks_recipient_id ON email_link_clicks(recipient_id);

-- Create table for A/B tests
CREATE TABLE email_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variant_a_subject TEXT NOT NULL,
  variant_a_content TEXT NOT NULL,
  variant_b_subject TEXT NOT NULL,
  variant_b_content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'running', 'completed', 'cancelled')),
  winner TEXT CHECK (winner IN ('a', 'b', 'none')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB
);

-- Create index for faster lookups
CREATE INDEX idx_email_ab_tests_campaign_id ON email_ab_tests(campaign_id);
CREATE INDEX idx_email_ab_tests_status ON email_ab_tests(status);

-- Create table for A/B test results
CREATE TABLE email_ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES email_ab_tests(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('a', 'b')),
  recipient_id UUID REFERENCES email_recipients(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Create index for faster lookups
CREATE INDEX idx_email_ab_test_results_test_id ON email_ab_test_results(test_id);
CREATE INDEX idx_email_ab_test_results_variant ON email_ab_test_results(variant);
CREATE INDEX idx_email_ab_test_results_recipient_id ON email_ab_test_results(recipient_id);

-- Create function to track email opens
CREATE OR REPLACE FUNCTION track_email_open(
  p_email_id UUID,
  p_user_id UUID,
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_device_info JSONB,
  p_location_info JSONB
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO email_events (
    email_id,
    user_id,
    event_type,
    ip_address,
    user_agent,
    device_info,
    location_info
  )
  VALUES (
    p_email_id,
    p_user_id,
    'opened',
    p_ip_address,
    p_user_agent,
    p_device_info,
    p_location_info
  )
  RETURNING id INTO v_event_id;
  
  -- Update recipient status if applicable
  UPDATE email_recipients
  SET 
    status = 'opened',
    opened_at = NOW(),
    updated_at = NOW()
  WHERE 
    campaign_id = (SELECT campaign_id FROM email_recipients WHERE id = p_email_id)
    AND user_id = p_user_id
    AND opened_at IS NULL;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to track email clicks
CREATE OR REPLACE FUNCTION track_email_click(
  p_link_id UUID,
  p_recipient_id UUID,
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_device_info JSONB,
  p_location_info JSONB
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_user_id UUID;
  v_campaign_id UUID;
BEGIN
  -- Get user_id and campaign_id from recipient
  SELECT user_id, campaign_id INTO v_user_id, v_campaign_id
  FROM email_recipients
  WHERE id = p_recipient_id;
  
  -- Insert click event
  INSERT INTO email_link_clicks (
    link_id,
    recipient_id,
    ip_address,
    user_agent,
    device_info,
    location_info
  )
  VALUES (
    p_link_id,
    p_recipient_id,
    p_ip_address,
    p_user_agent,
    p_device_info,
    p_location_info
  )
  RETURNING id INTO v_event_id;
  
  -- Update recipient status
  UPDATE email_recipients
  SET 
    status = 'clicked',
    clicked_at = NOW(),
    updated_at = NOW()
  WHERE id = p_recipient_id;
  
  -- Insert general email event
  INSERT INTO email_events (
    email_id,
    user_id,
    event_type,
    event_data,
    ip_address,
    user_agent,
    device_info,
    location_info
  )
  VALUES (
    p_recipient_id,
    v_user_id,
    'clicked',
    jsonb_build_object('link_id', p_link_id),
    p_ip_address,
    p_user_agent,
    p_device_info,
    p_location_info
  );
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get email analytics
CREATE OR REPLACE FUNCTION get_email_analytics(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_template_id UUID DEFAULT NULL,
  p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  template_id UUID,
  template_name TEXT,
  category TEXT,
  total_sent INTEGER,
  total_delivered INTEGER,
  total_opened INTEGER,
  total_clicked INTEGER,
  total_bounced INTEGER,
  total_complained INTEGER,
  total_unsubscribed INTEGER,
  open_rate NUMERIC,
  click_rate NUMERIC,
  bounce_rate NUMERIC,
  complaint_rate NUMERIC,
  unsubscribe_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH template_stats AS (
    SELECT
      t.id AS template_id,
      t.name AS template_name,
      t.category,
      COUNT(DISTINCT CASE WHEN e.event_type = 'sent' THEN e.id END) AS total_sent,
      COUNT(DISTINCT CASE WHEN e.event_type = 'delivered' THEN e.id END) AS total_delivered,
      COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.id END) AS total_opened,
      COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.id END) AS total_clicked,
      COUNT(DISTINCT CASE WHEN e.event_type = 'bounced' THEN e.id END) AS total_bounced,
      COUNT(DISTINCT CASE WHEN e.event_type = 'complained' THEN e.id END) AS total_complained,
      COUNT(DISTINCT CASE WHEN e.event_type = 'unsubscribed' THEN e.id END) AS total_unsubscribed
    FROM
      email_templates t
    LEFT JOIN
      email_events e ON e.email_id IN (SELECT id FROM email_recipients WHERE campaign_id IN (SELECT id FROM email_campaigns WHERE template_id = t.id))
      AND e.created_at BETWEEN p_start_date AND p_end_date
    WHERE
      (p_template_id IS NULL OR t.id = p_template_id)
      AND (p_category IS NULL OR t.category = p_category)
    GROUP BY
      t.id, t.name, t.category
  )
  SELECT
    ts.template_id,
    ts.template_name,
    ts.category,
    ts.total_sent,
    ts.total_delivered,
    ts.total_opened,
    ts.total_clicked,
    ts.total_bounced,
    ts.total_complained,
    ts.total_unsubscribed,
    CASE WHEN ts.total_delivered > 0 THEN ROUND((ts.total_opened::NUMERIC / ts.total_delivered::NUMERIC) * 100, 2) ELSE 0 END AS open_rate,
    CASE WHEN ts.total_opened > 0 THEN ROUND((ts.total_clicked::NUMERIC / ts.total_opened::NUMERIC) * 100, 2) ELSE 0 END AS click_rate,
    CASE WHEN ts.total_sent > 0 THEN ROUND((ts.total_bounced::NUMERIC / ts.total_sent::NUMERIC) * 100, 2) ELSE 0 END AS bounce_rate,
    CASE WHEN ts.total_delivered > 0 THEN ROUND((ts.total_complained::NUMERIC / ts.total_delivered::NUMERIC) * 100, 2) ELSE 0 END AS complaint_rate,
    CASE WHEN ts.total_delivered > 0 THEN ROUND((ts.total_unsubscribed::NUMERIC / ts.total_delivered::NUMERIC) * 100, 2) ELSE 0 END AS unsubscribe_rate
  FROM
    template_stats ts;
END;
$$ LANGUAGE plpgsql;

-- Create function to get email trends over time
CREATE OR REPLACE FUNCTION get_email_trends(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_interval TEXT DEFAULT 'day',
  p_template_id UUID DEFAULT NULL,
  p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  total_sent INTEGER,
  total_delivered INTEGER,
  total_opened INTEGER,
  total_clicked INTEGER,
  open_rate NUMERIC,
  click_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH time_periods AS (
    SELECT
      generate_series(
        date_trunc(p_interval, p_start_date),
        date_trunc(p_interval, p_end_date),
        ('1 ' || p_interval)::interval
      ) AS period_start
  ),
  period_stats AS (
    SELECT
      tp.period_start,
      tp.period_start + ('1 ' || p_interval)::interval AS period_end,
      COUNT(DISTINCT CASE WHEN e.event_type = 'sent' THEN e.id END) AS total_sent,
      COUNT(DISTINCT CASE WHEN e.event_type = 'delivered' THEN e.id END) AS total_delivered,
      COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.id END) AS total_opened,
      COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.id END) AS total_clicked
    FROM
      time_periods tp
    LEFT JOIN
      email_events e ON e.created_at >= tp.period_start AND e.created_at < tp.period_start + ('1 ' || p_interval)::interval
      AND (p_template_id IS NULL OR e.email_id IN (SELECT id FROM email_recipients WHERE campaign_id IN (SELECT id FROM email_campaigns WHERE template_id = p_template_id)))
      AND (p_category IS NULL OR e.email_id IN (SELECT id FROM email_recipients WHERE campaign_id IN (SELECT id FROM email_campaigns WHERE template_id IN (SELECT id FROM email_templates WHERE category = p_category))))
    GROUP BY
      tp.period_start
  )
  SELECT
    ps.period_start,
    ps.period_end,
    ps.total_sent,
    ps.total_delivered,
    ps.total_opened,
    ps.total_clicked,
    CASE WHEN ps.total_delivered > 0 THEN ROUND((ps.total_opened::NUMERIC / ps.total_delivered::NUMERIC) * 100, 2) ELSE 0 END AS open_rate,
    CASE WHEN ps.total_opened > 0 THEN ROUND((ps.total_clicked::NUMERIC / ps.total_opened::NUMERIC) * 100, 2) ELSE 0 END AS click_rate
  FROM
    period_stats ps
  ORDER BY
    ps.period_start;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_ab_test_results ENABLE ROW LEVEL SECURITY;

-- Service role can manage all email analytics
CREATE POLICY "Service role can manage all email analytics"
  ON email_events FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all email templates"
  ON email_templates FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all email campaigns"
  ON email_campaigns FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all email recipients"
  ON email_recipients FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all email links"
  ON email_links FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all email link clicks"
  ON email_link_clicks FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all email A/B tests"
  ON email_ab_tests FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all email A/B test results"
  ON email_ab_test_results FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Users can view their own email events
CREATE POLICY "Users can view their own email events"
  ON email_events FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own email recipients
CREATE POLICY "Users can view their own email recipients"
  ON email_recipients FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own email link clicks
CREATE POLICY "Users can view their own email link clicks"
  ON email_link_clicks FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM email_recipients WHERE id = recipient_id)); 