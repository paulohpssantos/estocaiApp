package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.ProdutoOrdemServico;
import com.estocai.estocai_api.model.ServicoOrdemServico;
import com.estocai.estocai_api.repository.ProdutoOrdemServicoRepository;
import com.estocai.estocai_api.repository.ServicoOrdemServicoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/servico-ordem-servico")
public class ServicoOrdemServicoController {

    private final ServicoOrdemServicoRepository servicoOrdemServicoRepository;

    public ServicoOrdemServicoController(ServicoOrdemServicoRepository servicoOrdemServicoRepository) {
        this.servicoOrdemServicoRepository = servicoOrdemServicoRepository;
    }


    @PostMapping
    public ServicoOrdemServico salvar(@RequestBody ServicoOrdemServico servicoOrdemServico){
        return servicoOrdemServicoRepository.save(servicoOrdemServico);
    }

    @GetMapping
    public List<ServicoOrdemServico> getProdutosOrdem(@RequestParam(required = false) Long idOrdemServico) {
        if (idOrdemServico != null) {
            return servicoOrdemServicoRepository.findByOrdemServicoId(idOrdemServico);
        }
        return servicoOrdemServicoRepository.findAll();
    }

    @DeleteMapping("/por-ordem/{ordemId}")
    public ResponseEntity<Void> deletarPorOrdem(@PathVariable Long ordemId) {
        int deleted = servicoOrdemServicoRepository.deleteByOrdemServicoId(ordemId);
        if (deleted > 0) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

