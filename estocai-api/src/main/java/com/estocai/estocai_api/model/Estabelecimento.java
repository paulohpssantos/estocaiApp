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

}
