package com.globalportservices.erp_be.entries.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * ADD THE @Transient FIELD TO YOUR EXISTING FacServicePreste ENTITY
 */
@Entity
@Table(name = "FacServicePreste")
@Data
public class FacServicePreste {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ServicePresteId")
    private Long servicePresteId;

    @Column(name = "NumFacture")
    private String numFacture;

    @Column(name = "LettreTransp")
    private String lettreTransp;

    @Column(name = "ServiceId")
    private Long serviceId;

    @Column(name = "ImportateurId")
    private Long importateurId;

    @Column(name = "Montant")
    private Double montant;

    @Column(name = "MontTaxe")
    private Double montTaxe;

    @Column(name = "MontRedev")
    private Double montRedev;

    @Column(name = "MontRedevTaxe")
    private Double montRedevTaxe;

    @Column(name = "DateValidation")
    private LocalDateTime dateValidation;

    @Column(name = "IsValid")
    private Boolean isValid;

    @Column(name = "FactureSignature")
    private String factureSignature;

    @Column(name = "SignatureCrypt")
    private String signatureCrypt;

    @Column(name = "StatusEnvoiOBR")
    private Integer statusEnvoiOBR;

    @Column(name = "DateEnvoiOBR")
    private LocalDateTime dateEnvoiOBR;

    @Column(name = "StatusEnvoiCancelOBR")
    private Integer statusEnvoiCancelOBR;

    // ============================================
    // ADD THIS FIELD - Service name from JOIN
    // ============================================
    @Transient  // NOT a database column - populated by JOIN query
    private String libelleService;

    // Add getter and setter
    public String getLibelleService() {
        return libelleService;
    }

    public void setLibelleService(String libelleService) {
        this.libelleService = libelleService;
    }
    // ============================================

    // ... other fields as needed ...
}
