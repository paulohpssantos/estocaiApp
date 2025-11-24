package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.OrdemServico;
import com.estocai.estocai_api.repository.OrdemServicoRepository;
import com.estocai.estocai_api.repository.ServicoOrdemServicoRepository;
import com.estocai.estocai_api.service.OrdemServicoService;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/ordem-servico")
public class OrdemServicoController {

    private final OrdemServicoRepository ordemServicoRepository;
    private final OrdemServicoService ordemServicoService;
    private final ServicoOrdemServicoRepository servicoOrdemServicoRepository;

    public OrdemServicoController(OrdemServicoService ordemServicoService,
                                  OrdemServicoRepository ordemServicoRepository,
                                  ServicoOrdemServicoRepository servicoOrdemServicoRepository) {
        this.ordemServicoService = ordemServicoService;
        this.ordemServicoRepository = ordemServicoRepository;
        this.servicoOrdemServicoRepository = servicoOrdemServicoRepository;
    }

    @PostMapping
    public OrdemServico salvar(@RequestBody OrdemServico ordemServico){
        return ordemServicoService.criar(ordemServico);
    }

    @GetMapping
    public List<OrdemServico> getOrdens(@RequestParam String cpf){
        if (cpf != null)
            return ordemServicoRepository.findByUsuarioCpf(cpf, Sort.by("id").descending());
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (ordemServicoRepository.existsById(id)) {
            ordemServicoService.excluir(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/count/{cpf}")
    public long totalCount(@PathVariable String cpf) {
        return ordemServicoRepository.countByUsuarioCpf(cpf);
    }
}
