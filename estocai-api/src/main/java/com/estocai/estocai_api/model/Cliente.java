package com.estocai.estocai_api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 14, unique = true)
    private String cpf;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "cpf_cnpj", nullable = false)
    private Estabelecimento estabelecimento;

    @NotNull
    @Column(nullable = false)
    private String nome;

    @NotNull
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

    @NotNull
    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean ativo = true;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "usuario_cpf", nullable = false, referencedColumnName = "cpf")
    private Usuario usuario;

}
