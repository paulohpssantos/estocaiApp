package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.dto.UpdatePlanoRequest;
import com.estocai.estocai_api.model.Usuario;
import com.estocai.estocai_api.repository.UsuarioRepository;
import com.estocai.estocai_api.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/usuario")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioRepository usuarioRepository, UsuarioService usuarioService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
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

    @PutMapping("/atualizar-plano")
    public ResponseEntity<Usuario> atualizarPlano(@RequestBody UpdatePlanoRequest req) {
        if (req == null || req.getCpf() == null || req.getCpf().isBlank() || req.getPlano() == null || req.getPlano().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Usuario updated = usuarioService.atualizarPlano(req.getCpf(), req.getPlano());
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }
}

