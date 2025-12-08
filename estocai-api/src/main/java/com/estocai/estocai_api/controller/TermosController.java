package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.Usuario;
import com.estocai.estocai_api.repository.UsuarioRepository;
import com.estocai.estocai_api.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@RestController
@RequestMapping("/termos-uso")
public class TermosController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    public TermosController(UsuarioRepository usuarioRepository, UsuarioService usuarioService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService  = usuarioService;
    }


    @GetMapping("/open")
    public ResponseEntity<Void> redirectToWeb(@RequestParam("cpf") String cpf) {
        String encoded = URLEncoder.encode(cpf, StandardCharsets.UTF_8);
        String target = "/termos-uso.html?cpf=" + encoded;
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(target)).build();
    }

    @GetMapping("/termos-uso.html")
    public ResponseEntity<Void> redirectResetHtml(@RequestParam(value = "cpf", required = false) String cpf) {
        String target = "/termos-uso.html" + (cpf != null ? "?cpf=" + URLEncoder.encode(cpf, StandardCharsets.UTF_8) : "");
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(target)).build();
    }

    @PostMapping("/aceitar")
    public String aceitarTermos(@RequestParam("cpf") String cpf,
                                @RequestParam(value = "leuContrato", required = false) String leuContrato) {
        Usuario user = usuarioRepository.findByCpf(cpf);
        if (user != null) {
            user.setLeuContrato(leuContrato != null);
            usuarioRepository.save(user);

            //enviar email de boas vindas
            usuarioService.createBoasVindasEmail(user.getEmail(), user.getNome());
        }
        return "redirect:/?aceito=true";
    }
}
