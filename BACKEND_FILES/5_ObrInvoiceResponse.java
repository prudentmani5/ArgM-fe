package com.globalportservices.erp_be.obr.dto;

import lombok.Data;

/**
 * OBR Invoice Response DTO
 * Response from OBR after invoice submission
 */
@Data
public class ObrInvoiceResponse {

    private boolean success;
    private String message;
    private String invoice_number;
    private String invoice_registered_number;  // OBR generated number
    private String electronic_signature;       // This is saved to factureSignature
    private String qr_code;
}
