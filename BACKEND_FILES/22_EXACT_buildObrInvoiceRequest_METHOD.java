/**
 * REPLACE YOUR CURRENT buildObrInvoiceRequest METHOD WITH THIS
 *
 * Location: entries/service/FacServicePresteServiceImpl.java
 */

private AddInvoiceRequest buildObrInvoiceRequest(String numFacture, String lettreTransp) {
    log.info("Building OBR invoice request for: {}", numFacture);

    AddInvoiceRequest request = new AddInvoiceRequest();

    // 1. GET ALL SERVICE ITEMS FOR THIS INVOICE (CRITICAL CHANGE!)
    // OLD CODE (WRONG): Gets only 1 row
    // FacServicePreste service = facServicePresteRepository.findByNumFacture(numFacture);

    // NEW CODE (CORRECT): Gets ALL rows for this invoice
    List<FacServicePreste> allServiceItems = facServicePresteRepository
        .findAllWithServiceNameByNumFacture(numFacture);

    if (allServiceItems.isEmpty()) {
        throw new RuntimeException("No service items found for invoice " + numFacture);
    }

    log.info("Found {} service items for invoice {}", allServiceItems.size(), numFacture);

    // Use first item for invoice-level data (all items share same invoice data)
    FacServicePreste mainService = allServiceItems.get(0);

    // Get Dossier and Importer data
    Dossier dossier = dossierRepository.findById(1L)
        .orElseThrow(() -> new RuntimeException("Dossier not found"));

    Importer importer = null;
    if (mainService.getImportateurId() != null) {
        importer = importerRepository.findById(mainService.getImportateurId()).orElse(null);
    }

    // Set invoice identifiers
    request.setInvoice_number(numFacture);
    request.setInvoice_date(mainService.getDateValidation().format(
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
    ));

    // Build identifier
    String identifier = String.format("%s/ws%s/%s/%s",
        "4000155053",
        "400015505300958",
        mainService.getDateValidation().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")),
        numFacture
    );
    request.setInvoice_identifier(identifier);

    // Set fixed values
    request.setInvoice_type("FN");
    request.setTp_type("2");
    request.setTp_TIN("4000155053");
    request.setTp_trade_number("RC 85744");
    request.setPayment_type("1");
    request.setInvoice_currency("BIF");

    // Set company info from Dossier
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

    // Set customer info
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

    // Set cancellation fields (empty for validation)
    request.setCancelled_invoice_ref("");
    request.setCancelled_invoice("");
    request.setInvoice_ref("");
    request.setCn_motif("");

    // 2. BUILD INVOICE ITEMS - ONE FOR EACH SERVICE (CRITICAL CHANGE!)
    request.setInvoice_items(buildInvoiceItems(allServiceItems));

    log.info("OBR request built with {} items", request.getInvoice_items().size());

    return request;
}

/**
 * BUILD INVOICE ITEMS FROM ALL SERVICE ROWS
 * THIS IS THE KEY METHOD - Creates one item per service
 */
private List<InvoiceItemDto> buildInvoiceItems(List<FacServicePreste> allServiceItems) {
    List<InvoiceItemDto> items = new ArrayList<>();

    log.info("Building {} invoice items", allServiceItems.size());

    for (FacServicePreste service : allServiceItems) {
        if (service.getMontant() == null || service.getMontant() <= 0) {
            log.warn("Skipping service with zero montant");
            continue;
        }

        // Get service name from join (LibelleService field)
        String serviceName = service.getLibelleService();
        if (serviceName == null || serviceName.isEmpty()) {
            serviceName = "Service";
        }

        // Calculate amounts
        Double montantHTVA = service.getMontant();
        Double montTaxe = service.getMontTaxe() != null ? service.getMontTaxe() : 0.0;
        Double montRedev = service.getMontRedev() != null ? service.getMontRedev() : 0.0;
        Double montRedevTaxe = service.getMontRedevTaxe() != null ? service.getMontRedevTaxe() : 0.0;

        Double totalTVA = montTaxe + montRedev + montRedevTaxe;
        Double totalTTC = montantHTVA + totalTVA;

        // Create invoice item
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

        log.info("  Item: {} - HTVA: {}, TVA: {}, TTC: {}",
            serviceName, montantHTVA, totalTVA, totalTTC);
    }

    if (items.isEmpty()) {
        throw new RuntimeException("No valid service items to send to OBR");
    }

    return items;
}

/**
 * ALSO ADD THIS REPOSITORY METHOD
 * Location: FacServicePresteRepository.java
 */
@Query(value = "SELECT f.*, s.LibelleService " +
               "FROM FacServicePreste f " +
               "INNER JOIN FacService s ON f.ServiceId = s.ServiceId " +
               "WHERE f.NumFacture = :numFacture " +
               "ORDER BY f.ServicePresteId",
       nativeQuery = true)
List<FacServicePreste> findAllWithServiceNameByNumFacture(@Param("numFacture") String numFacture);
