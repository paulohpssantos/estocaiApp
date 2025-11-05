package com.estocai.estocai_api.repository;

import com.estocai.estocai_api.model.ProdutoOrdemServico;
import com.estocai.estocai_api.model.ServicoOrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ServicoOrdemServicoRepository extends JpaRepository<ServicoOrdemServico, Long> {

    List<ServicoOrdemServico> findByOrdemServicoId(Long ordemServicoId);

    int deleteByOrdemServicoId(Long ordemServicoId);
}
