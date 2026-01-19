/**
 * ============================================
 * REPOSITORY METHOD - Using Your Exact SQL
 * ============================================
 *
 * ADD THIS METHOD to: FacServicePresteRepository.java
 *
 * This uses the EXACT SQL query you provided:
 * SELECT NumFacture, LibelleService, f.Montant, MontTaxe, MontRedev, MontRedevTaxe
 * FROM FacServicePreste f
 * INNER JOIN FacService s ON f.ServiceId = s.ServiceId
 * WHERE NumFacture = 'SB17453/25'
 *
 * But adapted for JPA with ALL entity columns
 */

@Query(value =
    "SELECT " +
    "    f.ServicePresteId, " +
    "    f.NumFacture, " +
    "    f.LettreTransp, " +
    "    f.ServiceId, " +
    "    f.ImportateurId, " +
    "    f.Montant, " +
    "    f.MontTaxe, " +
    "    f.MontRedev, " +
    "    f.MontRedevTaxe, " +
    "    f.DateValidation, " +
    "    f.IsValid, " +
    "    f.FactureSignature, " +
    "    f.SignatureCrypt, " +
    "    f.StatusEnvoiOBR, " +
    "    f.DateEnvoiOBR, " +
    "    f.StatusEnvoiCancelOBR, " +
    "    s.LibelleService " +              // ← This is the key! Service name from JOIN
    "FROM FacServicePreste f " +
    "INNER JOIN FacService s ON f.ServiceId = s.ServiceId " +
    "WHERE f.NumFacture = :numFacture " +   // ← Dynamic parameter
    "ORDER BY f.ServicePresteId",
    nativeQuery = true)
List<FacServicePreste> findAllWithServiceNameByNumFacture(@Param("numFacture") String numFacture);
