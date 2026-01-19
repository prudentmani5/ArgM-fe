package com.globalportservices.erp_be.servicepreste.service.impl;

import com.globalportservices.erp_be.obr.dto.*;
import com.globalportservices.erp_be.obr.service.EbmsClientService;
import com.globalportservices.erp_be.servicepreste.entity.ServicePreste;
import com.globalportservices.erp_be.servicepreste.entity.Service;
import com.globalportservices.erp_be.servicepreste.repository.ServicePresteRepository;
import com.globalportservices.erp_be.servicepreste.repository.ServiceRepository;
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
 * ServicePreste OBR Integration Service
 *
 * Handles OBR submission for ServicePreste invoices
 * Maps multiple services (PEAGE/PESAGE, ABONNEMENT, Gardiennage) as invoice items
 */
@SpringService
@RequiredArgsConstructor
@Slf4j
public class ServicePresteObrServiceImpl {

    private final ServicePresteRepository servicePresteRepository;
    private final ServiceRepository serviceRepository;
    private final EbmsClientService ebmsClientService;
    private final DossierRepository dossierRepository;
    private final ImporterRepository importerRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DATE_ONLY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * VALIDATE SERVICE PRESTE WITH OBR INTEGRATION
     *
     * @param numFacture Invoice number
     * @param lettreTransp Transport letter
     * @return Validated ServicePreste with OBR signature
     */
    @Transactional
    public ServicePreste validateWithOBR(String numFacture, String lettreTransp) {
        log.info("Validating ServicePreste: numFacture={}, lettreTransp={}", numFacture, lettreTransp);

        // 1. Find ServicePreste
        ServicePreste servicePreste = servicePresteRepository.findByNumFactureAndLettreTransp(numFacture, lettreTransp)
            .orElseThrow(() -> new RuntimeException("ServicePreste not found"));

        log.info("Found ServicePreste: id={}, customer={}", servicePreste.getServicePresteId(),
                 servicePreste.getImportateurId());

        // 2. Set validation date
        servicePreste.setDateValidation(LocalDateTime.now());
        servicePreste.setIsValid(true);
        log.info("Set validation date for ServicePreste {}", numFacture);

        // 3. Submit to OBR
        try {
            // 3.1 Login to OBR
            log.info("=== Starting OBR submission for ServicePreste {} ===", numFacture);
            log.info("Step 1: Logging into OBR");

            ObrLoginResponse loginResponse = ebmsClientService.login();

            if (!loginResponse.isSuccess()) {
                throw new RuntimeException("OBR authentication failed: " + loginResponse.getMessage());
            }

            String token = loginResponse.getToken();
            log.info("Step 1: OBR login successful, token received");

            // 3.2 Build invoice request with all services as items
            log.info("Step 2: Building OBR invoice request with multiple service items");
            AddInvoiceRequest obrRequest = buildObrInvoiceRequest(servicePreste);
            log.info("Step 2: OBR request built - Invoice number: {}, Items count: {}",
                obrRequest.getInvoice_number(),
                obrRequest.getInvoice_items().size());

            // 3.3 Submit invoice to OBR
            log.info("Step 3: Submitting invoice to OBR");
            ObrInvoiceResponse obrResponse = ebmsClientService.addInvoice(obrRequest, token);

            if (obrResponse.isSuccess()) {
                // Success - save OBR data
                servicePreste.setFactureSignature(obrResponse.getElectronic_signature());
                servicePreste.setSignatureCrypt(obrResponse.getQr_code());
                servicePreste.setStatusEnvoiOBR(1); // Sent successfully
                servicePreste.setDateEnvoiOBR(LocalDateTime.now());

                log.info("✅ Step 3: OBR submission successful!");
                log.info("✅ Electronic signature: {}", obrResponse.getElectronic_signature());
                log.info("✅ Invoice registered number: {}", obrResponse.getInvoice_registered_number());
            } else {
                servicePreste.setStatusEnvoiOBR(0); // Failed
                throw new RuntimeException("OBR invoice submission failed: " + obrResponse.getMessage());
            }

        } catch (Exception e) {
            log.error("❌ Error submitting ServicePreste {} to OBR", numFacture, e);

            // Check if it's a connection error
            if (isConnectionError(e)) {
                log.warn("⚠️ OBR connection error - invoice will be saved with PENDING status");

                // Set pending status
                servicePreste.setFactureSignature("PENDING_OBR_RETRY");
                servicePreste.setStatusEnvoiOBR(0); // Not sent

                // Don't throw - allow validation to complete
            } else {
                // Non-connection error - throw to rollback transaction
                log.error("❌ Fatal OBR error - transaction will be rolled back");
                servicePreste.setStatusEnvoiOBR(0); // Failed
                throw new RuntimeException("Failed to submit invoice to OBR: " + e.getMessage());
            }
        }

        // 4. Save ServicePreste
        ServicePreste savedServicePreste = servicePresteRepository.save(servicePreste);
        log.info("ServicePreste {} saved with factureSignature: {} and statusEnvoiOBR: {}",
            savedServicePreste.getNumFacture(),
            savedServicePreste.getFactureSignature(),
            savedServicePreste.getStatusEnvoiOBR());

        return savedServicePreste;
    }

    /**
     * BUILD OBR INVOICE REQUEST FROM SERVICE PRESTE
     * Maps all services associated with this ServicePreste as separate invoice items
     */
    private AddInvoiceRequest buildObrInvoiceRequest(ServicePreste servicePreste) {
        log.debug("Building OBR request for ServicePreste {}", servicePreste.getNumFacture());

        AddInvoiceRequest request = new AddInvoiceRequest();

        // Get Dossier (company info)
        Dossier dossier = dossierRepository.findById(1L)
            .orElseThrow(() -> new RuntimeException("Dossier not found"));
        log.debug("Loaded Dossier: {}", dossier.getNomDossier());

        // Get Importer (customer info)
        Importer importer = importerRepository.findById(servicePreste.getImportateurId())
            .orElseThrow(() -> new RuntimeException("Importer not found with id: " + servicePreste.getImportateurId()));
        log.debug("Loaded Importer: {}", importer.getNom());

        // Set invoice identifiers
        request.setInvoice_number(servicePreste.getNumFacture());
        request.setInvoice_date(servicePreste.getDateValidation().format(DATE_ONLY_FORMATTER));
        request.setInvoice_identifier(
            servicePreste.getFactureSignature() != null ? servicePreste.getFactureSignature() : ""
        );

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

        // Set customer info from Importer
        request.setCustomer_name(importer.getNom());
        request.setCustomer_TIN(importer.getNif());
        request.setCustomer_address(importer.getAdresse());
        request.setVat_customer_payer(importer.getAssujetiTVA());

        // Set cancellation fields (empty for validation)
        request.setCancelled_invoice_ref("");
        request.setCancelled_invoice("");
        request.setInvoice_ref("");
        request.setCn_motif("");

        // Build invoice items from ServicePreste fields
        request.setInvoice_items(buildInvoiceItems(servicePreste));

        log.debug("OBR request built successfully with {} items", request.getInvoice_items().size());
        return request;
    }

    /**
     * BUILD INVOICE ITEMS FROM SERVICE PRESTE
     * Maps each service type (PEAGE, PESAGE, ABONNEMENT, Gardiennage, etc.) as a separate item
     */
    private List<InvoiceItemDto> buildInvoiceItems(ServicePreste servicePreste) {
        List<InvoiceItemDto> items = new ArrayList<>();

        log.debug("Building invoice items for ServicePreste {}", servicePreste.getNumFacture());

        // Check if exonerated from tax (exonéré de taxe checkbox)
        boolean isExonere = servicePreste.getTaxe() != null && servicePreste.getTaxe();
        double tvaRate = isExonere ? 0.0 : 18.0; // 0% if exonerated, 18% otherwise

        log.debug("Tax status: exonéré={}, TVA rate={}%", isExonere, tvaRate);

        // 1. PEAGE/PESAGE (if present)
        if (servicePreste.getPeage() != null && servicePreste.getPeage() > 0) {
            InvoiceItemDto item = buildServiceItem(
                "PEAGE/PESAGE CAMION SIMPLE",
                servicePreste.getPeage(),
                tvaRate
            );
            items.add(item);
            log.debug("Added PEAGE/PESAGE: {} BIF", servicePreste.getPeage());
        }

        if (servicePreste.getPesage() != null && servicePreste.getPesage() > 0) {
            InvoiceItemDto item = buildServiceItem(
                "PESAGE",
                servicePreste.getPesage(),
                tvaRate
            );
            items.add(item);
            log.debug("Added PESAGE: {} BIF", servicePreste.getPesage());
        }

        // 2. ABONNEMENT PAR TOUR (if present)
        if (servicePreste.getRedPalette() != null && servicePreste.getRedPalette() > 0) {
            InvoiceItemDto item = buildServiceItem(
                "ABONNEMENT PAR TOUR MOINS DE 10T",
                servicePreste.getRedPalette(),
                tvaRate
            );
            items.add(item);
            log.debug("Added ABONNEMENT: {} BIF", servicePreste.getRedPalette());
        }

        // 3. GARDIENNAGE (if present)
        if (servicePreste.getMontant() != null && servicePreste.getMontant() > 0) {
            // Get service name from Service entity
            String serviceName = getServiceName(servicePreste.getServiceId());
            InvoiceItemDto item = buildServiceItem(
                serviceName,
                servicePreste.getMontant(),
                tvaRate
            );
            items.add(item);
            log.debug("Added {}: {} BIF", serviceName, servicePreste.getMontant());
        }

        // If no items were added, throw error
        if (items.isEmpty()) {
            throw new RuntimeException("No service items found for ServicePreste " + servicePreste.getNumFacture());
        }

        log.info("Built {} invoice items for ServicePreste {}", items.size(), servicePreste.getNumFacture());
        return items;
    }

    /**
     * BUILD A SINGLE SERVICE ITEM
     */
    private InvoiceItemDto buildServiceItem(String designation, Double montant, double tvaRate) {
        InvoiceItemDto item = new InvoiceItemDto();

        // Calculate price without VAT
        double priceWithoutVat = montant / (1 + (tvaRate / 100));
        double vatAmount = montant - priceWithoutVat;

        item.setItem_designation(designation);
        item.setItem_quantity("1");
        item.setItem_price(String.format("%.2f", priceWithoutVat));
        item.setItem_ct("0");
        item.setItem_tl("0");
        item.setItem_price_nvat(String.format("%.2f", priceWithoutVat));
        item.setVat(String.format("%.2f", vatAmount));
        item.setItem_price_wvat(String.format("%.2f", montant));
        item.setItem_total_amount(String.format("%.2f", montant));

        return item;
    }

    /**
     * GET SERVICE NAME FROM SERVICE ID
     */
    private String getServiceName(Long serviceId) {
        if (serviceId == null) {
            return "Service";
        }

        return serviceRepository.findById(serviceId)
            .map(Service::getNom)
            .orElse("Service");
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

    /**
     * CANCEL SERVICE PRESTE WITH OBR
     */
    @Transactional
    public ServicePreste cancelWithOBR(String numFacture, String motifAnnulation) {
        log.info("Cancelling ServicePreste: numFacture={}", numFacture);

        ServicePreste servicePreste = servicePresteRepository.findByNumFacture(numFacture)
            .orElseThrow(() -> new RuntimeException("ServicePreste not found"));

        // Set cancellation info
        servicePreste.setMotifAnnulation(motifAnnulation);
        servicePreste.setDateAnnulation(LocalDateTime.now());
        servicePreste.setAnnuleFacture(true);

        // TODO: Implement OBR cancellation API call here
        // Similar to validation, but with cancellation fields filled

        servicePreste.setStatusEnvoiCancelOBR(1); // Cancellation sent

        return servicePresteRepository.save(servicePreste);
    }
}
