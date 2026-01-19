/**
 * ============================================
 * CORRECT buildInvoiceItems - EXACT FORMULAS
 * ============================================
 *
 * Using the EXACT formulas specified:
 * - vat = MontTaxe
 * - item_price = Montant
 * - item_price_nvat = Montant
 * - item_price_wvat = Montant + MontTaxe
 * - item_total_amount = Montant + MontTaxe
 *
 * COPY THIS METHOD into FacServicePresteServiceImpl
 */

private List<InvoiceItemDto> buildInvoiceItems(List<FacServicePreste> allServices) {
    List<InvoiceItemDto> items = new ArrayList<>();

    log.info("=== Building {} invoice items ===", allServices.size());

    for (int i = 0; i < allServices.size(); i++) {
        FacServicePreste service = allServices.get(i);

        // Log service details
        log.info("Service {}: ServiceId={}, LibelleService='{}', Montant={}, MontTaxe={}",
            i + 1,
            service.getServiceId(),
            service.getLibelleService(),
            service.getMontant(),
            service.getMontTaxe());

        // Get service name (from JOIN query)
        String serviceName = service.getLibelleService();
        if (serviceName == null || serviceName.trim().isEmpty()) {
            serviceName = "Service " + (i + 1);
            log.warn("⚠️ LibelleService is NULL for ServiceId={}. Using fallback: {}",
                service.getServiceId(), serviceName);
        }

        // ============================================
        // EXACT CALCULATIONS (as specified)
        // ============================================
        Double montant = (service.getMontant() != null ? service.getMontant() : 0.0);
        Double montTaxe = (service.getMontTaxe() != null ? service.getMontTaxe() : 0.0);

        // Formulas:
        Double item_price = montant;                    // item_price = Montant
        Double vat = montTaxe;                          // vat = MontTaxe
        Double item_price_nvat = montant;               // item_price_nvat = Montant
        Double item_price_wvat = montant + montTaxe;    // item_price_wvat = Montant + MontTaxe
        Double item_total_amount = montant + montTaxe;  // item_total_amount = Montant + MontTaxe

        // Skip if no amount
        if (montant <= 0) {
            log.warn("⚠️ Skipping service {} - Montant is 0 or negative", i + 1);
            continue;
        }

        log.info("  💰 Montant={} BIF, MontTaxe={} BIF, Total={} BIF",
            Math.round(montant),
            Math.round(montTaxe),
            Math.round(item_total_amount));

        // ============================================
        // Create InvoiceItemDto - ALL REQUIRED FIELDS
        // ============================================
        InvoiceItemDto item = new InvoiceItemDto();

        // REQUIRED FIELDS
        item.setItem_designation(serviceName);                                      // Service name from JOIN
        item.setItem_quantity("1");                                                 // Always 1 for services
        item.setItem_price(String.format("%.0f", Math.round(item_price)));         // Montant
        item.setItem_ct("0");                                                       // Contribution tax (usually 0)
        item.setItem_tl("0");                                                       // Local tax (usually 0)
        item.setItem_price_nvat(String.format("%.0f", Math.round(item_price_nvat)));  // Montant
        item.setVat(String.format("%.0f", Math.round(vat)));                       // MontTaxe
        item.setItem_price_wvat(String.format("%.0f", Math.round(item_price_wvat)));  // Montant + MontTaxe
        item.setItem_total_amount(String.format("%.0f", Math.round(item_total_amount)));  // Montant + MontTaxe

        items.add(item);

        log.info("✅ Item {}: '{}' - {} BIF (HTVA={}, TVA={})",
            i + 1,
            serviceName,
            Math.round(item_total_amount),
            Math.round(montant),
            Math.round(montTaxe));
    }

    log.info("=== ✅ Built {} items total ===", items.size());

    if (items.isEmpty()) {
        log.error("❌ NO ITEMS BUILT! All services have Montant = 0");
    }

    return items;
}
