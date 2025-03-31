-- Add carrier and driver fields to loads table
ALTER TABLE loads
ADD COLUMN mc_number TEXT,
ADD COLUMN driver_name TEXT,
ADD COLUMN driver_phone TEXT,
ADD COLUMN truck_number TEXT,
ADD COLUMN trailer_number TEXT;

-- Add comment to explain the fields
COMMENT ON COLUMN loads.mc_number IS 'Motor Carrier (MC) number for the carrier';
COMMENT ON COLUMN loads.driver_name IS 'Name of the driver assigned to the load';
COMMENT ON COLUMN loads.driver_phone IS 'Contact phone number for the driver';
COMMENT ON COLUMN loads.truck_number IS 'Number/identifier of the truck';
COMMENT ON COLUMN loads.trailer_number IS 'Number/identifier of the trailer';

-- Update existing rows to have null values for new columns
UPDATE loads SET 
  mc_number = NULL,
  driver_name = NULL,
  driver_phone = NULL,
  truck_number = NULL,
  trailer_number = NULL
WHERE mc_number IS NULL; 