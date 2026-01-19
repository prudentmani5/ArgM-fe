/**
 * ============================================
 * DIAGNOSTIC VERSION - buildObrInvoiceRequest
 * ============================================
 *
 * This version has EXTENSIVE logging to see exactly what's happening
 *
 * REPLACE YOUR CURRENT buildObrInvoiceRequest with this
 */

private AddInvoiceRequest buildObrInvoiceRequest(String numFacture, String lettreTransp) {

    log.info("========================================");
    log.info("Building OBR request for invoice: {}", numFacture);
    log.info("========================================");

    // ============================================
    // STEP 1: Fetch ALL services with names
    // ============================================
    log.info("Calling: findAllWithServiceNameByNumFacture({})", numFacture);

    List<FacServicePreste> allServices = facServicePresteRepository
        .findAllWithServiceNameByNumFacture(numFacture);

    log.info("✅ Query returned {} services", allServices != null ? allServices.size() : 0);

    if (allServices == null || allServices.isEmpty()) {
        log.error("❌ NO SERVICES FOUND for invoice {}", numFacture);
        throw new RuntimeException("No services found for " + numFacture);
    }

    // Log each service detail
    for (int i = 0; i < allServices.size(); i++) {
        FacServicePreste s = allServices.get(i);
        log.info("  Service [{}]: ServicePresteId={}, ServiceId={}, LibelleService='{}', Montant={}, MontTaxe={}",
            i + 1,
            s.getServicePresteId(),
            s.getServiceId(),
            s.getLibelleService(),  // This should NOT be null!
            s.getMontant(),
            s.getMontTaxe());
    }

    FacServicePreste mainService = allServices.get(0);

    // ============================================
    // STEP 2: Create request and set header
    // ============================================
    AddInvoiceRequest request = new AddInvoiceRequest();

    Dossier dossier = dossierRepository.findById(1L).orElseThrow();
    Importer importer = mainService.getImportateurId() != null ?
        importerRepository.findById(mainService.getImportateurId()).orElse(null) : null;

    // Set all header fields (same as before)
    request.setInvoice_number(numFacture);
    request.setInvoice_date(mainService.getDateValidation().format(DATE_FORMATTER));
    request.setInvoice_identifier(String.format("%s/ws%s/%s/%s",
        "4000155053",
        "400015505300958",
        mainService.getDateValidation().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")),
        numFacture));

    request.setInvoice_type("FN");
    request.setTp_type("2");
    request.setTp_TIN("4000155053");
    request.setTp_trade_number("RC 85744");
    request.setPayment_type("1");
    request.setInvoice_currency("BIF");

    request.setTp_name(dossier.getNomDossier());
    request.setTp_postal_number(dossier.getBp());
    request.setTp_phone_number(dossier.getTel());
    request.setTp_address_province(dossier.getProvince());
    request.setTp_address_commune(dossier.getCommune());
    request.setTp_address_quartier(dossier.getColline());
    request.setTp_address_avenue(dossier.getAvenue());
    request.setTp_address_number(dossier.getNumeroAdresse());
    request.setVat_taxpayer(dossier.getAssujetiTVA());
    request.setCt_taxpayer(dossier.getAssujetiTc());
    request.setTl_taxpayer(dossier.getAssujetiPF());
    request.setTp_fiscal_center(dossier.getCentreFiscale());
    request.setTp_activity_sector(dossier.getSecteurActivite());
    request.setTp_legal_form(dossier.getFormeJuridique());

    if (importer != null) {
        request.setCustomer_name(importer.getNom());
        request.setCustomer_TIN(importer.getNif() != null ? importer.getNif() : "");
        request.setCustomer_address(importer.getAdresse() != null ? importer.getAdresse() : "");
        request.setVat_customer_payer(importer.getAssujetiTVA());
    } else {
        request.setCustomer_name("Client");
        request.setCustomer_TIN("");
        request.setCustomer_address("");
        request.setVat_customer_payer("0");
    }

    request.setCancelled_invoice_ref("");
    request.setCancelled_invoice("");
    request.setInvoice_ref("");
    request.setCn_motif("");

    // ============================================
    // STEP 3: Build items from ALL services
    // ============================================
    log.info("Calling buildInvoiceItems with {} services", allServices.size());

    List<InvoiceItemDto> items = buildInvoiceItems(allServices);

    log.info("buildInvoiceItems returned {} items", items != null ? items.size() : 0);

    request.setInvoice_items(items);

    log.info("========================================");
    log.info("✅ OBR request built successfully with {} items", items.size());
    log.info("========================================");

    return request;
}


/**
 * ============================================
 * DIAGNOSTIC VERSION - buildInvoiceItems
 * ============================================
 */
private List<InvoiceItemDto> buildInvoiceItems(List<FacServicePreste> allServices) {
    List<InvoiceItemDto> items = new ArrayList<>();

    log.info("=== buildInvoiceItems START ===");
    log.info("Received {} services to process", allServices != null ? allServices.size() : 0);

    if (allServices == null || allServices.isEmpty()) {
        log.error("❌ allServices is null or empty!");
        return items;
    }

    for (int i = 0; i < allServices.size(); i++) {
        FacServicePreste service = allServices.get(i);

        log.info("--- Processing Service {} ---", i + 1);
        log.info("  ServicePresteId: {}", service.getServicePresteId());
        log.info("  ServiceId: {}", service.getServiceId());
        log.info("  LibelleService: '{}'", service.getLibelleService());
        log.info("  Montant: {}", service.getMontant());
        log.info("  MontTaxe: {}", service.getMontTaxe());

        // Get service name
        String serviceName = service.getLibelleService();

        if (serviceName == null || serviceName.trim().isEmpty()) {
            log.warn("⚠️ LibelleService is NULL or empty! Using fallback.");
            serviceName = "Service " + (i + 1);
        } else {
            log.info("  ✅ Service name: '{}'", serviceName);
        }

        // Get amounts
        Double montant = (service.getMontant() != null ? service.getMontant() : 0.0);
        Double montTaxe = (service.getMontTaxe() != null ? service.getMontTaxe() : 0.0);

        log.info("  Montant (cleaned): {}", montant);
        log.info("  MontTaxe (cleaned): {}", montTaxe);

        // Check if valid
        if (montant <= 0) {
            log.warn("  ⚠️ Skipping - Montant is 0 or negative");
            continue;
        }

        // Calculate values
        Double item_price = montant;
        Double vat = montTaxe;
        Double item_price_nvat = montant;
        Double item_price_wvat = montant + montTaxe;
        Double item_total_amount = montant + montTaxe;

        log.info("  Calculated values:");
        log.info("    item_price: {}", item_price);
        log.info("    vat: {}", vat);
        log.info("    item_price_nvat: {}", item_price_nvat);
        log.info("    item_price_wvat: {}", item_price_wvat);
        log.info("    item_total_amount: {}", item_total_amount);

        // Create item
        InvoiceItemDto item = new InvoiceItemDto();
        item.setItem_designation(serviceName);
        item.setItem_quantity("1");
        item.setItem_price(String.format("%.0f", Math.round(item_price)));
        item.setItem_ct("0");
        item.setItem_tl("0");
        item.setItem_price_nvat(String.format("%.0f", Math.round(item_price_nvat)));
        item.setVat(String.format("%.0f", Math.round(vat)));
        item.setItem_price_wvat(String.format("%.0f", Math.round(item_price_wvat)));
        item.setItem_total_amount(String.format("%.0f", Math.round(item_total_amount)));

        items.add(item);

        log.info("  ✅ Item added: '{}' - {} BIF", serviceName, Math.round(item_total_amount));
    }

    log.info("=== buildInvoiceItems END ===");
    log.info("Total items created: {}", items.size());

    return items;
}
