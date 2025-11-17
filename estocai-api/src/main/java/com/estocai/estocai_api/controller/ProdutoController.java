package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.Produto;
import com.estocai.estocai_api.repository.ProdutoRepository;
import org.springframework.data.domain.Sort;
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
    public List<Produto> getProdutos(@RequestParam String cpf) {
        if (cpf != null)
            return produtoRepository.findByUsuarioCpf(cpf, Sort.by("id").ascending());
        return null;
    }

    @GetMapping("/count/{cpf}")
    public long totalCount(@PathVariable String cpf) {
        return produtoRepository.countByUsuarioCpf(cpf);
    }
}

