package com.estocai.estocai_api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @Column(nullable = false, length = 14, unique = true)
    private String cpf;

    @NotNull
    @Column(nullable = false)
    private String nome;

    @NotNull
    @Column(nullable = false, length = 12)
    private String celular;

    @NotNull
    @Column(nullable = false)
    private String senha;

    @NotNull
    @Column(nullable = false)
    private String email;

    @NotNull
    @Column(nullable = false)
    private String plano;

    @NotNull
    @Column(nullable = false)
    private LocalDate dataCadastro;

    @NotNull
    @Column(nullable = false)
    private LocalDate dataInicioPlano;

    @NotNull
    @Column(nullable = false)
    private LocalDate dataExpiracao;

    private LocalDateTime ultimoAcesso;

    @NotNull
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean leuContrato = false;



}