/**
 * ============================================
 * COMPLETE buildObrInvoiceRequest METHOD
 * ============================================
 *
 * COPY THIS ENTIRE METHOD and REPLACE your current buildObrInvoiceRequest in:
 * FacServicePresteServiceImpl.java
 *
 * This version:
 * - Fetches ALL services (not just 1)
 * - Builds items from ALL services
 * - Each service becomes a separate invoice_item with its real name
 */

private AddInvoiceRequest buildObrInvoiceRequest(String numFacture, String lettreTransp) {

    // ============================================
    // STEP 1: Get ALL services for this invoice
    // ============================================
    List<FacServicePreste> allServices = facServicePresteRepository
        .findAllWithServiceNameByNumFacture(numFacture);

    if (allServices.isEmpty()) {
        throw new RuntimeException("No services found for " + numFacture);
    }

    log.info("Found {} services for invoice {}", allServices.size(), numFacture);

    // Use first service for invoice header data
    FacServicePreste mainService = allServices.get(0);

    // ============================================
    // STEP 2: Create request object
    // ============================================
    AddInvoiceRequest request = new AddInvoiceRequest();

    // ============================================
    // STEP 3: Get related entities
    // ============================================
    Dossier dossier = dossierRepository.findById(1L).orElseThrow();
    Importer importer = mainService.getImportateurId() != null ?
        importerRepository.findById(mainService.getImportateurId()).orElse(null) : null;

    // ============================================
    // STEP 4: Set invoice header fields
    // ============================================
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

    // ============================================
    // STEP 5: Set taxpayer (dossier) information
    // ============================================
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

    // ============================================
    // STEP 6: Set customer (importer) information
    // ============================================
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

    // ============================================
    // STEP 7: Set cancellation fields (empty)
    // ============================================
    request.setCancelled_invoice_ref("");
    request.setCancelled_invoice("");
    request.setInvoice_ref("");
    request.setCn_motif("");

    // ============================================
    // STEP 8: Build items from ALL services
    // ============================================
    request.setInvoice_items(buildInvoiceItems(allServices));

    log.info("Built OBR request with {} items", request.getInvoice_items().size());

    return request;
}
