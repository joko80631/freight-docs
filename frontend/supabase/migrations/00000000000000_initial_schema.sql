-- Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    total_loads INTEGER DEFAULT 0,
    loads_trend DECIMAL DEFAULT 0,
    active_carriers INTEGER DEFAULT 0,
    carriers_trend DECIMAL DEFAULT 0,
    on_time_delivery DECIMAL DEFAULT 0,
    delivery_trend DECIMAL DEFAULT 0,
    revenue DECIMAL DEFAULT 0,
    revenue_trend DECIMAL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add RLS policies
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Metrics policies
CREATE POLICY "Users can view their team's metrics"
    ON metrics FOR SELECT
    USING (team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ));

-- Activities policies
CREATE POLICY "Users can view their team's activities"
    ON activities FOR SELECT
    USING (team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ));

-- Add some sample data
INSERT INTO metrics (team_id, total_loads, loads_trend, active_carriers, carriers_trend, on_time_delivery, delivery_trend, revenue, revenue_trend)
SELECT 
    tm.team_id,
    10,  -- total_loads
    5,   -- loads_trend
    5,   -- active_carriers
    10,  -- carriers_trend
    95,  -- on_time_delivery
    2,   -- delivery_trend
    50000, -- revenue
    15     -- revenue_trend
FROM team_members tm
WHERE tm.role = 'owner'
ON CONFLICT DO NOTHING;

INSERT INTO activities (team_id, title, description, type)
SELECT 
    tm.team_id,
    'Welcome to Freight!',
    'Your dashboard is ready. Start by creating your first load.',
    'info'
FROM team_members tm
WHERE tm.role = 'owner'
ON CONFLICT DO NOTHING; 