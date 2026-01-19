package com.globalportservices.erp_be.obr.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * OBR Invoice Item DTO - Matching official OBR specification
 *
 * VERIFY your InvoiceItemDto matches this structure
 * All fields should be String type for JSON compatibility
 */
@Data
@JsonInclude(JsonInclude.Include.ALWAYS)  // Include all fields, even if null
public class InvoiceItemDto {

    /**
     * Item name/description - CRITICAL FIELD
     * Example: "PEAGE CAMION REMORQUE"
     */
    @JsonProperty("item_designation")
    private String item_designation;

    /**
     * Quantity
     * Example: "1" or "10"
     */
    @JsonProperty("item_quantity")
    private String item_quantity;

    /**
     * Unit price (HTVA)
     * Example: "500"
     */
    @JsonProperty("item_price")
    private String item_price;

    /**
     * Contribution tax (usually "0" for services)
     */
    @JsonProperty("item_ct")
    private String item_ct;

    /**
     * Local tax (usually "0" for services)
     */
    @JsonProperty("item_tl")
    private String item_tl;

    /**
     * Price without VAT (usually same as item_price)
     * Example: "5789"
     */
    @JsonProperty("item_price_nvat")
    private String item_price_nvat;

    /**
     * VAT amount
     * Example: "1042.02"
     */
    @JsonProperty("vat")
    private String vat;

    /**
     * Price with VAT
     * Example: "6831.02"
     */
    @JsonProperty("item_price_wvat")
    private String item_price_wvat;

    /**
     * Total amount (quantity * price_wvat)
     * Example: "6954.02"
     */
    @JsonProperty("item_total_amount")
    private String item_total_amount;

    /**
     * Optional: OTT tax (rarely used)
     */
    @JsonProperty("item_ott_tax")
    private String item_ott_tax;

    /**
     * Optional: TSCE tax (rarely used)
     */
    @JsonProperty("item_tsce_tax")
    private String item_tsce_tax;
}
