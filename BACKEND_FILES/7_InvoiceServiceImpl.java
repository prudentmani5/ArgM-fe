package com.globalportservices.erp_be.invoice.service.impl;

import com.globalportservices.erp_be.invoice.entity.Invoice;
import com.globalportservices.erp_be.invoice.repository.InvoiceRepository;
import com.globalportservices.erp_be.invoice.service.InvoiceService;
import com.globalportservices.erp_be.obr.dto.*;
import com.globalportservices.erp_be.obr.service.EbmsClientService;
import com.globalportservices.erp_be.settings.entity.Dossier;
import com.globalportservices.erp_be.settings.entity.Importer;
import com.globalportservices.erp_be.settings.repository.DossierRepository;
import com.globalportservices.erp_be.settings.repository.ImporterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;

import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Invoice Service Implementation with OBR Integration
 *
 * UPDATE YOUR EXISTING InvoiceServiceImpl with this validate() method
 * Location: invoice/service/impl/InvoiceServiceImpl.java
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final EbmsClientService ebmsClientService;
    private final DossierRepository dossierRepository;
    private final ImporterRepository importerRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * VALIDATE INVOICE WITH OBR INTEGRATION
     *
     * @param id Invoice ID (factureSortieId)
     * @param request Validation request with motifAnnulation
     * @return Validated invoice with OBR signature
     */
    @Override
    @Transactional
    public Invoice validate(Long id, InvoiceValidationRequest request) {
        log.info("Validating invoice with ID: {}", id);

        // 1. Find invoice
        Invoice invoice = invoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));

        log.info("Found invoice: sortieId={}, rsp={}", invoice.getSortieId(), invoice.getRsp());

        // 2. Check if cancellation
        if (request.getMotifAnnulation() != null && !request.getMotifAnnulation().isEmpty()) {
            log.info("Cancelling invoice {} with reason: {}", invoice.getSortieId(), request.getMotifAnnulation());

            invoice.setMotifAnnulation(request.getMotifAnnulation());
            invoice.setDateAnnulation(LocalDateTime.now());
            invoice.setUserAnnulation(request.getCancelledBy());

            return invoiceRepository.save(invoice);
        }

        // 3. VALIDATION FLOW - Set validation date
        invoice.setDateValidation(LocalDateTime.now());
        log.info("Set validation date for invoice {}", invoice.getSortieId());

        // 4. Submit to OBR
        try {
            // 4.1 Login to OBR
            log.info("=== Starting OBR submission for invoice {} ===", invoice.getSortieId());
            log.info("Step 1: Logging into OBR");

            ObrLoginResponse loginResponse = ebmsClientService.login();

            if (!loginResponse.isSuccess()) {
                throw new RuntimeException("OBR authentication failed: " + loginResponse.getMessage());
            }

            String token = loginResponse.getToken();
            log.info("Step 1: OBR login successful, token received");

            // 4.2 Build invoice request
            log.info("Step 2: Building OBR invoice request");
            AddInvoiceRequest obrRequest = buildObrInvoiceRequest(invoice);
            log.info("Step 2: OBR request built - Invoice number: {}, Customer: {}",
                obrRequest.getInvoice_number(),
                obrRequest.getCustomer_name());

            // 4.3 Submit invoice to OBR
            log.info("Step 3: Submitting invoice to OBR");
            ObrInvoiceResponse obrResponse = ebmsClientService.addInvoice(obrRequest, token);

            if (obrResponse.isSuccess()) {
                // Success - save OBR signature
                invoice.setFactureSignature(obrResponse.getElectronic_signature());
                log.info("✅ Step 3: OBR submission successful!");
                log.info("✅ Electronic signature: {}", obrResponse.getElectronic_signature());
                log.info("✅ Invoice registered number: {}", obrResponse.getInvoice_registered_number());
            } else {
                throw new RuntimeException("OBR invoice submission failed: " + obrResponse.getMessage());
            }

        } catch (Exception e) {
            log.error("❌ Error submitting invoice {} to OBR", invoice.getSortieId(), e);

            // Check if it's a connection error
            if (isConnectionError(e)) {
                log.warn("⚠️ OBR connection error - invoice will be saved with PENDING status");
                log.warn("⚠️ This invoice will be retried automatically");

                // Set pending status - will be retried by scheduled task
                invoice.setFactureSignature("PENDING_OBR_RETRY");

                // Don't throw - allow validation to complete
            } else {
                // Non-connection error - throw to rollback transaction
                log.error("❌ Fatal OBR error - transaction will be rolled back");
                throw new RuntimeException("Failed to submit invoice to OBR: " + e.getMessage());
            }
        }

        // 5. Save invoice
        Invoice savedInvoice = invoiceRepository.save(invoice);
        log.info("Invoice {} saved with factureSignature: {}",
            savedInvoice.getSortieId(),
            savedInvoice.getFactureSignature());

        return savedInvoice;
    }

    /**
     * BUILD OBR INVOICE REQUEST FROM INVOICE ENTITY
     */
    private AddInvoiceRequest buildObrInvoiceRequest(Invoice invoice) {
        log.debug("Building OBR request for invoice {}", invoice.getSortieId());

        AddInvoiceRequest request = new AddInvoiceRequest();

        // Get Dossier (company info)
        Dossier dossier = dossierRepository.findById(1L)
            .orElseThrow(() -> new RuntimeException("Dossier not found"));
        log.debug("Loaded Dossier: {}", dossier.getNomDossier());

        // Get Importer (customer info)
        Importer importer = importerRepository.findById(invoice.getClientId())
            .orElseThrow(() -> new RuntimeException("Importer not found with id: " + invoice.getClientId()));
        log.debug("Loaded Importer: {}", importer.getNom());

        // Set invoice identifiers
        request.setInvoice_number(invoice.getSortieId());
        request.setInvoice_date(invoice.getDateValidation().format(DATE_FORMATTER));
        request.setInvoice_identifier(invoice.getFactureSignature() != null ? invoice.getFactureSignature() : "");

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

        // Build invoice items
        request.setInvoice_items(buildInvoiceItems(invoice));

        log.debug("OBR request built successfully");
        return request;
    }

    /**
     * BUILD INVOICE ITEMS
     */
    private List<InvoiceItemDto> buildInvoiceItems(Invoice invoice) {
        List<InvoiceItemDto> items = new ArrayList<>();
        InvoiceItemDto item = new InvoiceItemDto();

        // Get merchandise name
        String merchandiseName = getMerchandiseName(invoice.getMarchandiseId());
        item.setItem_designation(merchandiseName);
        item.setItem_quantity("1");

        // Calculate prices
        Double montantTotal = invoice.getMontantPaye(); // Total with TVA
        Double tvaRate = calculateTvaRate(invoice);     // Get TVA rate
        Double priceWithoutVat = montantTotal / (1 + (tvaRate / 100));

        item.setItem_price(String.format("%.2f", priceWithoutVat));
        item.setItem_price_nvat(String.format("%.2f", priceWithoutVat));
        item.setItem_ct("0");
        item.setItem_tl("0");
        item.setVat(String.format("%.2f", tvaRate));
        item.setItem_price_wvat(String.format("%.2f", montantTotal));
        item.setItem_total_amount(String.format("%.2f", montantTotal));

        items.add(item);

        log.debug("Built invoice item: {} - Total: {}", merchandiseName, montantTotal);
        return items;
    }

    /**
     * GET MERCHANDISE NAME FROM ID
     */
    private String getMerchandiseName(Long marchandiseId) {
        // TODO: Implement based on your Marchandise repository
        // Example:
        // return marchandiseRepository.findById(marchandiseId)
        //     .map(Marchandise::getNom)
        //     .orElse("Marchandise");

        return "Marchandise"; // Placeholder
    }

    /**
     * CALCULATE TVA RATE FROM INVOICE
     */
    private Double calculateTvaRate(Invoice invoice) {
        if (invoice.getMontantPaye() == null || invoice.getMontTotalManut() == null) {
            return 18.0; // Default TVA
        }

        Double totalWithVat = invoice.getMontantPaye();
        Double totalWithoutVat = invoice.getMontTotalManut();

        if (totalWithoutVat == 0) {
            return 18.0;
        }

        // Calculate TVA rate
        Double tva = ((totalWithVat - totalWithoutVat) / totalWithoutVat) * 100;
        return Math.round(tva * 100.0) / 100.0;
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
               message.contains("network");

        if (isConnError) {
            log.warn("Detected connection error: {}", e.getClass().getSimpleName());
        }

        return isConnError;
    }
}
