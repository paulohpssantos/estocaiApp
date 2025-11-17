package com.estocai.estocai_api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "produto")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private String nome;

    private String descricao;

    @NotNull
    @Digits(integer = 17, fraction = 2)
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal valor;

    @NotNull
    @Column(nullable = false)
    private Long qtdEstoque;

    @NotNull
    @Column(nullable = false)
    private Long estoqueMinimo;

    private LocalDate dataFabricacao;

    private LocalDate dataValidade;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "usuario_cpf", nullable = false, referencedColumnName = "cpf")
    private Usuario usuario;

}
