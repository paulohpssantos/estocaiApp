package com.estocai.estocai_api.repository;

import com.estocai.estocai_api.model.Servico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServicoRepository extends JpaRepository<Servico, Long> {

    List<Servico> findByAtivo(boolean ativo);

    long countByAtivo(boolean ativo);
}
