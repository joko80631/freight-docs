-- Create enum for vehicle types
CREATE TYPE vehicle_type AS ENUM (
  'semi_truck',
  'box_truck',
  'van',
  'trailer',
  'other'
);

-- Create enum for vehicle status
CREATE TYPE vehicle_status AS ENUM (
  'active',
  'maintenance',
  'inactive',
  'retired'
);

-- Create table for fleet vehicles
CREATE TABLE fleet_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number TEXT NOT NULL UNIQUE,
  type vehicle_type NOT NULL,
  status vehicle_status NOT NULL DEFAULT 'active',
  last_maintenance TIMESTAMPTZ,
  next_maintenance TIMESTAMPTZ,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Create index for faster lookups
CREATE INDEX idx_fleet_vehicles_vehicle_number ON fleet_vehicles(vehicle_number);
CREATE INDEX idx_fleet_vehicles_type ON fleet_vehicles(type);
CREATE INDEX idx_fleet_vehicles_status ON fleet_vehicles(status);
CREATE INDEX idx_fleet_vehicles_team_id ON fleet_vehicles(team_id);
CREATE INDEX idx_fleet_vehicles_next_maintenance ON fleet_vehicles(next_maintenance);

-- Create RLS policies
ALTER TABLE fleet_vehicles ENABLE ROW LEVEL SECURITY;

-- Team members can view their team's vehicles
CREATE POLICY "Team members can view their team's vehicles"
  ON fleet_vehicles FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

-- Team admins can manage their team's vehicles
CREATE POLICY "Team admins can manage their team's vehicles"
  ON fleet_vehicles FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_fleet_vehicles_updated_at
  BEFORE UPDATE ON fleet_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 