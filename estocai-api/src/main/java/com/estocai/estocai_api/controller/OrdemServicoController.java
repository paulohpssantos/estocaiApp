package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.OrdemServico;
import com.estocai.estocai_api.model.Produto;
import com.estocai.estocai_api.model.Usuario;
import com.estocai.estocai_api.repository.OrdemServicoRepository;
import com.estocai.estocai_api.repository.UsuarioRepository;
import com.estocai.estocai_api.service.OrdemServicoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/ordem-servico")
public class OrdemServicoController {

    private final OrdemServicoRepository ordemServicoRepository;
    private final OrdemServicoService ordemServicoService;

    public OrdemServicoController(OrdemServicoService ordemServicoService,
                                  OrdemServicoRepository ordemServicoRepository) {
        this.ordemServicoService = ordemServicoService;
        this.ordemServicoRepository = ordemServicoRepository;
    }



    @PostMapping
    public OrdemServico salvar(@RequestBody OrdemServico ordemServico){
        return ordemServicoService.criar(ordemServico);
    }

    @GetMapping
    public List<OrdemServico> getOrdens(){
        return ordemServicoRepository.findAll(org.springframework.data.domain.Sort.by("id").descending());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (ordemServicoRepository.existsById(id)) {
            ordemServicoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/count")
    public long totalCount() {

        return ordemServicoRepository.count();

    }
}

