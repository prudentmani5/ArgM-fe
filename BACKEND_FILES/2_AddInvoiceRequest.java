package com.globalportservices.erp_be.obr.dto;

import lombok.Data;
import java.util.List;

/**
 * OBR Add Invoice Request DTO
 * Contains all invoice data to submit to OBR
 */
@Data
public class AddInvoiceRequest {

    // Invoice identifiers (varies by entity type)
    private String invoice_number;      // sortieId | autreFactureId | noArrive | noRemorque | numFacture
    private String invoice_date;        // dateValidation formatted as yyyy-MM-dd
    private String invoice_identifier;  // factureSignature

    // Fixed values for all invoices
    private String invoice_type = "FN";
    private String tp_type = "2";
    private String tp_TIN = "4000155053";
    private String tp_trade_number = "RC 85744";
    private String payment_type = "1";
    private String invoice_currency = "BIF";

    // Company information from Dossier
    private String tp_name;              // nomDossier
    private String tp_postal_number;     // bp
    private String tp_phone_number;      // tel
    private String tp_address_province;  // province
    private String tp_address_commune;   // commune
    private String tp_address_quartier;  // colline
    private String tp_address_avenue;    // avenue
    private String tp_address_number;    // numeroAdresse
    private String vat_taxpayer;         // assujetiTVA
    private String ct_taxpayer;          // assujetiTc
    private String tl_taxpayer;          // assujetiPF
    private String tp_fiscal_center;     // centreFiscale
    private String tp_activity_sector;   // secteurActivite
    private String tp_legal_form;        // formeJuridique

    // Customer information from Importer
    private String customer_name;        // nom
    private String customer_TIN;         // nif
    private String customer_address;     // adresse
    private String vat_customer_payer;   // assujetiTVA

    // Cancellation fields (empty for validation)
    private String cancelled_invoice_ref = "";
    private String cancelled_invoice = "";
    private String invoice_ref = "";
    private String cn_motif = "";

    // Invoice items
    private List<InvoiceItemDto> invoice_items;
}
