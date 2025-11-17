package com.estocai.estocai_api.repository;

import com.estocai.estocai_api.model.Estabelecimento;
import com.estocai.estocai_api.model.Funcionario;
import jakarta.persistence.JoinColumn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {

    List<Funcionario> findByUsuarioCpfAndAtivo(String cpf, boolean ativo);

    List<Funcionario> findByEstabelecimentoCpfCnpjAndAtivo(String cpfCnpj, boolean ativo);

    long countByUsuarioCpfAndAtivo(String cpf,boolean ativo);
}
