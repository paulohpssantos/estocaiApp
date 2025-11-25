package com.estocai.estocai_api.service;

import com.estocai.estocai_api.model.OrdemServico;
import com.estocai.estocai_api.model.Produto;
import com.estocai.estocai_api.model.ProdutoOrdemServico;
import com.estocai.estocai_api.repository.OrdemServicoRepository;
import com.estocai.estocai_api.repository.ProdutoOrdemServicoRepository;
import com.estocai.estocai_api.repository.ProdutoRepository;
import com.estocai.estocai_api.repository.ServicoOrdemServicoRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class OrdemServicoService {

    private static final Logger log = LoggerFactory.getLogger(OrdemServicoService.class);
    private final JdbcTemplate jdbc;
    private final OrdemServicoRepository repo;
    private final ProdutoOrdemServicoRepository produtoOrdemServicoRepo;
    private final ServicoOrdemServicoRepository servicoOrdemServicoRepo;
    private final ProdutoRepository produtoRepo;

    @PersistenceContext
    private EntityManager em;

    public OrdemServicoService(JdbcTemplate jdbc,
                               OrdemServicoRepository repo,
                               ProdutoOrdemServicoRepository produtoOrdemServicoRepo,
                               ServicoOrdemServicoRepository servicoOrdemServicoRepo,
                               ProdutoRepository produtoRepo) {
        this.jdbc = jdbc;
        this.repo = repo;
        this.produtoOrdemServicoRepo = produtoOrdemServicoRepo;
        this.servicoOrdemServicoRepo = servicoOrdemServicoRepo;
        this.produtoRepo = produtoRepo;
    }

    @Transactional
    public OrdemServico criar(OrdemServico ordem) {
        if (ordem == null) throw new IllegalArgumentException("OrdemServico é obrigatória");

        if (ordem.getNumeroOS() == null || ordem.getNumeroOS().isBlank()) {
            if (ordem.getUsuario() != null && ordem.getUsuario().getCpf() != null) {
                Long next = nextSequenciaPorUsuario(ordem.getUsuario().getCpf());
                ordem.setNumeroOS("OS" + next);
            }
        }

        // Se for uma atualização (já tem id), verificar itens existentes e restaurar estoque primeiro
        if (ordem.getId() != null) {
            List<ProdutoOrdemServico> existentes = produtoOrdemServicoRepo.findByOrdemServicoId(ordem.getId());
            if (existentes != null && !existentes.isEmpty()) {
                restaurarEstoqueAoExcluir(ordem.getId());
            }
        }

        OrdemServico saved = repo.save(ordem);
        return saved;
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



    @Transactional
    public void restaurarEstoqueAoExcluir(Long ordemId) {
        if (ordemId == null) return;
        List<ProdutoOrdemServico> itens = produtoOrdemServicoRepo.findByOrdemServicoId(ordemId);
        if (itens != null && !itens.isEmpty()) {
            for (ProdutoOrdemServico item : itens) {
                if (item == null) continue;
                Long quantidade = item.getQuantidade() != null ? item.getQuantidade() : 0L;

                Produto produto = item.getProduto();
                if (produto == null) continue;

                Long estoqueAtual = produto.getQtdEstoque() != null ? produto.getQtdEstoque() : 0L;
                long novaQtd = estoqueAtual + quantidade;
                produto.setQtdEstoque(novaQtd);
                try {
                    System.out.println("Restaurando produto id=" + produto.getId() +
                            " estoqueAnterior=" + estoqueAtual +
                            " adicionar=" + quantidade +
                            " novo=" + novaQtd);

                    produtoRepo.saveAndFlush(produto); // força o flush imediato
                    System.out.println("Gravado produto id=" + produto.getId() + " com sucesso");

                    em.flush();
                    em.clear();

                } catch (Exception e) {
                    log.error("Erro ao salvar produto id={}", produto.getId(), e);
                    throw e;
                }
            }

        }
    }

    @Transactional
    public void excluir(Long ordemId) {
        Optional<OrdemServico> opt = repo.findById(ordemId);
        if (opt.isEmpty()) {
            return; // ou lançar EntityNotFoundException se preferir
        }


        restaurarEstoqueAoExcluir(ordemId);
        System.out.println("1 - Produtos restaurados");
        produtoOrdemServicoRepo.deleteByOrdemServicoId(ordemId);
        System.out.println("ProdutosServiços  Apagados");
        servicoOrdemServicoRepo.deleteByOrdemServicoId(ordemId);
        System.out.println("Serviços  Apagados");

        em.flush();
        em.clear();

        System.out.println("Iniciando exclusão da OrdemServico id=" + ordemId);
        repo.delete(opt.get());

        System.out.println("OrdemServico id=" + ordemId + " excluída com sucesso");


    }
}
