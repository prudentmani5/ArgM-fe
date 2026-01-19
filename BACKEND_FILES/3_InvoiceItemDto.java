package com.globalportservices.erp_be.obr.dto;

import lombok.Data;

/**
 * OBR Invoice Item DTO
 * Represents a line item in the invoice
 */
@Data
public class InvoiceItemDto {

    private String item_designation;     // Item name/description
    private String item_quantity = "1";  // Always 1 for our invoices
    private String item_price;           // Price without TVA
    private String item_ct = "0";        // Contribution foncière
    private String item_tl = "0";        // Taxe de luxe
    private String item_price_nvat;      // Price without TVA (same as item_price)
    private String vat;                  // TVA rate
    private String item_price_wvat;      // Price with TVA
    private String item_total_amount;    // Total amount to pay
}
