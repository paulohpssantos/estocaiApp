package com.estocai.estocai_api.repository;

import com.estocai.estocai_api.model.Estabelecimento;
import com.estocai.estocai_api.model.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {

    List<Funcionario> findByAtivo(boolean ativo);
}
