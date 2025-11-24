package com.estocai.estocai_api.repository;

import com.estocai.estocai_api.model.ProdutoOrdemServico;
import com.estocai.estocai_api.model.ServicoOrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ServicoOrdemServicoRepository extends JpaRepository<ServicoOrdemServico, Long> {

    List<ServicoOrdemServico> findByOrdemServicoId(Long ordemServicoId);

    @Modifying
    @Query("delete from ServicoOrdemServico p where p.ordemServico.id = :ordemId")
    int deleteByOrdemServicoId(@Param("ordemId") Long ordemId);
}
