package com.estocai.estocai_api.security;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Serviço para gerenciar tokens revogados e o token atual por usuário.
 * Tokens que forem substituídos por um novo login são marcados como revogados.
 */
@Service
public class TokenBlacklistService {
    // token -> Boolean (presença indica revogado)
    private final ConcurrentHashMap<String, Boolean> blacklistedTokens = new ConcurrentHashMap<>();

    // username -> current active token
    private final ConcurrentHashMap<String, String> userToToken = new ConcurrentHashMap<>();

    /**
     * Registra o novo token do usuário e revoga o token anterior (se existir).
     */
    public void registerNewToken(String username, String newToken) {
        if (username == null || newToken == null) return;

        String previous = userToToken.put(username, newToken);
        if (previous != null && !previous.equals(newToken)) {
            blacklistedTokens.put(previous, Boolean.TRUE);
        }
    }

    /**
     * Revoga explicitamente um token (ex: logout).
     * Se o token ainda for o token corrente do usuário, remove o mapeamento user->token.
     */
    public void blacklistToken(String token, String username) {
        if (token == null) return;
        blacklistedTokens.put(token, Boolean.TRUE);
        if (username != null) {
            userToToken.computeIfPresent(username, (u, t) -> t.equals(token) ? null : t);
        }
    }

    /**
     * Verifica se o token está revogado.
     */
    public boolean isBlacklisted(String token) {
        if (token == null) return false;
        return blacklistedTokens.containsKey(token);
    }

    /**
     * Opcional: retorna o token atual do usuário.
     */
    public String getCurrentTokenForUser(String username) {
        return userToToken.get(username);
    }
}
