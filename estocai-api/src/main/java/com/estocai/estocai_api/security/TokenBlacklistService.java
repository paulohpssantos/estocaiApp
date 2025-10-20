package com.estocai.estocai_api.security;

import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {
    private final ConcurrentHashMap<String, Long> blacklist = new ConcurrentHashMap<>();

    public void blacklistToken(String token, Date expiration) {
        long expMillis = (expiration != null) ? expiration.getTime() : System.currentTimeMillis();
        blacklist.put(token, expMillis);
    }

    public boolean isBlacklisted(String token) {
        Long exp = blacklist.get(token);
        if (exp == null) return false;
        if (exp < System.currentTimeMillis()) {
            blacklist.remove(token);
            return false;
        }
        return true;
    }
}