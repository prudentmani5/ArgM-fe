package com.globalportservices.erp_be.servicepreste.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * FacServicePreste Entity
 *
 * UPDATE YOUR EXISTING FacServicePreste ENTITY
 * Add the @Transient field for LibelleService
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

    @Column(name = "AnnuleFacture")
    private Boolean annuleFacture;

    @Column(name = "DateAnnulation")
    private LocalDateTime dateAnnulation;

    @Column(name = "MotifAnnulation")
    private String motifAnnulation;

    // ADD THIS FIELD - LibelleService from FacService table (via JOIN)
    // This is populated when using the repository query with join
    @Transient  // Not a database column - populated from join
    private String libelleService;

    // Optional: Relationship to FacService (if you want to use JPA navigation)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ServiceId", insertable = false, updatable = false)
    private FacService facService;

    // Add other fields as needed based on your table structure
    // ...
}
