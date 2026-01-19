/**
 * ============================================
 * COMPLETE validate() METHOD
 * ============================================
 *
 * This method:
 * 1. Fetches ALL services for the invoice
 * 2. Sets DateValidation and IsValid for all
 * 3. Sends to OBR
 * 4. Updates ALL services with:
 *    - FactureSignature (from OBR)
 *    - StatusEnvoiOBR = 1
 *    - DateEnvoiOBR = now
 * 5. Saves ALL services to database
 *
 * REPLACE your validate() method with this
 */

@Transactional
public FacServicePreste validate(String numFacture, String lettreTransp) {

    log.info("╔════════════════════════════════════════════════════════════════════");
    log.info("║ VALIDATION STARTED");
    log.info("║ Invoice: {}", numFacture);
    log.info("║ LettreTransp: {}", lettreTransp);
    log.info("╚════════════════════════════════════════════════════════════════════");

    LocalDateTime now = LocalDateTime.now();
    log.info("Current timestamp: {}", now);

    // ============================================
    // STEP 1: Fetch ALL services for this invoice
    // ============================================
    log.info("▶ STEP 1: Fetching all services for invoice...");

    List<FacServicePreste> allServices = facServicePresteRepository
        .findAllWithServiceNameByNumFacture(numFacture);

    if (allServices == null || allServices.isEmpty()) {
        log.error("❌ No services found for invoice {}", numFacture);
        throw new RuntimeException("No services found for " + numFacture);
    }

    log.info("✅ Found {} services for invoice {}", allServices.size(), numFacture);

    // Log each service
    for (int i = 0; i < allServices.size(); i++) {
        FacServicePreste s = allServices.get(i);
        log.info("  Service #{}: ServicePresteId={}, LibelleService='{}', Montant={}",
            i + 1,
            s.getServicePresteId(),
            s.getLibelleService(),
            s.getMontant());
    }

    FacServicePreste mainService = allServices.get(0);

    // ============================================
    // STEP 2: Set validation fields for ALL services
    // ============================================
    log.info("▶ STEP 2: Setting validation fields for all services...");

    for (FacServicePreste s : allServices) {
        s.setDateValidation(now);
        s.setIsValid(true);
    }

    log.info("✅ All services marked as validated (DateValidation={}, IsValid=true)", now);

    // ============================================
    // STEP 3: Submit to OBR
    // ============================================
    log.info("▶ STEP 3: Submitting to OBR...");

    try {
        // Login to OBR
        log.info("  Logging in to OBR...");
        ObrLoginResponse loginResponse = ebmsClientService.login();

        if (!loginResponse.isSuccess()) {
            log.error("  ❌ OBR login failed!");
            throw new RuntimeException("OBR login failed");
        }

        log.info("  ✅ OBR login successful, token received");

        // Build OBR request
        log.info("  Building OBR invoice request...");
        AddInvoiceRequest obrRequest = buildObrInvoiceRequest(numFacture, lettreTransp);

        // Send to OBR
        log.info("  Sending invoice to OBR...");
        ObrInvoiceResponse obrResponse = ebmsClientService.addInvoice(obrRequest, loginResponse.getToken());

        // ============================================
        // STEP 4: Process OBR response
        // ============================================
        log.info("▶ STEP 4: Processing OBR response...");

        if (obrResponse.isSuccess()) {
            log.info("  ✅ OBR SUCCESS!");
            log.info("  Electronic signature: {}", obrResponse.getElectronic_signature());

            // Update ALL services with OBR data
            log.info("  Updating all {} services with OBR data...", allServices.size());

            for (int i = 0; i < allServices.size(); i++) {
                FacServicePreste s = allServices.get(i);

                s.setFactureSignature(obrResponse.getElectronic_signature());
                s.setStatusEnvoiOBR(1);              // ✅ OBR sent successfully
                s.setDateEnvoiOBR(now);              // ✅ Set current date/time

                log.info("    Service #{}: StatusEnvoiOBR=1, DateEnvoiOBR={}, Signature={}",
                    i + 1,
                    now,
                    obrResponse.getElectronic_signature().substring(0, Math.min(20, obrResponse.getElectronic_signature().length())) + "...");
            }

            log.info("  ✅ All services updated with OBR success data");

        } else {
            log.error("  ❌ OBR FAILED!");
            log.error("  Error message: {}", obrResponse.getMessage());

            // Set StatusEnvoiOBR = 0 for all services (failed)
            log.info("  Setting StatusEnvoiOBR=0 for all services (OBR failed)");

            for (FacServicePreste s : allServices) {
                s.setStatusEnvoiOBR(0);              // ❌ OBR failed
                // DateEnvoiOBR remains null (not sent)
            }

            throw new RuntimeException("OBR failed: " + obrResponse.getMessage());
        }

    } catch (Exception e) {
        log.error("❌ Exception during OBR submission", e);

        // Set StatusEnvoiOBR = 0 for all services (error)
        log.info("  Setting StatusEnvoiOBR=0 for all services (exception occurred)");

        for (FacServicePreste s : allServices) {
            s.setStatusEnvoiOBR(0);                  // ❌ Error
            // DateEnvoiOBR remains null
        }

        // Re-throw exception
        throw new RuntimeException("OBR submission failed: " + e.getMessage(), e);
    }

    // ============================================
    // STEP 5: Save ALL services to database
    // ============================================
    log.info("▶ STEP 5: Saving all services to database...");

    List<FacServicePreste> savedServices = facServicePresteRepository.saveAll(allServices);

    log.info("✅ Saved {} services to database", savedServices.size());

    // Log saved data for verification
    for (int i = 0; i < savedServices.size(); i++) {
        FacServicePreste s = savedServices.get(i);
        log.info("  Service #{}: ServicePresteId={}, StatusEnvoiOBR={}, DateEnvoiOBR={}, FactureSignature={}",
            i + 1,
            s.getServicePresteId(),
            s.getStatusEnvoiOBR(),
            s.getDateEnvoiOBR(),
            s.getFactureSignature() != null ? "SET" : "NULL");
    }

    log.info("╔════════════════════════════════════════════════════════════════════");
    log.info("║ VALIDATION COMPLETED SUCCESSFULLY");
    log.info("║ Invoice: {}", numFacture);
    log.info("║ Services validated: {}", savedServices.size());
    log.info("║ StatusEnvoiOBR: 1 (success)");
    log.info("║ DateEnvoiOBR: {}", now);
    log.info("╚════════════════════════════════════════════════════════════════════");

    // Return main service (for backward compatibility)
    return mainService;
}
