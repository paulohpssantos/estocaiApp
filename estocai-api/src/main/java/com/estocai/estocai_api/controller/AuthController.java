package com.estocai.estocai_api.controller;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final String SECRET_KEY = System.getenv("JWT_SECRET_KEY");
    //private final String SECRET_KEY = "7k6IlVH7+vrTyGCKwobOyxYOuyf4hfR+soZAe74yUdw+gUyC6exWPjwIE1xCTDZf";

    @PostMapping("/login")
    public Map<String, String> login(@RequestParam String username, @RequestParam String password) {
        // Aqui você valida usuário/senha no banco
        if ("admin".equals(username) && "admin".equals(password)) {
            String token = Jwts.builder()
                    .setSubject(username)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hora
                    .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                    .compact();
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return response;
        } else {
            throw new RuntimeException("Usuário ou senha inválidos");
        }
    }
}