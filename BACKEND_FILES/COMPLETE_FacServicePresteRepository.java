package com.globalportservices.erp_be.entries.repository;

import com.globalportservices.erp_be.entries.entity.FacServicePreste;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ADD THIS METHOD TO YOUR EXISTING FacServicePresteRepository
 * Or replace the entire interface with this
 */
@Repository
public interface FacServicePresteRepository extends JpaRepository<FacServicePreste, Long> {

    /**
     * CRITICAL METHOD - Gets ALL services for invoice WITH service names
     *
     * Executes: SELECT f.*, s.LibelleService
     *           FROM FacServicePreste f
     *           INNER JOIN FacService s ON f.ServiceId = s.ServiceId
     *           WHERE f.NumFacture = :numFacture
     */
    @Query(value = "SELECT f.*, s.LibelleService " +
                   "FROM FacServicePreste f " +
                   "INNER JOIN FacService s ON f.ServiceId = s.ServiceId " +
                   "WHERE f.NumFacture = :numFacture " +
                   "ORDER BY f.ServicePresteId",
           nativeQuery = true)
    List<FacServicePreste> findAllWithServiceNameByNumFacture(@Param("numFacture") String numFacture);

    /**
     * Find first by NumFacture (for backward compatibility)
     */
    @Query("SELECT f FROM FacServicePreste f WHERE f.numFacture = :numFacture ORDER BY f.servicePresteId")
    Optional<FacServicePreste> findFirstByNumFacture(@Param("numFacture") String numFacture);

    /**
     * Count services for invoice
     */
    @Query("SELECT COUNT(f) FROM FacServicePreste f WHERE f.numFacture = :numFacture")
    long countByNumFacture(@Param("numFacture") String numFacture);
}
