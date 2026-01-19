package com.globalportservices.erp_be.servicepreste.service.impl;

import com.globalportservices.erp_be.obr.dto.*;
import com.globalportservices.erp_be.obr.service.EbmsClientService;
import com.globalportservices.erp_be.servicepreste.entity.ServicePreste;
import com.globalportservices.erp_be.servicepreste.entity.ServicePresteDetail;  // NEW - detail table
import com.globalportservices.erp_be.servicepreste.repository.ServicePresteRepository;
import com.globalportservices.erp_be.servicepreste.repository.ServicePresteDetailRepository;  // NEW
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
 * ServicePreste OBR Integration Service - FIXED VERSION
 *
 * Properly handles multiple service items from ServicePresteDetail table
 */
@SpringService
@RequiredArgsConstructor
@Slf4j
public class ServicePresteObrServiceImpl {

    private final ServicePresteRepository servicePresteRepository;
    private final ServicePresteDetailRepository servicePresteDetailRepository;  // NEW - for service details
    private final EbmsClientService ebmsClientService;
    private final DossierRepository dossierRepository;
    private final ImporterRepository importerRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DATE_ONLY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * VALIDATE SERVICE PRESTE WITH OBR INTEGRATION
     */
    @Transactional
    public ServicePreste validateWithOBR(String numFacture, String lettreTransp) {
        log.info("Validating ServicePreste: numFacture={}, lettreTransp={}", numFacture, lettreTransp);

        // 1. Find ServicePreste
        ServicePreste servicePreste = servicePresteRepository.findByNumFactureAndLettreTransp(numFacture, lettreTransp)
            .orElseThrow(() -> new RuntimeException("ServicePreste not found"));

        log.info("Found ServicePreste: id={}, customer={}", servicePreste.getServicePresteId(),
                 servicePreste.getImportateurId());

        // 2. Find ALL service details for this invoice
        List<ServicePresteDetail> serviceDetails = servicePresteDetailRepository
            .findByNumFactureOrLettreTransp(numFacture, lettreTransp);

        if (serviceDetails.isEmpty()) {
            throw new RuntimeException("No service details found for invoice " + numFacture);
        }

        log.info("Found {} service items for invoice {}", serviceDetails.size(), numFacture);

        // 3. Set validation date
        servicePreste.setDateValidation(LocalDateTime.now());
        servicePreste.setIsValid(true);
        log.info("Set validation date for ServicePreste {}", numFacture);

        // 4. Submit to OBR
        try {
            // 4.1 Login to OBR
            log.info("=== Starting OBR submission for ServicePreste {} ===", numFacture);
            log.info("Step 1: Logging into OBR");

            ObrLoginResponse loginResponse = ebmsClientService.login();

            if (!loginResponse.isSuccess()) {
                throw new RuntimeException("OBR authentication failed: " + loginResponse.getMessage());
            }

            String token = loginResponse.getToken();
            log.info("Step 1: OBR login successful, token received");

            // 4.2 Build invoice request with ALL service details as items
            log.info("Step 2: Building OBR invoice request with {} service items", serviceDetails.size());
            AddInvoiceRequest obrRequest = buildObrInvoiceRequest(servicePreste, serviceDetails);
            log.info("Step 2: OBR request built - Invoice number: {}, Items count: {}",
                obrRequest.getInvoice_number(),
                obrRequest.getInvoice_items().size());

            // Log all items
            for (int i = 0; i < obrRequest.getInvoice_items().size(); i++) {
                InvoiceItemDto item = obrRequest.getInvoice_items().get(i);
                log.info("  Item {}: {} - {} BIF", i+1, item.getItem_designation(), item.getItem_total_amount());
            }

            // 4.3 Submit invoice to OBR
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

        // 5. Save ServicePreste
        ServicePreste savedServicePreste = servicePresteRepository.save(servicePreste);
        log.info("ServicePreste {} saved with factureSignature: {} and statusEnvoiOBR: {}",
            savedServicePreste.getNumFacture(),
            savedServicePreste.getFactureSignature(),
            savedServicePreste.getStatusEnvoiOBR());

        return savedServicePreste;
    }

    /**
     * BUILD OBR INVOICE REQUEST FROM SERVICE PRESTE
     */
    private AddInvoiceRequest buildObrInvoiceRequest(ServicePreste servicePreste, List<ServicePresteDetail> serviceDetails) {
        log.debug("Building OBR request for ServicePreste {}", servicePreste.getNumFacture());

        AddInvoiceRequest request = new AddInvoiceRequest();

        // Get Dossier (company info)
        Dossier dossier = dossierRepository.findById(1L)
            .orElseThrow(() -> new RuntimeException("Dossier not found"));
        log.debug("Loaded Dossier: {}", dossier.getNomDossier());

        // Get Importer (customer info)
        Importer importer = null;
        if (servicePreste.getImportateurId() != null) {
            importer = importerRepository.findById(servicePreste.getImportateurId())
                .orElse(null);
        }

        // Set invoice identifiers
        request.setInvoice_number(servicePreste.getNumFacture());
        request.setInvoice_date(servicePreste.getDateValidation().format(DATE_FORMATTER));

        // Build invoice identifier
        String identifier = String.format("%s/ws%s/%s/%s",
            "4000155053",
            "400015505300958",
            servicePreste.getDateValidation().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")),
            servicePreste.getNumFacture()
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

        // Build invoice items from ALL service details
        request.setInvoice_items(buildInvoiceItems(servicePreste, serviceDetails));

        log.debug("OBR request built successfully with {} items", request.getInvoice_items().size());
        return request;
    }

    /**
     * BUILD INVOICE ITEMS FROM SERVICE DETAILS
     * Maps EACH service detail record as a separate invoice_item
     */
    private List<InvoiceItemDto> buildInvoiceItems(ServicePreste servicePreste, List<ServicePresteDetail> serviceDetails) {
        List<InvoiceItemDto> items = new ArrayList<>();

        log.debug("Building {} invoice items for ServicePreste {}", serviceDetails.size(), servicePreste.getNumFacture());

        // Check if exonerated from tax (exonéré de taxe checkbox)
        boolean isExonere = servicePreste.getTaxe() != null && servicePreste.getTaxe();
        double tvaRate = isExonere ? 0.0 : 18.0; // 0% if exonerated, 18% otherwise

        log.debug("Tax status: exonéré={}, TVA rate={}%", isExonere, tvaRate);

        // Map each service detail to an invoice item
        for (ServicePresteDetail detail : serviceDetails) {
            if (detail.getMontant() != null && detail.getMontant() > 0) {
                InvoiceItemDto item = buildServiceItem(
                    detail.getServiceName(),  // Service name from detail
                    detail.getMontant(),       // Amount from detail
                    tvaRate
                );
                items.add(item);
                log.debug("Added service: {} - {} BIF", detail.getServiceName(), detail.getMontant());
            }
        }

        // If no items were added, throw error
        if (items.isEmpty()) {
            throw new RuntimeException("No service items with amount > 0 found for ServicePreste " + servicePreste.getNumFacture());
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
        item.setItem_price(String.format("%.0f", Math.round(priceWithoutVat)));
        item.setItem_ct("0");
        item.setItem_tl("0");
        item.setItem_price_nvat(String.format("%.0f", Math.round(priceWithoutVat)));
        item.setVat(String.format("%.0f", Math.round(vatAmount)));
        item.setItem_price_wvat(String.format("%.0f", Math.round(montant)));
        item.setItem_total_amount(String.format("%.0f", Math.round(montant)));

        return item;
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

/**
 * NEW ENTITY: ServicePresteDetail
 * Represents individual service line items
 */
@Entity
@Table(name = "service_preste_details")  // Or whatever your table name is
@Data
class ServicePresteDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numFacture;       // Links to ServicePreste
    private String lettreTransp;     // Links to ServicePreste
    private String serviceName;      // e.g., "PEAGE CAMION REMORQUE", "PEAGE SCANNER", etc.
    private Double montant;          // Amount for this service
    private Integer serviceId;       // Optional: links to Service master table
}

/**
 * NEW REPOSITORY: ServicePresteDetailRepository
 */
@Repository
interface ServicePresteDetailRepository extends JpaRepository<ServicePresteDetail, Long> {

    /**
     * Find all service details for a given invoice
     */
    @Query("SELECT d FROM ServicePresteDetail d WHERE d.numFacture = :numFacture OR d.lettreTransp = :lettreTransp")
    List<ServicePresteDetail> findByNumFactureOrLettreTransp(
        @Param("numFacture") String numFacture,
        @Param("lettreTransp") String lettreTransp
    );
}
