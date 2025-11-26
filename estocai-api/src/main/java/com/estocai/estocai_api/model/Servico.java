package com.estocai.estocai_api.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "servico")
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private String nome;

    private String descricao;

    @NotNull
    @Digits(integer = 17, fraction = 2)
    @Column(precision = 19, scale = 2)
    private BigDecimal valor;

    @Column(name = "duracao", columnDefinition = "TIME")
    @DateTimeFormat(pattern = "HH:mm")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime duracao;

    @NotNull
    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean ativo = true;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "usuario_cpf", nullable = false, referencedColumnName = "cpf")
    private Usuario usuario;

}
