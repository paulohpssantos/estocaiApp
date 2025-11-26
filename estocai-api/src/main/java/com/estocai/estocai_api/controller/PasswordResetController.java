package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/auth")
public class PasswordResetController {

    private final PasswordResetService resetService;

    @Value("${APP_URL}")
    private String appUrl;

    public PasswordResetController(PasswordResetService resetService) {
        this.resetService = resetService;
    }

    @PostMapping("/forgot")
    public ResponseEntity<?> forgot(@RequestBody Map<String,String> body) {
        String emailOrCpf = body.get("email");
        resetService.createAndSendToken(emailOrCpf, appUrl);
        // sempre responder 200 para não vazar existência
        return ResponseEntity.ok(Map.of("mensagem", "Se o e-mail existir, instruções foram enviadas"));
    }

    @PostMapping("/reset")
    public ResponseEntity<?> reset(@RequestBody Map<String,String> body) {
        String token = body.get("token");
        String novaSenha = body.get("password");
        try {
            resetService.resetPassword(token, novaSenha);
            return ResponseEntity.ok(Map.of("mensagem", "Senha redefinida com sucesso"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/reset")
    public ResponseEntity<Void> redirectToWeb(@RequestParam("token") String token) {
        String encoded = URLEncoder.encode(token, StandardCharsets.UTF_8);
        String target = "/reset.html?token=" + encoded;
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(target)).build();
    }

    @GetMapping("/reset.html")
    public ResponseEntity<Void> redirectResetHtml(@RequestParam(value = "token", required = false) String token) {
        String target = "/reset.html" + (token != null ? "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8) : "");
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(target)).build();
    }
}
