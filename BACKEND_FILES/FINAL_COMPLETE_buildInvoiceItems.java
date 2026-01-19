/**
 * FINAL COMPLETE FIX - buildInvoiceItems matching OBR specification
 *
 * This version ensures ALL fields are populated (no nulls) to match OBR format:
 * {
 *   "item_designation": "ARTICLE ONE",
 *   "item_quantity": "10",
 *   "item_price": "500",
 *   "item_ct": "0",
 *   "item_tl": "0",
 *   "item_price_nvat": "5789",
 *   "vat": "1042.02",
 *   "item_price_wvat": "6831.02",
 *   "item_total_amount": "6954.02"
 * }
 *
 * COPY THIS METHOD into FacServicePresteServiceImpl
 */
private List<InvoiceItemDto> buildInvoiceItems(List<FacServicePreste> allServices) {
    List<InvoiceItemDto> items = new ArrayList<>();

    log.info("=== Building invoice items (OBR format) ===");

    for (int i = 0; i < allServices.size(); i++) {
        FacServicePreste s = allServices.get(i);

        // Log each service details for debugging
        log.info("Service {}: ServiceId={}, LibelleService='{}', Montant={}",
            i + 1,
            s.getServiceId(),
            s.getLibelleService(),
            s.getMontant());

        // Skip services with no amount
        if (s.getMontant() == null || s.getMontant() <= 0) {
            log.warn("⚠️ Skipping service {} - no montant", i + 1);
            continue;
        }

        // ============================================
        // STEP 1: Get service name (CRITICAL!)
        // ============================================
        String serviceName = s.getLibelleService();

        if (serviceName == null || serviceName.trim().isEmpty()) {
            // Fallback: Try to fetch from ServiceId manually
            if (s.getServiceId() != null) {
                log.warn("⚠️ LibelleService is NULL for ServiceId={}. Trying manual fetch...", s.getServiceId());

                // TODO: If you have FacServiceRepository, uncomment this:
                /*
                try {
                    FacService facService = facServiceRepository.findById(s.getServiceId()).orElse(null);
                    if (facService != null && facService.getLibelleService() != null) {
                        serviceName = facService.getLibelleService();
                        log.info("✅ Fetched service name manually: {}", serviceName);
                    }
                } catch (Exception e) {
                    log.error("❌ Failed to fetch service name", e);
                }
                */
            }

            // Final fallback
            if (serviceName == null || serviceName.trim().isEmpty()) {
                serviceName = "Service " + (i + 1);
                log.warn("⚠️ Using fallback service name: {}", serviceName);
            }
        }

        // ============================================
        // STEP 2: Calculate amounts
        // ============================================
        // Base amount (HTVA - Hors TVA)
        Double montantHTVA = s.getMontant();

        // Tax components
        Double montTaxe = (s.getMontTaxe() != null ? s.getMontTaxe() : 0.0);
        Double montRedev = (s.getMontRedev() != null ? s.getMontRedev() : 0.0);
        Double montRedevTaxe = (s.getMontRedevTaxe() != null ? s.getMontRedevTaxe() : 0.0);

        // Total VAT
        Double totalVAT = montTaxe + montRedev + montRedevTaxe;

        // Total with VAT (TTC - Toutes Taxes Comprises)
        Double totalTTC = montantHTVA + totalVAT;

        log.info("  💰 Amounts: HTVA={} BIF, VAT={} BIF, TTC={} BIF",
            Math.round(montantHTVA),
            Math.round(totalVAT),
            Math.round(totalTTC));

        // ============================================
        // STEP 3: Build InvoiceItemDto (ALL FIELDS!)
        // ============================================
        InvoiceItemDto item = new InvoiceItemDto();

        // Item identification
        item.setItem_designation(serviceName);                              // CRITICAL: Service name
        item.setItem_quantity("1");                                         // Always 1 for services

        // Prices
        item.setItem_price(String.format("%.0f", Math.round(montantHTVA))); // Unit price

        // Taxes (CT and TL - usually 0 for port services)
        item.setItem_ct("0");                                               // Contribution tax
        item.setItem_tl("0");                                               // Local tax

        // Price without VAT (usually same as item_price for services)
        item.setItem_price_nvat(String.format("%.0f", Math.round(montantHTVA)));

        // VAT amount
        item.setVat(String.format("%.0f", Math.round(totalVAT)));

        // Price with VAT (unit price + VAT)
        item.setItem_price_wvat(String.format("%.0f", Math.round(totalTTC)));

        // Total amount (for quantity=1, same as price_wvat)
        item.setItem_total_amount(String.format("%.0f", Math.round(totalTTC)));

        items.add(item);

        log.info("✅ Added item #{}: '{}' - {} BIF", i + 1, serviceName, Math.round(totalTTC));
    }

    log.info("=== ✅ Built {} invoice items total ===", items.size());

    return items;
}
