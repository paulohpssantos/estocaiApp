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
            Long next = jdbc.queryForObject("SELECT nextval('ordem_servico_seq')", Long.class);
            ordem.setNumeroOS("OS" + next);
        }
        return repo.save(ordem);
    }
}
