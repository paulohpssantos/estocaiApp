package com.estocai.estocai_api.repository;

import com.estocai.estocai_api.model.OrdemServico;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long> {

    List<OrdemServico> findByUsuarioCpf(String cpf, Sort sort);

    long countByUsuarioCpf(String cpf);

}
