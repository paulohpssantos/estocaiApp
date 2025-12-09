package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.Usuario;
import com.estocai.estocai_api.repository.UsuarioRepository;
import com.estocai.estocai_api.service.UsuarioService;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${APP_URL}")
    private String appUrl;

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
    public ResponseEntity<Void> aceitarTermos(@RequestParam("cpf") String cpf,
                                @RequestParam(value = "leuContrato", required = false) String leuContrato) {
        try {
            Usuario user = usuarioRepository.findByCpf(cpf);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            user.setLeuContrato(leuContrato != null);
            usuarioRepository.save(user);

            usuarioService.createBoasVindasEmail(user.getEmail(), user.getNome());

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }


//        String cpfEncoded = URLEncoder.encode(cpf, StandardCharsets.UTF_8);
//        String appUrlEncoded = URLEncoder.encode(appUrl, StandardCharsets.UTF_8);
//
//        // redireciona para a página intermediária estática passando cpf e appUrl
//        String target = "/open-app.html?cpf=" + cpfEncoded + "&appUrl=" + appUrlEncoded;
//        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(target)).build();
    }
}
