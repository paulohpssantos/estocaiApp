package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.Estabelecimento;
import com.estocai.estocai_api.repository.EstabelecimentoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/estabelecimento")
public class EstabelecimentoController {

    private final EstabelecimentoRepository estabelecimentoRepository;

    public EstabelecimentoController(EstabelecimentoRepository estabelecimentoRepository) {
        this.estabelecimentoRepository = estabelecimentoRepository;
    }

    @PostMapping
    public Estabelecimento salvar(@RequestBody Estabelecimento estabelecimento){
        return estabelecimentoRepository.save(estabelecimento);
    }


    @GetMapping
    public List<Estabelecimento> listar(@RequestParam String cpf) {
        if (cpf != null)
            return estabelecimentoRepository.findByUsuarioCpfAndAtivo(cpf, true);
        return null;
    }

    @GetMapping("/count/{cpf}")
    public long totalCount(@PathVariable String cpf) {
        return estabelecimentoRepository.countByUsuarioCpfAndAtivo(cpf,true);
    }
}
