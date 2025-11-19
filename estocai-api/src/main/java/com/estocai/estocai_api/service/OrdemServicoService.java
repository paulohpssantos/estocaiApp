package com.estocai.estocai_api.service;

import com.estocai.estocai_api.model.OrdemServico;
import com.estocai.estocai_api.repository.OrdemServicoRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrdemServicoService {

    private final JdbcTemplate jdbc;
    private final OrdemServicoRepository repo;

    public OrdemServicoService(JdbcTemplate jdbc, OrdemServicoRepository repo) {
        this.jdbc = jdbc;
        this.repo = repo;
    }

    @Transactional
    public OrdemServico criar(OrdemServico ordem) {
        if (ordem.getNumeroOS() == null || ordem.getNumeroOS().isBlank()) {
            Long next = nextSequenciaPorUsuario(ordem.getUsuario().getCpf());
            ordem.setNumeroOS("OS" + next);
        }
        return repo.save(ordem);
    }

    @Transactional
    protected Long nextSequenciaPorUsuario(String usuarioCpf) {
        String sql =
                "WITH upsert AS ( " +
                        "  INSERT INTO ordem_servico_user_seq(usuario_cpf, last_value) VALUES (?, 1) " +
                        "  ON CONFLICT (usuario_cpf) DO UPDATE SET last_value = ordem_servico_user_seq.last_value + 1 " +
                        "  RETURNING last_value " +
                        ") SELECT last_value FROM upsert";
        return jdbc.queryForObject(sql, Long.class, usuarioCpf);
    }
}