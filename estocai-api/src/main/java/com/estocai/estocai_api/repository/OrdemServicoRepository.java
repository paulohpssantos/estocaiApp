package com.estocai.estocai_api.repository;

import com.estocai.estocai_api.model.OrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long> {

    default long totalCount() {
        return count();
    }

}
