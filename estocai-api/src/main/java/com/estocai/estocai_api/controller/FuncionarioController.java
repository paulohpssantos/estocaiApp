package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.Estabelecimento;
import com.estocai.estocai_api.model.Funcionario;
import com.estocai.estocai_api.repository.EstabelecimentoRepository;
import com.estocai.estocai_api.repository.FuncionarioRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/funcionario")
public class FuncionarioController {

    private final FuncionarioRepository funcionarioRepository;

    public FuncionarioController(FuncionarioRepository funcionarioRepository) {
        this.funcionarioRepository = funcionarioRepository;
    }

    @PostMapping
    public Funcionario salvar(@RequestBody Funcionario funcionario){
        return funcionarioRepository.save(funcionario);
    }


    @GetMapping
    public List<Funcionario> listar() {
        return funcionarioRepository.findByAtivo(true);
    }

    @GetMapping("/{estabelecimentoCpfCnpj}")
    public List<Funcionario> listarPorEstabelecimento(@PathVariable String estabelecimentoCpfCnpj) {
        return funcionarioRepository.findByEstabelecimentoCpfCnpjAndAtivo(estabelecimentoCpfCnpj, true);
    }
}
