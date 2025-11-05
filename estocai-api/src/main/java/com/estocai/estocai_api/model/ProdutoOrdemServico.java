package com.estocai.estocai_api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "produto_ordem_servico")
public class ProdutoOrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "ordem_servico_id", nullable = false, referencedColumnName = "id")
    private OrdemServico ordemServico;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "produto_id", nullable = false, referencedColumnName = "id")
    private Produto produto;

    @NotNull
    @Column(nullable = false)
    private Long quantidade;

    @NotNull
    @Digits(integer = 17, fraction = 2)
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal valorTotal;

}
