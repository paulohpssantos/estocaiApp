package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.Usuario;
import com.estocai.estocai_api.repository.UsuarioRepository;
import com.estocai.estocai_api.service.UsuarioService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/stripe")
public class StripeController {

    @Value("${stripe.webhook.secret:}")
    private String webhookSecret;

    private final UsuarioService usuarioService;

    public StripeController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping(value = "/create-checkout-session", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> createCheckout(@RequestBody Map<String, Object> body) throws StripeException {
        Long amount = ((Number) body.get("amount")).longValue();
        String currency = (String) body.getOrDefault("currency", "brl");
        String successUrl = (String) body.get("successUrl");
        String cancelUrl = (String) body.get("cancelUrl");
        String name = (String) body.getOrDefault("name", "Pedido");

        // campos para enviar ao webhook
        String cpf = null;
        String planName = null;
        Object metadataObj = body.get("metadata");
        if (metadataObj instanceof Map) {
            Map<?, ?> metadataMap = (Map<?, ?>) metadataObj;
            Object cpfObj = metadataMap.get("cpf");
            Object planObj = metadataMap.get("plan");
            if (cpfObj != null) cpf = cpfObj.toString();
            if (planObj != null) planName = planObj.toString();
        }


        SessionCreateParams.LineItem.PriceData.ProductData product =
                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName(name)
                        .build();

        SessionCreateParams.LineItem.PriceData priceData =
                SessionCreateParams.LineItem.PriceData.builder()
                        .setCurrency(currency)
                        .setUnitAmount(amount)
                        .setProductData(product)
                        .build();

        SessionCreateParams.LineItem lineItem =
                SessionCreateParams.LineItem.builder()
                        .setPriceData(priceData)
                        .setQuantity(1L)
                        .build();

        SessionCreateParams.Builder paramsBuilder =
                SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.PAYMENT)
                        .addLineItem(lineItem)
                        .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                        .setCancelUrl(cancelUrl);

        // metadata: aparecerá em session.metadata no webhook
        if (planName != null && !planName.isBlank()) {
            paramsBuilder.putMetadata("planName", planName);
        }
        if (cpf != null && !cpf.isBlank()) {
            // opcional: usar cpf como client_reference_id e também em metadata
            paramsBuilder.setClientReferenceId(cpf);
            paramsBuilder.putMetadata("cpf", cpf);
        }

        Session session = Session.create(paramsBuilder.build());

        Map<String, String> resp = new HashMap<>();
        resp.put("checkoutUrl", session.getUrl());
        resp.put("sessionId", session.getId());
        resp.put("resposta", "ok");
        return ResponseEntity.ok().body(resp);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestHeader(HttpHeaders.CONTENT_TYPE) String contentType,
                                                @RequestHeader(name = "Stripe-Signature", required = false) String sigHeader,
                                                @RequestBody String payload) {
        try {
            Event event;
            if (webhookSecret != null && !webhookSecret.isBlank() && sigHeader != null) {
                event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            } else {
                event = Event.GSON.fromJson(payload, Event.class);
            }

            switch (event.getType()) {
                case "checkout.session.completed":
                    Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                    if (session != null) {
                        String sessionId = session.getId();
                        String cpfFromClientRef = session.getClientReferenceId(); // se setado
                        Map<String, String> metadata = session.getMetadata();
                        String planNameFromMetadata = metadata != null ? metadata.get("planName") : null;
                        String cpfFromMetadata = metadata != null ? metadata.get("cpf") : null;

                        Usuario updated = usuarioService.atualizarPlano(cpfFromMetadata, planNameFromMetadata);
                    }
                    break;
                default:
                    break;
            }
            return ResponseEntity.ok("received");
        } catch (SignatureVerificationException e) {
            return ResponseEntity.status(400).body("Invalid signature");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error");
        }
    }
}
