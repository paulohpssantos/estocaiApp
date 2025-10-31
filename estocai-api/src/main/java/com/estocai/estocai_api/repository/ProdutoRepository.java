package com.estocai.estocai_api.repository;

import com.estocai.estocai_api.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ProdutoRepository extends JpaRepository<Produto, Long> {

}
