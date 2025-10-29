package com.estocai.estocai_api.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "estabelecimento")
public class Estabelecimento {

    @Id
    @Column(name = "cpf_cnpj", nullable = false, length = 14, unique = true)
    private String cpfCnpj;

    @ManyToOne
    @JoinColumn(name = "cpf", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private String nome;

    private String logradouro;

    @Column(length = 8)
    private String cep;

    @Column(length = 2)
    private String uf;

    private String municipio;

    @Column(length = 12)
    private String telefone;

    private String email;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean ativo = true;

}
