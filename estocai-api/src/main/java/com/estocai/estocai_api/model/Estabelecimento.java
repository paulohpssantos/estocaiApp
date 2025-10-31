package com.estocai.estocai_api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
@Table(name = "estabelecimento")
public class Estabelecimento {

    @Id
    @Column(name = "cpf_cnpj", nullable = false, length = 14, unique = true)
    private String cpfCnpj;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "cpf", nullable = false)
    private Usuario usuario;

    @NotNull
    @Column(nullable = false)
    private String nome;

    private String logradouro;

    private String bairro;

    private String numero;

    @Column(length = 8)
    private String cep;

    @Column(length = 2)
    private String uf;

    private String municipio;

    @Column(length = 12)
    private String telefone;

    private String email;

    @NotNull
    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean ativo = true;

}
