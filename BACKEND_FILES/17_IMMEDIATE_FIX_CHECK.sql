-- ========================================
-- CHECK INVOICE SB17450/25 DATA
-- Run this to see how many service items it should have
-- ========================================

-- 1. How many service items for this invoice?
SELECT COUNT(*) as total_items
FROM service_preste
WHERE num_facture = 'SB17450/25';

-- 2. Show all service items
SELECT
    service_preste_id,
    num_facture,
    service_id,
    montant,
    mont_taxe,
    mont_redev,
    (mont_taxe + mont_redev) as total_tva,
    (montant + mont_taxe + mont_redev) as total_ttc
FROM service_preste
WHERE num_facture = 'SB17450/25'
ORDER BY service_preste_id;

-- 3. Calculate totals
SELECT
    num_facture,
    COUNT(*) as nombre_articles,
    SUM(montant) as total_htva,
    SUM(mont_taxe + mont_redev) as total_tva,
    SUM(montant + mont_taxe + mont_redev) as total_ttc
FROM service_preste
WHERE num_facture = 'SB17450/25'
GROUP BY num_facture;

-- 4. Get service names (from Service master table)
SELECT
    sp.service_preste_id,
    sp.num_facture,
    sp.service_id,
    s.nom as service_name,  -- Adjust 'nom' to your actual column name
    sp.montant,
    (sp.mont_taxe + sp.mont_redev) as tva,
    (sp.montant + sp.mont_taxe + sp.mont_redev) as total
FROM service_preste sp
LEFT JOIN services s ON sp.service_id = s.service_id
WHERE sp.num_facture = 'SB17450/25'
ORDER BY sp.service_preste_id;
