package com.estocai.estocai_api.repository;


import com.estocai.estocai_api.model.Produto;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findByUsuarioCpf(String cpf, Sort sort);

    long countByUsuarioCpf(String cpf);


}
