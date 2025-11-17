package com.estocai.estocai_api.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class JwtTokenService {

    private final TokenBlacklistService blacklistService;

    @Value("${JWT_SECRET_KEY}")
    private String secretKey;

    public JwtTokenService(TokenBlacklistService blacklistService) {
        this.blacklistService = blacklistService;
    }

    /**
     * Gera um token JWT sem claim de expiração e registra como token atual do usuário.
     * Substitui (revoga) o token anterior do mesmo usuário.
     */
    public String issueToken(String username) {
        String token = Jwts.builder()
                .setSubject(username)
                // note: sem setExpiration(...) -> token sem expiração
                .signWith(SignatureAlgorithm.HS256, secretKey.getBytes(StandardCharsets.UTF_8))
                .compact();

        // registra novo token e revoga o anterior
        blacklistService.registerNewToken(username, token);
        return token;
    }

    /**
     * Chamar em logout para revogar token atual.
     */
    public void revokeToken(String token, String username) {
        blacklistService.blacklistToken(token, username);
    }
}