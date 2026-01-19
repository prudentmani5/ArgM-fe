package com.globalportservices.erp_be.entries.service;

import com.globalportservices.erp_be.obr.dto.*;
import com.globalportservices.erp_be.obr.service.EbmsClientService;
import com.globalportservices.erp_be.entries.entity.FacServicePreste;
import com.globalportservices.erp_be.entries.repository.FacServicePresteRepository;
import com.globalportservices.erp_be.settings.entity.Dossier;
import com.globalportservices.erp_be.settings.entity.Importer;
import com.globalportservices.erp_be.settings.repository.DossierRepository;
import com.globalportservices.erp_be.settings.repository.ImporterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * COMPLETE FIXED VERSION - COPY THIS ENTIRE FILE
 * Replace your existing FacServicePresteServiceImpl with this
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FacServicePresteServiceImpl {

    private final FacServicePresteRepository facServicePresteRepository;
    private final EbmsClientService ebmsClientService;
    private final DossierRepository dossierRepository;
    private final ImporterRepository importerRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * VALIDATE WITH OBR
     */
    @Transactional
    public FacServicePreste validate(String numFacture, String lettreTransp) {
        log.info("=== Validating: {} ===", numFacture);

        // GET ALL SERVICES
        List<FacServicePreste> allServices = facServicePresteRepository
            .findAllWithServiceNameByNumFacture(numFacture);

        if (allServices.isEmpty()) {
            throw new RuntimeException("No services found for " + numFacture);
        }

        log.info("Found {} services", allServices.size());

        FacServicePreste mainService = allServices.get(0);
        LocalDateTime now = LocalDateTime.now();

        for (FacServicePreste s : allServices) {
            s.setDateValidation(now);
            s.setIsValid(true);
        }

        // SUBMIT TO OBR
        try {
            ObrLoginResponse loginResponse = ebmsClientService.login();
            if (!loginResponse.isSuccess()) {
                throw new RuntimeException("OBR login failed");
            }

            AddInvoiceRequest obrRequest = buildObrInvoiceRequest(numFacture, lettreTransp);
            ObrInvoiceResponse obrResponse = ebmsClientService.addInvoice(obrRequest, loginResponse.getToken());

            if (obrResponse.isSuccess()) {
                for (FacServicePreste s : allServices) {
                    s.setFactureSignature(obrResponse.getElectronic_signature());
                    s.setStatusEnvoiOBR(1);
                    s.setDateEnvoiOBR(now);
                }
                log.info("✅ OBR success!");
            } else {
                throw new RuntimeException("OBR failed: " + obrResponse.getMessage());
            }
        } catch (Exception e) {
            log.error("❌ OBR error", e);
            for (FacServicePreste s : allServices) {
                s.setStatusEnvoiOBR(0);
            }
        }

        facServicePresteRepository.saveAll(allServices);
        return mainService;
    }

    /**
     * BUILD OBR REQUEST - FIXED
     */
    private AddInvoiceRequest buildObrInvoiceRequest(String numFacture, String lettreTransp) {
        // GET ALL SERVICES
        List<FacServicePreste> allServices = facServicePresteRepository
            .findAllWithServiceNameByNumFacture(numFacture);

        FacServicePreste main = allServices.get(0);
        AddInvoiceRequest request = new AddInvoiceRequest();

        Dossier dossier = dossierRepository.findById(1L).orElseThrow();
        Importer importer = main.getImportateurId() != null ?
            importerRepository.findById(main.getImportateurId()).orElse(null) : null;

        request.setInvoice_number(numFacture);
        request.setInvoice_date(main.getDateValidation().format(DATE_FORMATTER));
        request.setInvoice_identifier(String.format("%s/ws%s/%s/%s",
            "4000155053", "400015505300958",
            main.getDateValidation().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")),
            numFacture));

        request.setInvoice_type("FN");
        request.setTp_type("2");
        request.setTp_TIN("4000155053");
        request.setTp_trade_number("RC 85744");
        request.setPayment_type("1");
        request.setInvoice_currency("BIF");

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

        request.setCancelled_invoice_ref("");
        request.setCancelled_invoice("");
        request.setInvoice_ref("");
        request.setCn_motif("");

        // BUILD ITEMS FROM ALL SERVICES
        request.setInvoice_items(buildInvoiceItems(allServices));

        log.info("Built OBR request with {} items", request.getInvoice_items().size());
        return request;
    }

    /**
     * BUILD ITEMS - ONE PER SERVICE
     */
    private List<InvoiceItemDto> buildInvoiceItems(List<FacServicePreste> allServices) {
        List<InvoiceItemDto> items = new ArrayList<>();

        for (FacServicePreste s : allServices) {
            if (s.getMontant() == null || s.getMontant() <= 0) continue;

            String name = s.getLibelleService() != null ? s.getLibelleService() : "Service";
            Double htva = s.getMontant();
            Double tva = (s.getMontTaxe() != null ? s.getMontTaxe() : 0.0) +
                         (s.getMontRedev() != null ? s.getMontRedev() : 0.0) +
                         (s.getMontRedevTaxe() != null ? s.getMontRedevTaxe() : 0.0);
            Double ttc = htva + tva;

            InvoiceItemDto item = new InvoiceItemDto();
            item.setItem_designation(name);
            item.setItem_quantity("1");
            item.setItem_price(String.format("%.0f", Math.round(htva)));
            item.setItem_ct("0");
            item.setItem_tl("0");
            item.setItem_price_nvat(String.format("%.0f", Math.round(htva)));
            item.setVat(String.format("%.0f", Math.round(tva)));
            item.setItem_price_wvat(String.format("%.0f", Math.round(ttc)));
            item.setItem_total_amount(String.format("%.0f", Math.round(ttc)));

            items.add(item);
            log.info("  Item: {} - {} BIF", name, ttc);
        }

        return items;
    }
}
