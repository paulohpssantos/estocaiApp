package com.estocai.estocai_api.repository;

import com.estocai.estocai_api.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUsuarioCpf(String usuarioCpf);
}
