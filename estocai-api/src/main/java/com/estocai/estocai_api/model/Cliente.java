package com.estocai.estocai_api.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @Column(nullable = false, length = 14, unique = true)
    private String cpf;

    @ManyToOne
    @JoinColumn(name = "cpf_cnpj", nullable = false)
    private Estabelecimento estabelecimento;

    @Column(nullable = false)
    private String nome;

    @Column(length = 12, nullable = false)
    private String telefone;

    private String email;

    private String logradouro;

    private String numero;

    private String bairro;

    @Column(length = 8)
    private String cep;

    @Column(length = 2)
    private String uf;

    private String municipio;

    private LocalDate dataNascimento;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean ativo = true;


}
