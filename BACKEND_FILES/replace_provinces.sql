-- ========================================
-- REPLACE PROVINCES DATA
-- République du Burundi - 5 Provinces
-- ========================================

-- 1. BACKUP existing provinces (optional, for safety)
-- CREATE TABLE provinces_backup AS SELECT * FROM provinces;

-- 2. Delete all existing provinces
-- WARNING: This will also affect communes, zones, and collines that reference these provinces
-- Make sure to handle foreign key constraints properly
DELETE FROM provinces;

-- 3. Insert the 5 new provinces
INSERT INTO provinces (province_id, nom, is_active) VALUES
('1', 'BUHUMUZA', true),
('2', 'BUJUMBURA', true),
('3', 'BURUNGA', true),
('4', 'BUTANYERERA', true),
('5', 'GITEGA', true);

-- 4. Verify the data
SELECT * FROM provinces ORDER BY province_id;

-- ========================================
-- IMPORTANT NOTES:
-- ========================================
-- 1. If you have communes referencing provinces, you may need to:
--    - Delete communes first, OR
--    - Update foreign key constraints to ON DELETE CASCADE
--
-- 2. Table name variations:
--    - If your table is named 'province' (singular), change 'provinces' to 'province'
--    - If your table is named 'grh_province', change accordingly
--
-- 3. Column name variations:
--    - If your ID column is 'id' instead of 'province_id', adjust accordingly
--    - If your name column is 'name' instead of 'nom', adjust accordingly
--    - If you don't have 'is_active' column, remove it from the INSERT statement
--
-- 4. For PostgreSQL, if province_id is a SERIAL/BIGSERIAL:
--    ALTER SEQUENCE provinces_province_id_seq RESTART WITH 6;
--
-- ========================================
