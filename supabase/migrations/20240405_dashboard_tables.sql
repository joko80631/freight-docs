-- Create UUID extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  total_loads INTEGER NOT NULL DEFAULT 0,
  loads_trend DECIMAL(5, 2) NOT NULL DEFAULT 0,
  active_carriers INTEGER NOT NULL DEFAULT 0,
  carriers_trend DECIMAL(5, 2) NOT NULL DEFAULT 0,
  on_time_delivery DECIMAL(5, 2) NOT NULL DEFAULT 0,
  delivery_trend DECIMAL(5, 2) NOT NULL DEFAULT 0,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  revenue_trend DECIMAL(5, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('success', 'warning', 'error', 'info')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_metrics_team_id ON metrics(team_id);
CREATE INDEX IF NOT EXISTS idx_metrics_created_at ON metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_team_id ON activities(team_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- Create RLS policies
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Metrics policies
CREATE POLICY "Users can view their team's metrics" 
  ON metrics FOR SELECT 
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their team's metrics" 
  ON metrics FOR INSERT 
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their team's metrics" 
  ON metrics FOR UPDATE 
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Activities policies
CREATE POLICY "Users can view their team's activities" 
  ON activities FOR SELECT 
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their team's activities" 
  ON activities FOR INSERT 
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Insert sample data for testing
INSERT INTO metrics (team_id, total_loads, loads_trend, active_carriers, carriers_trend, on_time_delivery, delivery_trend, revenue, revenue_trend)
SELECT 
  id, 
  1234, 
  12.5, 
  45, 
  5.2, 
  98.5, 
  2.1, 
  45200, 
  -3.4
FROM teams
WHERE id = (SELECT team_id FROM team_members WHERE user_id = auth.uid() LIMIT 1);

-- Insert sample activities
INSERT INTO activities (team_id, title, description, type)
SELECT 
  id, 
  'BOL uploaded', 
  'Bill of Lading #12345 was uploaded for Load #789', 
  'success'
FROM teams
WHERE id = (SELECT team_id FROM team_members WHERE user_id = auth.uid() LIMIT 1);

INSERT INTO activities (team_id, title, description, type)
SELECT 
  id, 
  'Load status updated', 
  'Load #789 status changed to In Transit', 
  'success'
FROM teams
WHERE id = (SELECT team_id FROM team_members WHERE user_id = auth.uid() LIMIT 1);

INSERT INTO activities (team_id, title, description, type)
SELECT 
  id, 
  'New team member', 
  'Sarah Johnson joined the team', 
  'info'
FROM teams
WHERE id = (SELECT team_id FROM team_members WHERE user_id = auth.uid() LIMIT 1);

INSERT INTO activities (team_id, title, description, type)
SELECT 
  id, 
  'Payment received', 
  'Payment of $2,500 received for Load #789', 
  'success'
FROM teams
WHERE id = (SELECT team_id FROM team_members WHERE user_id = auth.uid() LIMIT 1);

INSERT INTO activities (team_id, title, description, type)
SELECT 
  id, 
  'Delay reported', 
  'Load #789 delayed by 2 hours due to traffic', 
  'warning'
FROM teams
WHERE id = (SELECT team_id FROM team_members WHERE user_id = auth.uid() LIMIT 1); 