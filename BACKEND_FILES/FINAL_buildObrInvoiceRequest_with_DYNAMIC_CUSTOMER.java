/**
 * ============================================
 * FINAL buildObrInvoiceRequest - With Dynamic Customer
 * ============================================
 *
 * This version:
 * - Fetches ALL services with names
 * - Uses DYNAMIC customer data from Importer table
 * - Builds items from all services
 * - Has comprehensive logging
 *
 * REPLACE your buildObrInvoiceRequest method with this
 *
 * IMPORTANT: Make sure your class has ImporterRepository injected:
 *   private final ImporterRepository importerRepository;
 */

private AddInvoiceRequest buildObrInvoiceRequest(String numFacture, String lettreTransp) {

    log.info("╔════════════════════════════════════════════════════════════════════");
    log.info("║ buildObrInvoiceRequest STARTED");
    log.info("║ Invoice: {}", numFacture);
    log.info("╚════════════════════════════════════════════════════════════════════");

    // ============================================
    // STEP 1: Fetch ALL services
    // ============================================
    log.info("▶ STEP 1: Fetching all services...");

    List<FacServicePreste> allServices = facServicePresteRepository
        .findAllWithServiceNameByNumFacture(numFacture);

    if (allServices == null || allServices.isEmpty()) {
        log.error("❌ No services found for invoice {}", numFacture);
        throw new RuntimeException("No services found for " + numFacture);
    }

    log.info("✅ Found {} services", allServices.size());

    for (int i = 0; i < allServices.size(); i++) {
        FacServicePreste s = allServices.get(i);
        log.info("  Service #{}: ServiceId={}, LibelleService='{}', Montant={}",
            i + 1, s.getServiceId(), s.getLibelleService(), s.getMontant());
    }

    FacServicePreste mainService = allServices.get(0);

    // ============================================
    // STEP 2: Create request and get dossier
    // ============================================
    log.info("▶ STEP 2: Creating request and fetching Dossier...");

    AddInvoiceRequest request = new AddInvoiceRequest();

    Dossier dossier = dossierRepository.findById(1L).orElseThrow();
    log.info("✅ Dossier: {}", dossier.getNomDossier());

    // ============================================
    // STEP 3: Get Importer (DYNAMIC based on ImportateurId)
    // ============================================
    log.info("▶ STEP 3: Fetching Importer (customer) information...");
    log.info("  ImportateurId from service: {}", mainService.getImportateurId());

    Importer importer = null;

    if (mainService.getImportateurId() != null) {
        log.info("  Fetching Importer with ID: {}", mainService.getImportateurId());

        try {
            importer = importerRepository.findById(mainService.getImportateurId()).orElse(null);

            if (importer != null) {
                log.info("  ✅ Importer found:");
                log.info("    Nom: {}", importer.getNom());
                log.info("    NIF: {}", importer.getNif());
                log.info("    Adresse: {}", importer.getAdresse());
                log.info("    AssujetiTVA: {}", importer.getAssujetiTVA());
            } else {
                log.warn("  ⚠️ Importer with ID {} not found!", mainService.getImportateurId());
            }
        } catch (Exception e) {
            log.error("  ❌ Error fetching Importer", e);
        }
    } else {
        log.info("  ℹ ImportateurId is NULL - will use default 'Client'");
    }

    // ============================================
    // STEP 4: Set invoice header fields
    // ============================================
    log.info("▶ STEP 4: Setting invoice header...");

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

    // Set taxpayer (dossier) information
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

    log.info("✅ Invoice header set");

    // ============================================
    // STEP 5: Set customer information (DYNAMIC FROM IMPORTER)
    // ============================================
    log.info("▶ STEP 5: Setting customer information...");

    if (importer != null) {
        // Use actual importer data
        log.info("  Using Importer data for customer:");

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

        log.info("    customer_name: {}", customerName);
        log.info("    customer_TIN: {}", customerTIN);
        log.info("    customer_address: {}", customerAddress);
        log.info("    vat_customer_payer: {}", vatCustomerPayer);

    } else {
        // Use default values
        log.info("  Using default customer values (no Importer):");

        request.setCustomer_name("Client");
        request.setCustomer_TIN("");
        request.setCustomer_address("");
        request.setVat_customer_payer("0");

        log.info("    customer_name: Client");
        log.info("    customer_TIN: (empty)");
        log.info("    customer_address: (empty)");
        log.info("    vat_customer_payer: 0");
    }

    log.info("✅ Customer information set");

    // ============================================
    // STEP 6: Set cancellation fields
    // ============================================
    request.setCancelled_invoice_ref("");
    request.setCancelled_invoice("");
    request.setInvoice_ref("");
    request.setCn_motif("");

    // ============================================
    // STEP 7: Build invoice items from ALL services
    // ============================================
    log.info("▶ STEP 7: Building invoice items...");

    List<InvoiceItemDto> items = buildInvoiceItems(allServices);

    log.info("✅ buildInvoiceItems returned {} items", items.size());

    request.setInvoice_items(items);

    log.info("╔════════════════════════════════════════════════════════════════════");
    log.info("║ buildObrInvoiceRequest COMPLETED");
    log.info("║ Total items: {}", items.size());
    log.info("╚════════════════════════════════════════════════════════════════════");

    return request;
}
