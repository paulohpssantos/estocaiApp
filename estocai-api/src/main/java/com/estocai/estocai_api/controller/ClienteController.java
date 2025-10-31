package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.Cliente;
import com.estocai.estocai_api.model.Funcionario;
import com.estocai.estocai_api.repository.ClienteRepository;
import com.estocai.estocai_api.repository.FuncionarioRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cliente")
public class ClienteController {

    private final ClienteRepository clienteRepository;

    public ClienteController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @PostMapping
    public Cliente salvar(@RequestBody Cliente cliente){
        return clienteRepository.save(cliente);
    }


    @GetMapping
    public List<Cliente> listar() {
        return clienteRepository.findByAtivo(true);
    }
}
