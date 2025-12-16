package com.estocai.estocai_api.service;

import com.stripe.Stripe;
import com.stripe.model.Customer;
import com.stripe.model.EphemeralKey;
import com.stripe.model.PaymentIntent;
import com.stripe.net.RequestOptions;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripeService {
    private static final Logger log = LoggerFactory.getLogger(StripeService.class);
    private static final String STRIPE_API_VERSION = "2025-11-17.clover";

    public StripeService() {
        String key = System.getenv("STRIPE_SECRET_KEY");
        if (key == null || key.isBlank()) {
            throw new IllegalStateException("STRIPE_SECRET_KEY not set in environment");
        }
        Stripe.apiKey = key;
    }

    public Map<String, Object> createPaymentSheet(BigDecimal amountReais) throws Exception {
        if (amountReais == null) {
            throw new IllegalArgumentException("amount is required");
        }
        if (amountReais.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("invalid amount");
        }

        long amountCents = amountReais.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.FLOOR)
                .longValue();

        log.info("[PAYMENT-SHEET] amount (reais): {} cents: {}", amountReais, amountCents);

        // Create customer
        CustomerCreateParams custParams = CustomerCreateParams.builder().build();
        Customer customer = Customer.create(custParams);
        log.info("[PAYMENT-SHEET] created customer id={}", customer.getId());

        // Criar RequestOptions apenas com apiKey
        RequestOptions requestOptions = RequestOptions.builder()
                .setApiKey(Stripe.apiKey)
                .build();



        // Create ephemeral key: incluir stripe_version nos params para corresponder ao mobile client
        Map<String, Object> ekParams = new HashMap<>();
        ekParams.put("customer", customer.getId());
        EphemeralKey ephemeralKey = EphemeralKey.create(ekParams, requestOptions);

        // Create payment intent
        PaymentIntentCreateParams.AutomaticPaymentMethods autoMethods =
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build();

        PaymentIntentCreateParams piParams = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency("brl")
                .setCustomer(customer.getId())
                .setAutomaticPaymentMethods(autoMethods)
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(piParams);
        log.info("[PAYMENT-SHEET] created paymentIntent id={}", paymentIntent.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("paymentIntent", paymentIntent.getClientSecret());
        result.put("ephemeralKey", ephemeralKey.getSecret());
        result.put("customer", customer.getId());
        result.put("publishableKey", System.getenv("EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"));

        return result;
    }
}
