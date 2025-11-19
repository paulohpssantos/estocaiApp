package com.estocai.estocai_api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "ordem_servico_user_seq")
public class OrdemServicoUserSeq {

    @Id
    @Column(nullable = false, length = 14, unique = true)
    private String usuarioCpf;

    @Column(nullable = false)
    private Long lastValue = 0L;


}