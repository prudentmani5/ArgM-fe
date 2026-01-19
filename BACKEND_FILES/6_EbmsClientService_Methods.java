package com.globalportservices.erp_be.obr.service;

import com.globalportservices.erp_be.obr.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * ADD THESE METHODS TO YOUR EXISTING EbmsClientService
 *
 * Location: obr/service/EbmsClientService.java
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EbmsClientService {

    private final RestTemplate restTemplate;

    @Value("${obr.api.base-url}")
    private String obrBaseUrl;

    @Value("${obr.api.login-endpoint:/api/login}")
    private String loginEndpoint;

    @Value("${obr.api.invoice-endpoint:/api/addInvoice}")
    private String invoiceEndpoint;

    // ... your existing methods ...

    /**
     * LOGIN TO OBR
     * Gets authentication token from OBR API
     *
     * @return ObrLoginResponse containing token
     */
    public ObrLoginResponse login() {
        try {
            log.info("Attempting to login to OBR API");

            LoginRequest loginRequest = new LoginRequest();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<LoginRequest> request = new HttpEntity<>(loginRequest, headers);

            String url = obrBaseUrl + loginEndpoint;
            log.debug("OBR login URL: {}", url);

            ResponseEntity<ObrLoginResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                ObrLoginResponse.class
            );

            ObrLoginResponse loginResponse = response.getBody();

            if (loginResponse != null && loginResponse.isSuccess()) {
                log.info("OBR login successful");
                return loginResponse;
            } else {
                String errorMsg = loginResponse != null ? loginResponse.getMessage() : "No response";
                log.error("OBR login failed: {}", errorMsg);
                throw new RuntimeException("OBR authentication failed: " + errorMsg);
            }

        } catch (Exception e) {
            log.error("Error during OBR login", e);
            throw new RuntimeException("Failed to authenticate with OBR: " + e.getMessage(), e);
        }
    }

    /**
     * SUBMIT INVOICE TO OBR
     * Sends invoice data to OBR API
     *
     * @param request AddInvoiceRequest with all invoice data
     * @param token Authentication token from login()
     * @return ObrInvoiceResponse containing electronic signature
     */
    public ObrInvoiceResponse addInvoice(AddInvoiceRequest request, String token) {
        try {
            log.info("Submitting invoice {} to OBR", request.getInvoice_number());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);  // Add Authorization: Bearer {token}

            HttpEntity<AddInvoiceRequest> httpRequest = new HttpEntity<>(request, headers);

            String url = obrBaseUrl + invoiceEndpoint;
            log.debug("OBR addInvoice URL: {}", url);

            ResponseEntity<ObrInvoiceResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                httpRequest,
                ObrInvoiceResponse.class
            );

            ObrInvoiceResponse invoiceResponse = response.getBody();

            if (invoiceResponse != null && invoiceResponse.isSuccess()) {
                log.info("Invoice {} submitted successfully to OBR. Signature: {}",
                    request.getInvoice_number(),
                    invoiceResponse.getElectronic_signature());
                return invoiceResponse;
            } else {
                String errorMsg = invoiceResponse != null ? invoiceResponse.getMessage() : "No response";
                log.error("OBR invoice submission failed: {}", errorMsg);
                throw new RuntimeException("OBR invoice submission failed: " + errorMsg);
            }

        } catch (Exception e) {
            log.error("Error submitting invoice to OBR", e);
            throw new RuntimeException("Failed to submit invoice to OBR: " + e.getMessage(), e);
        }
    }
}
