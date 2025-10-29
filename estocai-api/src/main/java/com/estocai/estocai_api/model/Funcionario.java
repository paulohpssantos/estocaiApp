package com.estocai.estocai_api.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "funcionario")
public class Funcionario {

    @Id
    @Column(nullable = false, length = 14, unique = true)
    private String cpf;

    @ManyToOne
    @JoinColumn(name = "cpf_cnpj", nullable = false)
    private Estabelecimento estabelecimento;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String cargo;

    @Column(length = 12)
    private String telefone;

    private String email;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean ativo = true;


}
