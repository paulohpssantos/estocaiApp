package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.Funcionario;
import com.estocai.estocai_api.model.Servico;
import com.estocai.estocai_api.repository.FuncionarioRepository;
import com.estocai.estocai_api.repository.ServicoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/servico")
public class ServicoController {

    private final ServicoRepository servicoRepository;

    public ServicoController(ServicoRepository servicoRepository) {
        this.servicoRepository = servicoRepository;
    }

    @PostMapping
    public Servico salvar(@RequestBody Servico servico){
        return servicoRepository.save(servico);
    }


    @GetMapping
    public List<Servico> listar(@RequestParam String cpf) {
        if (cpf != null)
            return servicoRepository.findByUsuarioCpfAndAtivo(cpf,true);
        return null;
    }

    @GetMapping("/count/{cpf}")
    public long totalCount(@PathVariable String cpf) {
        return servicoRepository.countByUsuarioCpfAndAtivo(cpf, true);
    }
}
