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


    @GetMapping("/listar/{usuarioCpf}")
    public List<Cliente> listar(@PathVariable String usuarioCpf) {
        if (usuarioCpf != null)
            return clienteRepository.findByUsuarioCpfAndAtivo(usuarioCpf,true);
        return null;
    }

    @GetMapping("/count/{usuarioCpf}")
    public long totalCount(@PathVariable String usuarioCpf) {
        return clienteRepository.countByUsuarioCpfAndAtivo(usuarioCpf, true);
    }
}
