/**
 * CRITICAL FIX - buildInvoiceItems method with proper null handling
 *
 * COPY THIS METHOD into your FacServicePresteServiceImpl
 */
private List<InvoiceItemDto> buildInvoiceItems(List<FacServicePreste> allServices) {
    List<InvoiceItemDto> items = new ArrayList<>();

    log.info("=== Building invoice items ===");

    for (int i = 0; i < allServices.size(); i++) {
        FacServicePreste s = allServices.get(i);

        // Log each service details
        log.info("Service {}: ID={}, LibelleService={}, Montant={}",
            i + 1,
            s.getServiceId(),
            s.getLibelleService(),
            s.getMontant());

        // Skip services with no amount
        if (s.getMontant() == null || s.getMontant() <= 0) {
            log.warn("Skipping service {} - no montant", i + 1);
            continue;
        }

        // Get service name - with fallback
        String serviceName = s.getLibelleService();
        if (serviceName == null || serviceName.trim().isEmpty()) {
            serviceName = "Service " + (i + 1);  // Fallback name
            log.warn("Service {} has null LibelleService - using fallback: {}", i + 1, serviceName);
        }

        // Calculate amounts
        Double montantHTVA = s.getMontant();
        Double montTaxe = (s.getMontTaxe() != null ? s.getMontTaxe() : 0.0);
        Double montRedev = (s.getMontRedev() != null ? s.getMontRedev() : 0.0);
        Double montRedevTaxe = (s.getMontRedevTaxe() != null ? s.getMontRedevTaxe() : 0.0);
        Double totalTVA = montTaxe + montRedev + montRedevTaxe;
        Double totalTTC = montantHTVA + totalTVA;

        log.info("  Amounts: HTVA={}, TVA={}, TTC={}", montantHTVA, totalTVA, totalTTC);

        // Create item with ALL fields set
        InvoiceItemDto item = new InvoiceItemDto();
        item.setItem_designation(serviceName);
        item.setItem_quantity("1");
        item.setItem_price(String.format("%.0f", Math.round(montantHTVA)));
        item.setItem_ct("0");
        item.setItem_tl("0");
        item.setItem_price_nvat(String.format("%.0f", Math.round(montantHTVA)));
        item.setVat(String.format("%.0f", Math.round(totalTVA)));
        item.setItem_price_wvat(String.format("%.0f", Math.round(totalTTC)));
        item.setItem_total_amount(String.format("%.0f", Math.round(totalTTC)));

        items.add(item);
        log.info("✅ Added item: {} - {} BIF", serviceName, totalTTC);
    }

    log.info("=== Built {} items total ===", items.size());
    return items;
}
