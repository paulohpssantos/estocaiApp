package com.estocai.estocai_api.controller;

import com.estocai.estocai_api.model.Parametros;
import com.estocai.estocai_api.model.Produto;
import com.estocai.estocai_api.repository.ParametroRepository;
import com.estocai.estocai_api.repository.ProdutoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/parametros")
public class ParametroController {

    private final ParametroRepository parametroRepository;

    public ParametroController(ParametroRepository parametroRepository) {
        this.parametroRepository = parametroRepository;
    }


    @PostMapping
    public Parametros salvar(@RequestBody Parametros param){
        return parametroRepository.save(param);
    }


    @GetMapping
    public List<Parametros> getParametros() {
        return parametroRepository.findAll();
    }

}

