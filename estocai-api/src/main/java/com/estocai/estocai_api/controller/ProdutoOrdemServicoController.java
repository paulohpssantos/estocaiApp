package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.ProdutoOrdemServico;
import com.estocai.estocai_api.repository.ProdutoOrdemServicoRepository;
import com.estocai.estocai_api.service.ProdutoOrdemServicoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/produto-ordem-servico")
public class ProdutoOrdemServicoController {

    private final ProdutoOrdemServicoRepository produtoOrdemServicoRepository;
    private final ProdutoOrdemServicoService produtoOrdemServicoService;

    public ProdutoOrdemServicoController(ProdutoOrdemServicoRepository produtoOrdemServicoRepository,
                                         ProdutoOrdemServicoService produtoOrdemServicoService) {
        this.produtoOrdemServicoRepository = produtoOrdemServicoRepository;
        this.produtoOrdemServicoService = produtoOrdemServicoService;
    }


    @PostMapping
    public ProdutoOrdemServico salvar(@RequestBody ProdutoOrdemServico produtoOrdemServico){
        return produtoOrdemServicoRepository.save(produtoOrdemServico);
    }

    @GetMapping
    public List<ProdutoOrdemServico> getProdutosOrdem(@RequestParam(required = false) Long idOrdemServico) {
        if (idOrdemServico != null) {
            return produtoOrdemServicoRepository.findByOrdemServicoId(idOrdemServico);
        }
        return produtoOrdemServicoRepository.findAll();
    }

    @DeleteMapping("/por-ordem/{ordemId}")
    public ResponseEntity<Void> deletarPorOrdem(@PathVariable Long ordemId) {
        int deleted = produtoOrdemServicoService.deleteByOrdemId(ordemId);
        if (deleted > 0) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

