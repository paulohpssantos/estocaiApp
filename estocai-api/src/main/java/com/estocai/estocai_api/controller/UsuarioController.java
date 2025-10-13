package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.Usuario;
import com.estocai.estocai_api.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuario")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }


    @PostMapping
    public Usuario salvar(@RequestBody Usuario usuario){
        return usuarioRepository.save(usuario);
    }

    @GetMapping
    public Usuario getUsuario(@RequestParam(required = false) String cpf) {
        if (cpf != null)
            return usuarioRepository.findByCpf(cpf);
        return null;
    }
}

