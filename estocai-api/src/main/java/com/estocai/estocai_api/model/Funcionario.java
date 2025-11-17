package com.estocai.estocai_api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
@Table(name = "funcionario")
public class Funcionario {

    @Id
    @Column(nullable = false, length = 14, unique = true)
    private String cpf;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "cpf_cnpj", nullable = false)
    private Estabelecimento estabelecimento;

    @NotNull
    @Column(nullable = false)
    private String nome;

    @NotNull
    @Column(nullable = false)
    private String cargo;

    @NotNull
    @Column(length = 12)
    private String telefone;

    private String email;

    @NotNull
    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean ativo = true;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "usuario_cpf", nullable = false, referencedColumnName = "cpf")
    private Usuario usuario;
}
