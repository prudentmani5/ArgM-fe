/**
 * ============================================
 * SUPER VERBOSE VERSION - Complete Diagnostic
 * ============================================
 *
 * This version logs EVERYTHING to help identify the issue
 *
 * REPLACE your buildObrInvoiceRequest with this ENTIRE method
 */

private AddInvoiceRequest buildObrInvoiceRequest(String numFacture, String lettreTransp) {

    log.info("╔════════════════════════════════════════════════════════════════════");
    log.info("║ buildObrInvoiceRequest STARTED");
    log.info("║ Invoice: {}", numFacture);
    log.info("║ LettreTransp: {}", lettreTransp);
    log.info("╚════════════════════════════════════════════════════════════════════");

    // ============================================
    // STEP 1: Fetch ALL services
    // ============================================
    log.info("▶ STEP 1: Fetching services...");
    log.info("  Calling: facServicePresteRepository.findAllWithServiceNameByNumFacture('{}')", numFacture);

    List<FacServicePreste> allServices = null;

    try {
        allServices = facServicePresteRepository.findAllWithServiceNameByNumFacture(numFacture);
        log.info("  ✅ Query executed successfully");
    } catch (Exception e) {
        log.error("  ❌ Query failed!", e);
        throw e;
    }

    if (allServices == null) {
        log.error("  ❌ allServices is NULL!");
        throw new RuntimeException("Query returned null for " + numFacture);
    }

    log.info("  📊 Number of services returned: {}", allServices.size());

    if (allServices.isEmpty()) {
        log.error("  ❌ allServices is EMPTY!");
        throw new RuntimeException("No services found for " + numFacture);
    }

    // Log each service in detail
    log.info("  📋 Service details:");
    for (int i = 0; i < allServices.size(); i++) {
        FacServicePreste s = allServices.get(i);
        log.info("  ┌─ Service #{}", i + 1);
        log.info("  │  ServicePresteId: {}", s.getServicePresteId());
        log.info("  │  NumFacture: {}", s.getNumFacture());
        log.info("  │  ServiceId: {}", s.getServiceId());
        log.info("  │  LibelleService: '{}'", s.getLibelleService());
        log.info("  │  Montant: {}", s.getMontant());
        log.info("  │  MontTaxe: {}", s.getMontTaxe());
        log.info("  │  MontRedev: {}", s.getMontRedev());
        log.info("  │  MontRedevTaxe: {}", s.getMontRedevTaxe());
        log.info("  └─");
    }

    FacServicePreste mainService = allServices.get(0);
    log.info("  ✅ Using service #{} as main service for header", 1);

    // ============================================
    // STEP 2: Setup request
    // ============================================
    log.info("▶ STEP 2: Creating AddInvoiceRequest object...");
    AddInvoiceRequest request = new AddInvoiceRequest();

    log.info("  Fetching Dossier (ID=1)...");
    Dossier dossier = dossierRepository.findById(1L).orElseThrow();
    log.info("  ✅ Dossier found: {}", dossier.getNomDossier());

    // ============================================
    // STEP 2B: Fetch Importer (DYNAMIC CUSTOMER)
    // ============================================
    log.info("  Fetching Importer (customer) information...");
    log.info("    ImportateurId from service: {}", mainService.getImportateurId());

    Importer importer = null;

    if (mainService.getImportateurId() != null) {
        log.info("    Calling: importerRepository.findById({})", mainService.getImportateurId());

        try {
            importer = importerRepository.findById(mainService.getImportateurId()).orElse(null);

            if (importer != null) {
                log.info("    ✅ Importer found:");
                log.info("      ImporterId: {}", importer.getImporterId());
                log.info("      Nom: {}", importer.getNom());
                log.info("      NIF: {}", importer.getNif());
                log.info("      Adresse: {}", importer.getAdresse());
                log.info("      AssujetiTVA: {}", importer.getAssujetiTVA());
            } else {
                log.warn("    ⚠️ Importer with ID {} not found in database!", mainService.getImportateurId());
                log.warn("    → Will use default 'Client'");
            }
        } catch (Exception e) {
            log.error("    ❌ Error fetching Importer", e);
            log.warn("    → Will use default 'Client'");
        }
    } else {
        log.info("    ℹ ImportateurId is NULL");
        log.info("    → Will use default 'Client'");
    }

    // ============================================
    // STEP 3: Set invoice header
    // ============================================
    log.info("▶ STEP 3: Setting invoice header fields...");

    request.setInvoice_number(numFacture);
    request.setInvoice_date(mainService.getDateValidation().format(DATE_FORMATTER));
    request.setInvoice_identifier(String.format("%s/ws%s/%s/%s",
        "4000155053",
        "400015505300958",
        mainService.getDateValidation().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")),
        numFacture));

    log.info("  invoice_number: {}", request.getInvoice_number());
    log.info("  invoice_date: {}", request.getInvoice_date());
    log.info("  invoice_identifier: {}", request.getInvoice_identifier());

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

    log.info("  ✅ Taxpayer (dossier) fields set");

    // ============================================
    // STEP 3B: Set customer (DYNAMIC FROM IMPORTER)
    // ============================================
    log.info("  Setting customer information...");

    if (importer != null) {
        // Use actual importer data
        log.info("    Using Importer data for customer:");

        String customerName = importer.getNom();
        String customerTIN = (importer.getNif() != null && !importer.getNif().trim().isEmpty())
            ? importer.getNif()
            : "";
        String customerAddress = (importer.getAdresse() != null && !importer.getAdresse().trim().isEmpty())
            ? importer.getAdresse()
            : "";
        String vatCustomerPayer = (importer.getAssujetiTVA() != null && !importer.getAssujetiTVA().trim().isEmpty())
            ? importer.getAssujetiTVA()
            : "0";

        request.setCustomer_name(customerName);
        request.setCustomer_TIN(customerTIN);
        request.setCustomer_address(customerAddress);
        request.setVat_customer_payer(vatCustomerPayer);

        log.info("      customer_name: {}", customerName);
        log.info("      customer_TIN: {}", customerTIN);
        log.info("      customer_address: {}", customerAddress);
        log.info("      vat_customer_payer: {}", vatCustomerPayer);

    } else {
        // Use default values
        log.info("    Using default customer values (no Importer):");

        request.setCustomer_name("Client");
        request.setCustomer_TIN("");
        request.setCustomer_address("");
        request.setVat_customer_payer("0");

        log.info("      customer_name: Client");
        log.info("      customer_TIN: (empty)");
        log.info("      customer_address: (empty)");
        log.info("      vat_customer_payer: 0");
    }

    log.info("  ✅ Customer information set");

    request.setCancelled_invoice_ref("");
    request.setCancelled_invoice("");
    request.setInvoice_ref("");
    request.setCn_motif("");

    log.info("  ✅ Basic header fields set");

    // ============================================
    // STEP 4: Build invoice items
    // ============================================
    log.info("▶ STEP 4: Building invoice items...");
    log.info("  Calling buildInvoiceItems with {} services", allServices.size());

    List<InvoiceItemDto> items = buildInvoiceItems(allServices);

    log.info("  ✅ buildInvoiceItems returned {} items", items != null ? items.size() : 0);

    if (items == null || items.isEmpty()) {
        log.error("  ❌ NO ITEMS CREATED!");
    } else {
        log.info("  📋 Items created:");
        for (int i = 0; i < items.size(); i++) {
            InvoiceItemDto item = items.get(i);
            log.info("    Item #{}: designation='{}', quantity='{}', price='{}', vat='{}', total='{}'",
                i + 1,
                item.getItem_designation(),
                item.getItem_quantity(),
                item.getItem_price(),
                item.getVat(),
                item.getItem_total_amount());
        }
    }

    request.setInvoice_items(items);

    log.info("╔════════════════════════════════════════════════════════════════════");
    log.info("║ buildObrInvoiceRequest COMPLETED");
    log.info("║ Total items: {}", items != null ? items.size() : 0);
    log.info("╚════════════════════════════════════════════════════════════════════");

    return request;
}


/**
 * ============================================
 * SUPER VERBOSE buildInvoiceItems
 * ============================================
 */
private List<InvoiceItemDto> buildInvoiceItems(List<FacServicePreste> allServices) {

    log.info("  ╔══════════════════════════════════════════════════════════════");
    log.info("  ║ buildInvoiceItems STARTED");
    log.info("  ╚══════════════════════════════════════════════════════════════");

    if (allServices == null) {
        log.error("    ❌ allServices parameter is NULL!");
        return new ArrayList<>();
    }

    log.info("    📊 Received {} services to process", allServices.size());

    List<InvoiceItemDto> items = new ArrayList<>();

    for (int i = 0; i < allServices.size(); i++) {
        FacServicePreste service = allServices.get(i);

        log.info("    ┌──────────────────────────────────────");
        log.info("    │ Processing Service #{}", i + 1);
        log.info("    ├──────────────────────────────────────");
        log.info("    │ ServicePresteId: {}", service.getServicePresteId());
        log.info("    │ ServiceId: {}", service.getServiceId());
        log.info("    │ LibelleService: '{}'", service.getLibelleService());
        log.info("    │ Montant (raw): {}", service.getMontant());
        log.info("    │ MontTaxe (raw): {}", service.getMontTaxe());

        // ============================================
        // Get service name
        // ============================================
        String serviceName = service.getLibelleService();

        if (serviceName == null) {
            log.warn("    │ ⚠️ LibelleService is NULL!");
            serviceName = "Service " + (i + 1);
            log.warn("    │ → Using fallback: '{}'", serviceName);
        } else if (serviceName.trim().isEmpty()) {
            log.warn("    │ ⚠️ LibelleService is EMPTY!");
            serviceName = "Service " + (i + 1);
            log.warn("    │ → Using fallback: '{}'", serviceName);
        } else {
            log.info("    │ ✅ Service name: '{}'", serviceName);
        }

        // ============================================
        // Get amounts
        // ============================================
        Double montant = (service.getMontant() != null ? service.getMontant() : 0.0);
        Double montTaxe = (service.getMontTaxe() != null ? service.getMontTaxe() : 0.0);

        log.info("    │ Montant (cleaned): {} BIF", montant);
        log.info("    │ MontTaxe (cleaned): {} BIF", montTaxe);

        // Check if valid
        if (montant <= 0) {
            log.warn("    │ ⚠️ SKIPPING - Montant is 0 or negative");
            log.info("    └──────────────────────────────────────");
            continue;
        }

        // ============================================
        // Calculate values
        // ============================================
        Double item_price = montant;
        Double vat = montTaxe;
        Double item_price_nvat = montant;
        Double item_price_wvat = montant + montTaxe;
        Double item_total_amount = montant + montTaxe;

        log.info("    │ Calculations:");
        log.info("    │   item_price        = {} BIF", Math.round(item_price));
        log.info("    │   vat               = {} BIF", Math.round(vat));
        log.info("    │   item_price_nvat   = {} BIF", Math.round(item_price_nvat));
        log.info("    │   item_price_wvat   = {} BIF", Math.round(item_price_wvat));
        log.info("    │   item_total_amount = {} BIF", Math.round(item_total_amount));

        // ============================================
        // Create InvoiceItemDto
        // ============================================
        log.info("    │ Creating InvoiceItemDto...");

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

        // Verify values were set
        log.info("    │ InvoiceItemDto created:");
        log.info("    │   designation  = '{}'", item.getItem_designation());
        log.info("    │   quantity     = '{}'", item.getItem_quantity());
        log.info("    │   price        = '{}'", item.getItem_price());
        log.info("    │   ct           = '{}'", item.getItem_ct());
        log.info("    │   tl           = '{}'", item.getItem_tl());
        log.info("    │   price_nvat   = '{}'", item.getItem_price_nvat());
        log.info("    │   vat          = '{}'", item.getVat());
        log.info("    │   price_wvat   = '{}'", item.getItem_price_wvat());
        log.info("    │   total_amount = '{}'", item.getItem_total_amount());

        items.add(item);

        log.info("    │ ✅ Item added to list (total items: {})", items.size());
        log.info("    └──────────────────────────────────────");
    }

    log.info("  ╔══════════════════════════════════════════════════════════════");
    log.info("  ║ buildInvoiceItems COMPLETED");
    log.info("  ║ Total items created: {}", items.size());
    log.info("  ╚══════════════════════════════════════════════════════════════");

    if (items.isEmpty()) {
        log.error("    ❌ WARNING: NO ITEMS WERE CREATED!");
        log.error("    This means all services had Montant <= 0");
    }

    return items;
}
