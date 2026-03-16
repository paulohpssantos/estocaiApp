package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.dto.UpdatePlanoRequest;
import com.estocai.estocai_api.model.Usuario;
import com.estocai.estocai_api.repository.UsuarioRepository;
import com.estocai.estocai_api.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;


@RestController
@RequestMapping("/usuario")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository, UsuarioService usuarioService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
    }


    @PostMapping
    public Usuario salvar(@RequestBody Usuario usuario){
        return usuarioRepository.save(usuario);
    }

    @GetMapping("/excluir-dados")
    public ResponseEntity<Void> excluirDados() {
        String target = "/excluir-dados.html";
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(target)).build();
    }

    @PostMapping("/excluir")
    public String excluir(@RequestParam String username, @RequestParam String password){
        Usuario usuario = usuarioRepository.findByCpf(username);

        if (usuario == null || !passwordEncoder.matches(password, usuario.getSenha())) {
            return "Usuário ou senha inválidos";
        }

        usuarioRepository.delete(usuario);
        return null;
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

