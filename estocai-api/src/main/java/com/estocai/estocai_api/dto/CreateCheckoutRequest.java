package com.estocai.estocai_api.dto;

import lombok.Data;

@Data
public class CreateCheckoutRequest {

    private Long amount;
    private String currency;
    private String successUrl;
    private String cancelUrl;
    private String name;
}
