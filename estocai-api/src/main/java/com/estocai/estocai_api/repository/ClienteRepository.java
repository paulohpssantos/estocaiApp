package com.estocai.estocai_api.repository;

import com.estocai.estocai_api.model.Cliente;
import com.estocai.estocai_api.model.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    List<Cliente> findByUsuarioCpfAndAtivo(String usuarioCpf, boolean ativo);

    long countByUsuarioCpfAndAtivo(String usuarioCpf,boolean ativo);
}
