package com.globalportservices.erp_be.obr.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * OBR Login Request DTO
 * Used to authenticate with OBR API
 */
@Data
public class LoginRequest {

    @JsonProperty("username")
    private String userName = "ws400015505300958";

    @JsonProperty("password")
    private String pass = "^mf3@Yhk";
}
