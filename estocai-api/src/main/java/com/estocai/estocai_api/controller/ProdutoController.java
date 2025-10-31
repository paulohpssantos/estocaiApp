package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.Produto;
import com.estocai.estocai_api.model.Usuario;
import com.estocai.estocai_api.repository.ProdutoRepository;
import com.estocai.estocai_api.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/produto")
public class ProdutoController {

    private final ProdutoRepository produtoRepository;

    public ProdutoController(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }


    @PostMapping
    public Produto salvar(@RequestBody Produto produto){
        return produtoRepository.save(produto);
    }

    @GetMapping
    public List<Produto> getProdutos(){
        return produtoRepository.findAll(org.springframework.data.domain.Sort.by("id").ascending());
    }
}

