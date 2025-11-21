package com.estocai.estocai_api.service;

import com.estocai.estocai_api.repository.ProdutoOrdemServicoRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProdutoOrdemServicoService {

    private final ProdutoOrdemServicoRepository repo;
    private final EntityManager em;

    public ProdutoOrdemServicoService(ProdutoOrdemServicoRepository repo, EntityManager em) {
        this.repo = repo;
        this.em = em;
    }

    @Transactional
    public int deleteByOrdemId(Long ordemId) {
        int deleted = repo.deleteByOrdemServicoId(ordemId);
        em.flush();   // garante execução no DB
        em.clear();   // evita entidades gerenciadas obsoletas no persistence context
        return deleted;
    }
}
