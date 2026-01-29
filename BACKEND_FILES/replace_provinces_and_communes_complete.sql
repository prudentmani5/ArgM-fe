-- ========================================
-- COMPLETE REPLACEMENT: PROVINCES AND COMMUNES
-- République du Burundi
-- 5 Provinces + 42 Communes
-- ========================================

-- ========================================
-- STEP 1: Disable Foreign Key Checks (MySQL)
-- ========================================
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- STEP 2: Clean existing data
-- ========================================
TRUNCATE TABLE collines;
TRUNCATE TABLE zones;
TRUNCATE TABLE communes;
TRUNCATE TABLE provinces;

-- ========================================
-- STEP 3: Insert Provinces
-- ========================================
INSERT INTO provinces (province_id, nom, is_active) VALUES
('1', 'BUHUMUZA', true),
('2', 'BUJUMBURA', true),
('3', 'BURUNGA', true),
('4', 'BUTANYERERA', true),
('5', 'GITEGA', true);

-- ========================================
-- STEP 4: Insert Communes
-- ========================================

-- PROVINCE 1: BUHUMUZA (7 communes)
INSERT INTO communes (code, name, is_active, province_id) VALUES
('BUH-001', 'Butaganzwa', true, '1'),
('BUH-002', 'Butihinda', true, '1'),
('BUH-003', 'Cankuzo', true, '1'),
('BUH-004', 'Gisagara', true, '1'),
('BUH-005', 'Gisuru', true, '1'),
('BUH-006', 'Muyinga', true, '1'),
('BUH-007', 'Ruyigi', true, '1');

-- PROVINCE 2: BUJUMBURA (11 communes)
INSERT INTO communes (code, name, is_active, province_id) VALUES
('BJM-001', 'Bubanza', true, '2'),
('BJM-002', 'Bukinanyana', true, '2'),
('BJM-003', 'Cibitoke', true, '2'),
('BJM-004', 'Isare', true, '2'),
('BJM-005', 'Mpanda', true, '2'),
('BJM-006', 'Mugere', true, '2'),
('BJM-007', 'Mugina', true, '2'),
('BJM-008', 'Muhuta', true, '2'),
('BJM-009', 'Mukaza', true, '2'),
('BJM-010', 'Ntahangwa', true, '2'),
('BJM-011', 'Rwibaga', true, '2');

-- PROVINCE 3: BURUNGA (7 communes)
INSERT INTO communes (code, name, is_active, province_id) VALUES
('BRG-001', 'Bururi', true, '3'),
('BRG-002', 'Makamba', true, '3'),
('BRG-003', 'Matana', true, '3'),
('BRG-004', 'Musongati', true, '3'),
('BRG-005', 'Nyanza', true, '3'),
('BRG-006', 'Rumonge', true, '3'),
('BRG-007', 'Rutana', true, '3');

-- PROVINCE 4: BUTANYERERA (8 communes)
INSERT INTO communes (code, name, is_active, province_id) VALUES
('BTN-001', 'Busoni', true, '4'),
('BTN-002', 'Kayanza', true, '4'),
('BTN-003', 'Kiremba', true, '4'),
('BTN-004', 'Kirundo', true, '4'),
('BTN-005', 'Matongo', true, '4'),
('BTN-006', 'Muhanga', true, '4'),
('BTN-007', 'Ngozi', true, '4'),
('BTN-008', 'Tangara', true, '4');

-- PROVINCE 5: GITEGA (9 communes)
INSERT INTO communes (code, name, is_active, province_id) VALUES
('GTG-001', 'Bugendana', true, '5'),
('GTG-002', 'Gishubi', true, '5'),
('GTG-003', 'Gitega', true, '5'),
('GTG-004', 'Karusi', true, '5'),
('GTG-005', 'Kiganda', true, '5'),
('GTG-006', 'Muramvya', true, '5'),
('GTG-007', 'Mwaro', true, '5'),
('GTG-008', 'Nyabihanga', true, '5'),
('GTG-009', 'Shombo', true, '5');

-- ========================================
-- STEP 5: Re-enable Foreign Key Checks
-- ========================================
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- STEP 6: VERIFICATION
-- ========================================

-- Verify provinces
SELECT
    province_id,
    nom,
    is_active
FROM provinces
ORDER BY province_id;

-- Verify communes with their provinces
SELECT
    c.code,
    c.name AS commune,
    p.nom AS province,
    c.is_active
FROM communes c
LEFT JOIN provinces p ON c.province_id = p.province_id
ORDER BY p.province_id, c.code;

-- Count communes per province
SELECT
    p.province_id,
    p.nom AS province,
    COUNT(c.code) AS nombre_communes
FROM provinces p
LEFT JOIN communes c ON p.province_id = c.province_id
GROUP BY p.province_id, p.nom
ORDER BY p.province_id;

-- Expected results:
-- 5 provinces total
-- 42 communes total:
--   - BUHUMUZA: 7 communes
--   - BUJUMBURA: 11 communes
--   - BURUNGA: 7 communes
--   - BUTANYERERA: 8 communes
--   - GITEGA: 9 communes

-- ========================================
-- FOR POSTGRESQL, USE THIS VERSION:
-- ========================================
/*
SET CONSTRAINTS ALL DEFERRED;

TRUNCATE TABLE collines CASCADE;
TRUNCATE TABLE zones CASCADE;
TRUNCATE TABLE communes CASCADE;
TRUNCATE TABLE provinces CASCADE;

-- Insert provinces (same as above)
-- Insert communes (same as above)

SET CONSTRAINTS ALL IMMEDIATE;
*/

-- ========================================
-- NOTES:
-- ========================================
-- 1. This script will DELETE all existing zones and collines
-- 2. Adjust table/column names if your schema is different
-- 3. Make sure to backup your database before running this script
-- 4. Province IDs are '1', '2', '3', '4', '5' (as strings)
-- 5. Commune codes follow pattern: XXX-NNN (e.g., BUH-001)
-- ========================================
