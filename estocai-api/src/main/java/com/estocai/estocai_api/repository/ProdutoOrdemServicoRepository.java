package com.estocai.estocai_api.repository;

import com.estocai.estocai_api.model.ProdutoOrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ProdutoOrdemServicoRepository extends JpaRepository<ProdutoOrdemServico, Long> {

    List<ProdutoOrdemServico> findByOrdemServicoId(Long ordemServicoId);

    int deleteByOrdemServicoId(Long ordemServicoId);
}
