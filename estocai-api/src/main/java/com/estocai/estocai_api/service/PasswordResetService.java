package com.estocai.estocai_api.service;

import com.estocai.estocai_api.model.PasswordResetToken;
import com.estocai.estocai_api.model.Usuario;
import com.estocai.estocai_api.repository.PasswordResetTokenRepository;
import com.estocai.estocai_api.repository.UsuarioRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepo;
    private final EmailServiceImpl emailService; // injeta a implementação que possui o método de template
    private final BCryptPasswordEncoder passwordEncoder;

    private static final long EXPIRY_MINUTES = 60;

    public PasswordResetService(UsuarioRepository usuarioRepository,
                                PasswordResetTokenRepository tokenRepo,
                                EmailServiceImpl emailService,
                                BCryptPasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRepo = tokenRepo;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void createAndSendToken(String emailOrCpf, String appUrl) {
        Optional<Usuario> opt = Optional.ofNullable(usuarioRepository.findByEmail(emailOrCpf));
        if (opt.isEmpty()) {
            opt = Optional.ofNullable(usuarioRepository.findByCpf(emailOrCpf));
        }
        if (opt.isEmpty()) return;

        Usuario u = opt.get();
        tokenRepo.deleteByUsuarioCpf(u.getCpf());

        String token = UUID.randomUUID().toString();
        PasswordResetToken prt = new PasswordResetToken();
        prt.setToken(token);
        prt.setUsuario(u);
        prt.setExpiryDate(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES));
        prt.setUsed(false);
        tokenRepo.save(prt);

        String link = appUrl + "/auth/reset?token=" + token;
        String subject = "Recuperação de senha";


        Map<String, Object> vars = Map.of(
                "name", u.getNome(),
                "link", link,
                "expiryMinutes", EXPIRY_MINUTES
        );

        // Chamada ao método que renderiza o template e envia o e-mail
        emailService.sendPasswordResetEmailUsingTemplate(u.getEmail(), subject, "password-reset", vars);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken prt = tokenRepo.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token inválido"));

        if (prt.isUsed() || prt.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token expirado ou já usado");
        }

        Usuario u = prt.getUsuario();
        u.setSenha(passwordEncoder.encode(newPassword));
        usuarioRepository.save(u);

        prt.setUsed(true);
        tokenRepo.save(prt);
    }
}
