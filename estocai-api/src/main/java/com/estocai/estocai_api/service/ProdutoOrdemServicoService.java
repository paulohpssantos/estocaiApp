package com.estocai.estocai_api.service;

import com.estocai.estocai_api.model.OrdemServico;
import com.estocai.estocai_api.model.Produto;
import com.estocai.estocai_api.model.ProdutoOrdemServico;
import com.estocai.estocai_api.repository.ProdutoOrdemServicoRepository;
import com.estocai.estocai_api.repository.ProdutoRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProdutoOrdemServicoService {

    private static final Logger log = LoggerFactory.getLogger(ProdutoOrdemServicoService.class);

    @PersistenceContext
    private EntityManager em;

    private final ProdutoOrdemServicoRepository repo;
    private final ProdutoRepository produtoRepo;

    public ProdutoOrdemServicoService(ProdutoOrdemServicoRepository repo, ProdutoRepository produtoRepo) {
        this.repo = repo;
        this.produtoRepo = produtoRepo;
    }

    @Transactional
    public ProdutoOrdemServico salvar(ProdutoOrdemServico item) {
        if (item == null) throw new IllegalArgumentException("ProdutoOrdemServico é obrigatório");
        ProdutoOrdemServico saved = repo.saveAndFlush(item);
        Long ordemId = null;
        if (saved.getOrdemServico() != null) {
            ordemId = saved.getOrdemServico().getId();
        }
        ajustarEstoqueAoSalvar(saved);
        return saved;
    }

    @Transactional
    protected void ajustarEstoqueAoSalvar(ProdutoOrdemServico item) {
        if (item == null) return;

        Produto produto = item.getProduto();
        if (produto == null) return;

        Long estoqueAtual = produto.getQtdEstoque() != null ? produto.getQtdEstoque() : 0L;
        Long quantidade = item.getQuantidade() != null ? item.getQuantidade() : 0L;

        long novaQtd = estoqueAtual - quantidade;

        produto.setQtdEstoque(novaQtd);
        try {
            System.out.println("Gravando produto id=" + produto.getId() +
                    " estoqueAnterior=" + estoqueAtual +
                    " subtrair=" + quantidade +
                    " novo=" + novaQtd);

            produtoRepo.save(produto);
            System.out.println("Gravado produto id=" + produto.getId() + " com sucesso");

            em.flush();
            em.clear();

        } catch (Exception e) {
            System.out.println("Erro ao salvar produto id=" + produto.getId() + ": " + e.getMessage());
            throw e;
        }

    }
}
