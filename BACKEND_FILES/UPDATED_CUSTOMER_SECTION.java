/**
 * ============================================
 * UPDATED CUSTOMER SECTION
 * ============================================
 *
 * This section fetches Importer dynamically based on FacServicePreste.importateurId
 *
 * REPLACE the customer section in your buildObrInvoiceRequest method with this
 */

// ============================================
// STEP 3: Set customer (importer) information - DYNAMIC
// ============================================
log.info("▶ STEP 3: Setting customer information...");
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
            log.warn("  ⚠️ Importer with ID {} not found in database!", mainService.getImportateurId());
        }
    } catch (Exception e) {
        log.error("  ❌ Error fetching Importer", e);
    }
} else {
    log.info("  ℹ ImportateurId is NULL - using default 'Client'");
}

// Set customer fields in request
if (importer != null) {
    log.info("  Setting customer from Importer data:");

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
    log.info("  Setting default customer (no Importer):");

    request.setCustomer_name("Client");
    request.setCustomer_TIN("");
    request.setCustomer_address("");
    request.setVat_customer_payer("0");

    log.info("    customer_name: Client");
    log.info("    customer_TIN: (empty)");
    log.info("    customer_address: (empty)");
    log.info("    vat_customer_payer: 0");
}

log.info("  ✅ Customer information set");
