/**
 * ============================================
 * CORRECTED VERSION - Based on Your Actual Code
 * ============================================
 *
 * REPLACE your current buildObrInvoiceRequest method with this
 */

private AddInvoiceRequest buildObrInvoiceRequest(String numFacture, String lettreTransp) {

    log.info("╔════════════════════════════════════════════════════════════════════");
    log.info("║ buildObrInvoiceRequest STARTED");
    log.info("║ Invoice: {}", numFacture);
    log.info("╚════════════════════════════════════════════════════════════════════");

    // ============================================
    // STEP 1: Get all services for this invoice
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
    // STEP 2: Create request and prepare data
    // ============================================
    log.info("▶ STEP 2: Creating request...");

    AddInvoiceRequest request = new AddInvoiceRequest();

    DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    String invoiceDate = mainService.getDateValidation() != null
            ? mainService.getDateValidation().format(dateFormatter)
            : LocalDateTime.now().format(dateFormatter);

    DateTimeFormatter identifierFormatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    String timestamp = mainService.getDateValidation() != null
            ? mainService.getDateValidation().format(identifierFormatter)
            : LocalDateTime.now().format(identifierFormatter);

    // ============================================
    // STEP 3: Fetch Dossier (company info)
    // ============================================
    log.info("▶ STEP 3: Fetching Dossier...");

    Dossier dossier = dossierRepository.findById(1L)
        .orElseThrow(() -> new RuntimeException("Dossier not found"));

    log.info("✅ Dossier: {}", dossier.getNomDossier());

    // ============================================
    // STEP 4: Fetch Importer (customer info - DYNAMIC)
    // ============================================
    log.info("▶ STEP 4: Fetching Importer (customer)...");
    log.info("  ImportateurId from service: {}", mainService.getImportateurId());

    Importer importer = null;

    if (mainService.getImportateurId() != null) {
        log.info("  Fetching Importer with ID: {}", mainService.getImportateurId());

        try {
            importer = importerRepository.findById(mainService.getImportateurId()).orElse(null);

            if (importer != null) {
                log.info("  ✅ Importer found: {}", importer.getNom());
                log.info("    NIF: {}", importer.getNif());
                log.info("    Adresse: {}", importer.getAdresse());
            } else {
                log.warn("  ⚠️ Importer ID {} not found - using default 'Client'", mainService.getImportateurId());
            }
        } catch (Exception e) {
            log.error("  ❌ Error fetching Importer", e);
        }
    } else {
        log.info("  ℹ No ImportateurId - using default 'Client'");
    }

    // ============================================
    // STEP 5: Set invoice header
    // ============================================
    log.info("▶ STEP 5: Setting invoice header...");

    request.setInvoice_number(numFacture);
    request.setInvoice_date(invoiceDate);
    request.setInvoice_identifier("4000155053/" + obrUsername + "/" + timestamp + "/" + numFacture);

    log.info("  invoice_number: {}", numFacture);
    log.info("  invoice_date: {}", invoiceDate);
    log.info("  invoice_identifier: {}", request.getInvoice_identifier());

    request.setInvoice_type("FN");
    request.setTp_type("2");
    request.setTp_TIN("4000155053");
    request.setTp_trade_number("RC 85744");
    request.setPayment_type("1");
    request.setInvoice_currency("BIF");

    // ============================================
    // STEP 6: Set taxpayer info (FROM DOSSIER)
    // ============================================
    log.info("▶ STEP 6: Setting taxpayer info from Dossier...");

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

    log.info("  ✅ Taxpayer info set");

    // ============================================
    // STEP 7: Set customer info (FROM IMPORTER - DYNAMIC)
    // ============================================
    log.info("▶ STEP 7: Setting customer info...");

    if (importer != null) {
        // Use actual importer data
        log.info("  Using Importer data:");

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
        log.info("  Using default customer:");

        request.setCustomer_name("Client");
        request.setCustomer_TIN("");
        request.setCustomer_address("");
        request.setVat_customer_payer("0");

        log.info("    customer_name: Client");
        log.info("    customer_TIN: (empty)");
    }

    log.info("  ✅ Customer info set");

    // ============================================
    // STEP 8: Set cancellation fields
    // ============================================
    request.setCancelled_invoice_ref("");
    request.setCancelled_invoice("");
    request.setInvoice_ref("");
    request.setCn_motif("");

    // ============================================
    // STEP 9: Build ALL invoice items
    // ============================================
    log.info("▶ STEP 9: Building invoice items...");
    log.info("  Calling buildInvoiceItems with {} services", allServices.size());

    List<InvoiceItemDto> items = buildInvoiceItems(allServices);

    log.info("  ✅ Built {} items", items.size());

    request.setInvoice_items(items);

    log.info("╔════════════════════════════════════════════════════════════════════");
    log.info("║ buildObrInvoiceRequest COMPLETED");
    log.info("║ Total items: {}", items.size());
    log.info("╚════════════════════════════════════════════════════════════════════");

    return request;
}


/**
 * ============================================
 * buildInvoiceItems - Creates items from services
 * ============================================
 */
private List<InvoiceItemDto> buildInvoiceItems(List<FacServicePreste> allServices) {

    log.info("  ╔══════════════════════════════════════════════════════════════");
    log.info("  ║ buildInvoiceItems STARTED");
    log.info("  ╚══════════════════════════════════════════════════════════════");

    List<InvoiceItemDto> items = new ArrayList<>();

    for (int i = 0; i < allServices.size(); i++) {
        FacServicePreste service = allServices.get(i);

        log.info("    Processing Service #{}", i + 1);
        log.info("      ServiceId: {}", service.getServiceId());
        log.info("      LibelleService: '{}'", service.getLibelleService());
        log.info("      Montant: {}", service.getMontant());
        log.info("      MontTaxe: {}", service.getMontTaxe());

        // Get service name
        String serviceName = service.getLibelleService();
        if (serviceName == null || serviceName.trim().isEmpty()) {
            serviceName = "Service " + (i + 1);
            log.warn("      ⚠️ LibelleService NULL - using fallback: {}", serviceName);
        }

        // Get amounts
        Double montant = (service.getMontant() != null ? service.getMontant() : 0.0);
        Double montTaxe = (service.getMontTaxe() != null ? service.getMontTaxe() : 0.0);

        // Skip if no amount
        if (montant <= 0) {
            log.warn("      ⚠️ SKIPPING - Montant is 0");
            continue;
        }

        // Calculate totals
        Double total = montant + montTaxe;

        log.info("      Calculated: HTVA={}, TVA={}, TTC={}",
            Math.round(montant),
            Math.round(montTaxe),
            Math.round(total));

        // Create item
        InvoiceItemDto item = new InvoiceItemDto();
        item.setItem_designation(serviceName);
        item.setItem_quantity("1");
        item.setItem_price(String.format("%.0f", Math.round(montant)));
        item.setItem_ct("0");
        item.setItem_tl("0");
        item.setItem_price_nvat(String.format("%.0f", Math.round(montant)));
        item.setVat(String.format("%.0f", Math.round(montTaxe)));
        item.setItem_price_wvat(String.format("%.0f", Math.round(total)));
        item.setItem_total_amount(String.format("%.0f", Math.round(total)));

        items.add(item);

        log.info("      ✅ Added: '{}' - {} BIF", serviceName, Math.round(total));
    }

    log.info("  ╔══════════════════════════════════════════════════════════════");
    log.info("  ║ buildInvoiceItems COMPLETED");
    log.info("  ║ Total items: {}", items.size());
    log.info("  ╚══════════════════════════════════════════════════════════════");

    return items;
}
