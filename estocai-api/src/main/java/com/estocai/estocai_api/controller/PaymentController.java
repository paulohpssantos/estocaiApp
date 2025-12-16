package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.service.StripeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PaymentController {
    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);
    private final StripeService stripeService;

    public PaymentController(StripeService stripeService) {
        this.stripeService = stripeService;
    }

    @PostMapping("/payment-sheet")
    public ResponseEntity<?> createPaymentSheet(@RequestBody Map<String, Object> body) {
        try {
            log.info("[PAYMENT-SHEET] POST body: {}", body);

            Object raw = null;
            if (body.containsKey("amount")) raw = body.get("amount");
            else if (body.containsKey("value")) raw = body.get("value");
            else raw = body.get("amountValue");

            BigDecimal amount;
            if (raw instanceof Number) {
                amount = new BigDecimal(((Number) raw).toString());
            } else if (raw instanceof String) {
                amount = new BigDecimal((String) raw);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "invalid_amount"));
            }

            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "invalid_amount"));
            }

            Map<String, Object> result = stripeService.createPaymentSheet(amount);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException ex) {
            log.error("[PAYMENT-SHEET] invalid request: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            log.error("[PAYMENT-SHEET] error:", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "internal_error", "message", ex.getMessage()));
        }
    }
}
