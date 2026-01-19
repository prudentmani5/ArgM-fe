package com.globalportservices.erp_be.obr.dto;

import lombok.Data;

/**
 * OBR Login Response DTO
 * Response from OBR authentication
 */
@Data
public class ObrLoginResponse {

    private boolean success;
    private String token;
    private String message;
    private Long expiresIn;
}
