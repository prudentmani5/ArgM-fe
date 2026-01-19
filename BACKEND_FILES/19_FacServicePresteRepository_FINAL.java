package com.globalportservices.erp_be.servicepreste.repository;

import com.globalportservices.erp_be.servicepreste.entity.FacServicePreste;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * FacServicePreste Repository
 *
 * ADD THIS METHOD TO YOUR EXISTING FacServicePresteRepository
 */
@Repository
public interface FacServicePresteRepository extends JpaRepository<FacServicePreste, Long> {

    /**
     * CRITICAL METHOD - Find ALL service items for an invoice WITH service names
     *
     * This executes the EXACT query you provided:
     * SELECT NumFacture, LibelleService, f.Montant, MontTaxe, MontRedev, MontRedevTaxe
     * FROM FacServicePreste f
     * INNER JOIN FacService s ON f.ServiceId = s.ServiceId
     * WHERE NumFacture = :numFacture
     *
     * For invoice SB17453/25, this returns 3 rows:
     * - PEAGE CAMION REMORQUE (26009)
     * - PEAGE SCANNER (36270)
     * - ENTAILLE DE PLOMBS (11700)
     */
    @Query("SELECT f, s.libelleService FROM FacServicePreste f " +
           "INNER JOIN FacService s ON f.serviceId = s.serviceId " +
           "WHERE f.numFacture = :numFacture " +
           "ORDER BY f.servicePresteId")
    List<Object[]> findAllWithServiceNameByNumFactureNative(@Param("numFacture") String numFacture);

    /**
     * Alternative using native SQL (if JPA query doesn't work)
     */
    @Query(value = "SELECT f.*, s.LibelleService " +
                   "FROM FacServicePreste f " +
                   "INNER JOIN FacService s ON f.ServiceId = s.ServiceId " +
                   "WHERE f.NumFacture = :numFacture " +
                   "ORDER BY f.ServicePresteId",
           nativeQuery = true)
    List<FacServicePreste> findAllWithServiceNameByNumFacture(@Param("numFacture") String numFacture);

    /**
     * Find by NumFacture (returns first row)
     */
    @Query("SELECT f FROM FacServicePreste f " +
           "WHERE f.numFacture = :numFacture " +
           "ORDER BY f.servicePresteId")
    Optional<FacServicePreste> findFirstByNumFacture(@Param("numFacture") String numFacture);

    /**
     * Count service items for an invoice
     */
    @Query("SELECT COUNT(f) FROM FacServicePreste f WHERE f.numFacture = :numFacture")
    long countByNumFacture(@Param("numFacture") String numFacture);

    /**
     * Calculate total HTVA for an invoice
     */
    @Query("SELECT SUM(f.montant) FROM FacServicePreste f WHERE f.numFacture = :numFacture")
    Double sumMontantByNumFacture(@Param("numFacture") String numFacture);

    /**
     * Calculate total TVA for an invoice
     */
    @Query("SELECT SUM(f.montTaxe + f.montRedev + f.montRedevTaxe) " +
           "FROM FacServicePreste f WHERE f.numFacture = :numFacture")
    Double sumTVAByNumFacture(@Param("numFacture") String numFacture);
}
