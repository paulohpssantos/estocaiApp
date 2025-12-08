package com.estocai.estocai_api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "ordem_servico")
public class OrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "numero_os", nullable = false)
    private String numeroOS;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "cpf_cnpj", nullable = false)
    private Estabelecimento estabelecimento;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "funcionario_cpf", nullable = false, referencedColumnName = "cpf")
    private Funcionario funcionario;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false, referencedColumnName = "id")
    private Cliente cliente;

    @NotNull
    @Column(nullable = false)
    private LocalDate dataAbertura;

    private String observacoes;

    @NotNull
    @Column(nullable = false)
    private String status;

    @NotNull
    @Digits(integer = 17, fraction = 2)
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal valorTotal;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "usuario_cpf", nullable = false, referencedColumnName = "cpf")
    private Usuario usuario;

}
