package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.Usuario;
import com.estocai.estocai_api.repository.UsuarioRepository;
import com.estocai.estocai_api.security.TokenBlacklistService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private TokenBlacklistService blacklistService;

    @Value("${JWT_SECRET_KEY}")
    private String secretKey;

    public AuthController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        // Verifica se o usuário já existe
        if (usuarioRepository.findByCpf(usuario.getCpf()) != null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "CPF já cadastrado"));
        }

        // Criptografa a senha antes de salvar
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));

        Usuario novo = usuarioRepository.save(usuario);

        // Gera token JWT
        String token = gerarToken(usuario.getCpf());

        Map<String, Object> response = new HashMap<>();
        response.put("mensagem", "Usuário registrado com sucesso");
        response.put("token", token);
        response.put("usuario", novo);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String username, @RequestParam String password) {
        Usuario usuario = usuarioRepository.findByCpf(username);

        if (usuario == null || !passwordEncoder.matches(password, usuario.getSenha())) {
            return ResponseEntity.status(401).body(Map.of("erro", "Usuário ou senha inválidos"));
        }

        String token = gerarToken(usuario.getCpf());
        usuarioRepository.save(usuario);

        //Atualiza a data do acesso
        usuario.setUltimoAcesso( LocalDateTime.now());

        return ResponseEntity.ok(Map.of("token", token, "usuario", usuario));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(name = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Token ausente"));
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token).getBody();
            Date exp = claims.getExpiration();
            blacklistService.blacklistToken(token, exp);
            return ResponseEntity.ok(Map.of("mensagem", "Logout realizado"));
        } catch (JwtException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Token inválido"));
        }
    }

    private String gerarToken(String subject) {
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hora
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }
}