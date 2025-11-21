package com.estocai.estocai_api.service;

import com.estocai.estocai_api.model.OrdemServico;
import com.estocai.estocai_api.model.Produto;
import com.estocai.estocai_api.model.ProdutoOrdemServico;
import com.estocai.estocai_api.repository.OrdemServicoRepository;
import com.estocai.estocai_api.repository.ProdutoOrdemServicoRepository;
import com.estocai.estocai_api.repository.ProdutoRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class OrdemServicoService {

    private final JdbcTemplate jdbc;
    private final OrdemServicoRepository repo;
    private final ProdutoOrdemServicoRepository produtoOrdemServicoRepo;
    private final ProdutoRepository produtoRepo;

    public OrdemServicoService(JdbcTemplate jdbc,
                               OrdemServicoRepository repo,
                               ProdutoOrdemServicoRepository produtoOrdemServicoRepo,
                               ProdutoRepository produtoRepo) {
        this.jdbc = jdbc;
        this.repo = repo;
        this.produtoOrdemServicoRepo = produtoOrdemServicoRepo;
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
        ajustarEstoqueAoSalvar(saved);
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
    protected void ajustarEstoqueAoSalvar(OrdemServico ordem) {
        if (ordem == null || ordem.getId() == null) return;
        List<ProdutoOrdemServico> itens = produtoOrdemServicoRepo.findByOrdemServicoId(ordem.getId());
        if (itens == null || itens.isEmpty()) return;
        for (ProdutoOrdemServico item : itens) {
            if (item == null) continue;
            Produto produto = item.getProduto();
            if (produto == null) continue;

            Long estoqueAtual = produto.getQtdEstoque() != null ? produto.getQtdEstoque() : 0L;
            Long quantidade = item.getQuantidade() != null ? item.getQuantidade() : 0L;

            long novaQtd = estoqueAtual - quantidade;

            produto.setQtdEstoque(novaQtd);
            produtoRepo.save(produto);
        }
    }

    @Transactional
    public void restaurarEstoqueAoExcluir(Long ordemId) {
        if (ordemId == null) return;
        List<ProdutoOrdemServico> itens = produtoOrdemServicoRepo.findByOrdemServicoId(ordemId);
        if (itens != null && !itens.isEmpty()) {
            for (ProdutoOrdemServico item : itens) {
                if (item == null) continue;
                Produto produto = item.getProduto();
                if (produto == null) continue;

                Long estoqueAtual = produto.getQtdEstoque() != null ? produto.getQtdEstoque() : 0L;
                Long quantidade = item.getQuantidade() != null ? item.getQuantidade() : 0L;

                produto.setQtdEstoque(estoqueAtual + quantidade);
                produtoRepo.save(produto);
            }
            produtoOrdemServicoRepo.deleteByOrdemServicoId(ordemId);
        }
    }
}
