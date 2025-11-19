package com.estocai.estocai_api.repository;

import com.estocai.estocai_api.model.OrdemServicoUserSeq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdemServicoUserSeqRepository extends JpaRepository<OrdemServicoUserSeq, Long> {

}