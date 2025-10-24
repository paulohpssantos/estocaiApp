package com.estocai.estocai_api.repository;

import com.estocai.estocai_api.model.Estabelecimento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EstabelecimentoRepository extends JpaRepository<Estabelecimento, Long> {

    List<Estabelecimento> findByUsuarioCpf(String cpf);
}
