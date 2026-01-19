package com.globalportservices.erp_be.servicepreste.service.impl;

import com.globalportservices.erp_be.obr.dto.*;
import com.globalportservices.erp_be.obr.service.EbmsClientService;
import com.globalportservices.erp_be.servicepreste.entity.FacServicePreste;
import com.globalportservices.erp_be.servicepreste.repository.FacServicePresteRepository;
import com.globalportservices.erp_be.settings.entity.Dossier;
import com.globalportservices.erp_be.settings.entity.Importer;
import com.globalportservices.erp_be.settings.repository.DossierRepository;
import com.globalportservices.erp_be.settings.repository.ImporterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service as SpringService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;

import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * FacServicePreste OBR Integration Service - FINAL VERSION
 *
 * Based on YOUR actual database structure:
 * - Table: FacServicePreste
 * - Service table: FacService (join on ServiceId)
 * - Service name: LibelleService
 */
@SpringService
@RequiredArgsConstructor
@Slf4j
public class FacServicePresteObrServiceImpl {

    private final FacServicePresteRepository facServicePresteRepository;
    private final EbmsClientService ebmsClientService;
    private final DossierRepository dossierRepository;
    private final ImporterRepository importerRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DATE_ONLY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * VALIDATE FAC SERVICE PRESTE WITH OBR INTEGRATION
     *
     * @param numFacture Invoice number (e.g., "SB17453/25")
     * @param lettreTransp Transport letter
     * @return First FacServicePreste row with OBR data updated
     */
    @Transactional
    public FacServicePreste validateWithOBR(String numFacture, String lettreTransp) {
        log.info("Validating FacServicePreste: numFacture={}", numFacture);

        // 1. Find ALL FacServicePreste rows for this invoice with service names
        // This executes: SELECT f.*, s.LibelleService FROM FacServicePreste f
        //                INNER JOIN FacService s ON f.ServiceId = s.ServiceId
        //                WHERE f.NumFacture = :numFacture
        List<FacServicePreste> allServiceItems = facServicePresteRepository.findAllWithServiceNameByNumFacture(numFacture);

        if (allServiceItems.isEmpty()) {
            throw new RuntimeException("No service items found for invoice " + numFacture);
        }

        log.info("Found {} service items for invoice {}", allServiceItems.size(), numFacture);

        // Log each service found
        for (int i = 0; i < allServiceItems.size(); i++) {
            FacServicePreste item = allServiceItems.get(i);
            log.info("  Service {}: {} - {} BIF",
                i+1,
                item.getLibelleService(),  // Service name from join
                item.getMontant()
            );
        }

        // Get the first item (they all share the same invoice data)
        FacServicePreste mainServicePreste = allServiceItems.get(0);

        // 2. Set validation date on ALL items
        LocalDateTime now = LocalDateTime.now();
        for (FacServicePreste sp : allServiceItems) {
            sp.setDateValidation(now);
            sp.setIsValid(true);
        }

        log.info("Set validation date for {} FacServicePreste items", allServiceItems.size());

        // 3. Submit to OBR
        try {
            // 3.1 Login to OBR
            log.info("=== Starting OBR submission for invoice {} ===", numFacture);
            log.info("Step 1: Logging into OBR");

            ObrLoginResponse loginResponse = ebmsClientService.login();

            if (!loginResponse.isSuccess()) {
                throw new RuntimeException("OBR authentication failed: " + loginResponse.getMessage());
            }

            String token = loginResponse.getToken();
            log.info("Step 1: OBR login successful, token received");

            // 3.2 Build invoice request with ALL service items
            log.info("Step 2: Building OBR invoice request with {} service items", allServiceItems.size());
            AddInvoiceRequest obrRequest = buildObrInvoiceRequest(mainServicePreste, allServiceItems);

            log.info("Step 2: OBR request built - Invoice: {}, Items: {}",
                obrRequest.getInvoice_number(),
                obrRequest.getInvoice_items().size());

            // Log each item being sent
            for (int i = 0; i < obrRequest.getInvoice_items().size(); i++) {
                InvoiceItemDto item = obrRequest.getInvoice_items().get(i);
                log.info("  OBR Item {}: {} - HTVA: {}, TVA: {}, TTC: {}",
                    i+1,
                    item.getItem_designation(),
                    item.getItem_price_nvat(),
                    item.getVat(),
                    item.getItem_total_amount());
            }

            // 3.3 Submit invoice to OBR
            log.info("Step 3: Submitting invoice to OBR");
            ObrInvoiceResponse obrResponse = ebmsClientService.addInvoice(obrRequest, token);

            if (obrResponse.isSuccess()) {
                // Success - save OBR data to ALL items
                for (FacServicePreste sp : allServiceItems) {
                    sp.setFactureSignature(obrResponse.getElectronic_signature());
                    sp.setSignatureCrypt(obrResponse.getQr_code());
                    sp.setStatusEnvoiOBR(1); // Sent successfully
                    sp.setDateEnvoiOBR(now);
                }

                log.info("✅ Step 3: OBR submission successful!");
                log.info("✅ Electronic signature: {}", obrResponse.getElectronic_signature());
                log.info("✅ Invoice registered number: {}", obrResponse.getInvoice_registered_number());
            } else {
                // Failed - mark all as failed
                for (FacServicePreste sp : allServiceItems) {
                    sp.setStatusEnvoiOBR(0);
                }
                throw new RuntimeException("OBR invoice submission failed: " + obrResponse.getMessage());
            }

        } catch (Exception e) {
            log.error("❌ Error submitting invoice {} to OBR", numFacture, e);

            // Check if it's a connection error
            if (isConnectionError(e)) {
                log.warn("⚠️ OBR connection error - invoice will be saved with PENDING status");

                // Set pending status on all items
                for (FacServicePreste sp : allServiceItems) {
                    sp.setFactureSignature("PENDING_OBR_RETRY");
                    sp.setStatusEnvoiOBR(0);
                }

                // Don't throw - allow validation to complete
            } else {
                // Non-connection error - mark as failed
                log.error("❌ Fatal OBR error - transaction will be rolled back");
                for (FacServicePreste sp : allServiceItems) {
                    sp.setStatusEnvoiOBR(0);
                }
                throw new RuntimeException("Failed to submit invoice to OBR: " + e.getMessage());
            }
        }

        // 4. Save ALL FacServicePreste items
        facServicePresteRepository.saveAll(allServiceItems);

        log.info("Invoice {} saved with {} items - statusEnvoiOBR: {}",
            numFacture,
            allServiceItems.size(),
            mainServicePreste.getStatusEnvoiOBR());

        return mainServicePreste;
    }

    /**
     * BUILD OBR INVOICE REQUEST
     * Maps each FacServicePreste row as a separate invoice_item
     */
    private AddInvoiceRequest buildObrInvoiceRequest(FacServicePreste mainItem, List<FacServicePreste> allItems) {
        log.debug("Building OBR request for invoice {}", mainItem.getNumFacture());

        AddInvoiceRequest request = new AddInvoiceRequest();

        // Get Dossier (company info)
        Dossier dossier = dossierRepository.findById(1L)
            .orElseThrow(() -> new RuntimeException("Dossier not found"));
        log.debug("Loaded Dossier: {}", dossier.getNomDossier());

        // Get Importer (customer info)
        Importer importer = null;
        if (mainItem.getImportateurId() != null) {
            importer = importerRepository.findById(mainItem.getImportateurId())
                .orElse(null);
        }

        // Set invoice identifiers
        request.setInvoice_number(mainItem.getNumFacture());
        request.setInvoice_date(mainItem.getDateValidation().format(DATE_FORMATTER));

        // Build invoice identifier
        String identifier = String.format("%s/ws%s/%s/%s",
            "4000155053",
            "400015505300958",
            mainItem.getDateValidation().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")),
            mainItem.getNumFacture()
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

        // Set customer info from Importer (or defaults)
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

        // Build invoice items from ALL FacServicePreste rows
        request.setInvoice_items(buildInvoiceItems(allItems));

        log.debug("OBR request built with {} items", request.getInvoice_items().size());
        return request;
    }

    /**
     * BUILD INVOICE ITEMS
     * Each FacServicePreste row becomes one invoice_item
     * Uses LibelleService from the join with FacService
     */
    private List<InvoiceItemDto> buildInvoiceItems(List<FacServicePreste> serviceItems) {
        List<InvoiceItemDto> items = new ArrayList<>();

        log.debug("Building {} invoice items", serviceItems.size());

        for (FacServicePreste sp : serviceItems) {
            if (sp.getMontant() == null || sp.getMontant() <= 0) {
                log.warn("Skipping service with zero/null montant: {}", sp.getLibelleService());
                continue;
            }

            // Service name already loaded from join
            String serviceName = sp.getLibelleService() != null ? sp.getLibelleService() : "Service";

            // Calculate amounts
            Double montantHTVA = sp.getMontant();  // Price without TVA
            Double montTaxe = sp.getMontTaxe() != null ? sp.getMontTaxe() : 0.0;
            Double montRedev = sp.getMontRedev() != null ? sp.getMontRedev() : 0.0;
            Double montRedevTaxe = sp.getMontRedevTaxe() != null ? sp.getMontRedevTaxe() : 0.0;

            // Total TVA = MontTaxe + MontRedev + MontRedevTaxe
            Double totalTVA = montTaxe + montRedev + montRedevTaxe;

            // Total TTC = Montant + Total TVA
            Double montantTTC = montantHTVA + totalTVA;

            InvoiceItemDto item = new InvoiceItemDto();
            item.setItem_designation(serviceName);
            item.setItem_quantity("1");
            item.setItem_price(String.format("%.0f", Math.round(montantHTVA)));
            item.setItem_ct("0");
            item.setItem_tl("0");
            item.setItem_price_nvat(String.format("%.0f", Math.round(montantHTVA)));
            item.setVat(String.format("%.0f", Math.round(totalTVA)));
            item.setItem_price_wvat(String.format("%.0f", Math.round(montantTTC)));
            item.setItem_total_amount(String.format("%.0f", Math.round(montantTTC)));

            items.add(item);

            log.debug("Added item: {} - HTVA: {}, TVA: {}, TTC: {}",
                serviceName, montantHTVA, totalTVA, montantTTC);
        }

        if (items.isEmpty()) {
            throw new RuntimeException("No valid service items found (all have zero montant)");
        }

        log.info("Built {} invoice items", items.size());
        return items;
    }

    /**
     * CHECK IF EXCEPTION IS A CONNECTION ERROR
     */
    private boolean isConnectionError(Exception e) {
        String message = e.getMessage() != null ? e.getMessage().toLowerCase() : "";

        boolean isConnError = e instanceof ResourceAccessException ||
               e instanceof ConnectException ||
               e instanceof SocketTimeoutException ||
               message.contains("connection") ||
               message.contains("timeout") ||
               message.contains("refused") ||
               message.contains("unreachable") ||
               message.contains("network") ||
               message.contains("failed to resolve");

        if (isConnError) {
            log.warn("Detected connection error: {}", e.getClass().getSimpleName());
        }

        return isConnError;
    }
}
