package com.globalportservices.erp_be.servicepreste.repository;

import com.globalportservices.erp_be.servicepreste.entity.ServicePreste;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ServicePreste Repository
 *
 * ADD THESE METHODS TO YOUR EXISTING ServicePresteRepository
 */
@Repository
public interface ServicePresteRepository extends JpaRepository<ServicePreste, Long> {

    /**
     * Find ALL ServicePreste rows for a given invoice number
     * This is the KEY METHOD - returns all service articles for one invoice
     *
     * For invoice SB17453/25, this returns 3 rows:
     * - ServicePresteId: 1456716 (PEAGE CAMION REMORQUE)
     * - ServicePresteId: 1456717 (PEAGE SCANNER)
     * - ServicePresteId: 1456718 (ENTAILLE DE PLOMBS)
     */
    @Query("SELECT sp FROM ServicePreste sp WHERE sp.numFacture = :numFacture ORDER BY sp.servicePresteId")
    List<ServicePreste> findAllByNumFacture(@Param("numFacture") String numFacture);

    /**
     * Find by NumFacture and LettreTransp (returns first matching row)
     * Used for initial lookup
     */
    @Query("SELECT sp FROM ServicePreste sp " +
           "WHERE sp.numFacture = :numFacture " +
           "AND sp.lettreTransp = :lettreTransp " +
           "ORDER BY sp.servicePresteId " +
           "LIMIT 1")
    Optional<ServicePreste> findByNumFactureAndLettreTransp(
        @Param("numFacture") String numFacture,
        @Param("lettreTransp") String lettreTransp
    );

    /**
     * Find by NumFacture only (returns first matching row)
     */
    @Query("SELECT sp FROM ServicePreste sp " +
           "WHERE sp.numFacture = :numFacture " +
           "ORDER BY sp.servicePresteId " +
           "LIMIT 1")
    Optional<ServicePreste> findByNumFacture(@Param("numFacture") String numFacture);

    /**
     * Count how many service articles exist for an invoice
     */
    @Query("SELECT COUNT(sp) FROM ServicePreste sp WHERE sp.numFacture = :numFacture")
    long countByNumFacture(@Param("numFacture") String numFacture);

    /**
     * Calculate total amount for an invoice (sum of all article montants)
     */
    @Query("SELECT SUM(sp.montant) FROM ServicePreste sp WHERE sp.numFacture = :numFacture")
    Double sumMontantByNumFacture(@Param("numFacture") String numFacture);

    /**
     * Calculate total TVA for an invoice
     */
    @Query("SELECT SUM(sp.montTaxe + sp.montRedev) FROM ServicePreste sp WHERE sp.numFacture = :numFacture")
    Double sumTVAByNumFacture(@Param("numFacture") String numFacture);
}
