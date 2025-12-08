package com.estocai.estocai_api.model;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "parametros")
public class Parametros {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer diasTeste;

    @Lob
    @Column(name = "texto_contrato", columnDefinition = "text")
    private String textoContrato;

    @Column(length = 14, unique = true)
    private String cpfUsuario;


}
