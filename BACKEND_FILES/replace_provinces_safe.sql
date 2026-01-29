-- ========================================
-- SAFE REPLACE PROVINCES DATA
-- Handles foreign key constraints
-- République du Burundi - 5 Provinces
-- ========================================

-- Option 1: If you want to keep existing communes/zones/collines
-- You'll need to manually map them to the new province IDs after import

-- Option 2: If you want to delete everything (USE WITH CAUTION!)
-- Uncomment the lines below:
/*
DELETE FROM collines;
DELETE FROM zones;
DELETE FROM communes;
DELETE FROM provinces;
*/

-- Option 3: RECOMMENDED - Disable foreign key checks temporarily
-- For MySQL:
SET FOREIGN_KEY_CHECKS = 0;

-- Delete existing provinces
TRUNCATE TABLE provinces;

-- Insert the 5 new provinces
INSERT INTO provinces (province_id, nom, is_active) VALUES
('1', 'BUHUMUZA', true),
('2', 'BUJUMBURA', true),
('3', 'BURUNGA', true),
('4', 'BUTANYERERA', true),
('5', 'GITEGA', true);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- For PostgreSQL, use this instead:
/*
SET CONSTRAINTS ALL DEFERRED;

TRUNCATE TABLE provinces CASCADE;

INSERT INTO provinces (province_id, nom, is_active) VALUES
('1', 'BUHUMUZA', true),
('2', 'BUJUMBURA', true),
('3', 'BURUNGA', true),
('4', 'BUTANYERERA', true),
('5', 'GITEGA', true);

SET CONSTRAINTS ALL IMMEDIATE;
*/

-- Verify the data
SELECT * FROM provinces ORDER BY province_id;

-- ========================================
-- NEXT STEPS:
-- ========================================
-- After running this script, you may need to:
-- 1. Update existing communes to reference the correct new province IDs
-- 2. Re-enter communes, zones, and collines through the application UI
-- ========================================
