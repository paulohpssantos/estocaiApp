package com.estocai.estocai_api.service;

import com.estocai.estocai_api.model.Usuario;
import com.estocai.estocai_api.repository.UsuarioRepository;
import com.estocai.estocai_api.service.impl.EmailServiceImpl;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class UsuarioService {

    @PersistenceContext
    private EntityManager em;

    private final UsuarioRepository repo;
    private final EmailServiceImpl emailService;

    public UsuarioService(UsuarioRepository repo, EmailServiceImpl emailService) {
        this.repo = repo;
        this.emailService = emailService;
    }

    @Transactional
    public Usuario atualizarPlano(String cpf, String plano) {
        Usuario user = repo.findByCpf(cpf);
        if (user != null) {
            int mes;
            switch (plano.toUpperCase()) {
                case "MENSAL":
                    mes = 1;
                    break;
                case "SEMESTRAL":
                    mes = 6;
                    break;
                case "ANUAL":
                    mes = 12;
                    break;
                default:
                    mes = 0;
                    break;
            }

            LocalDate start = LocalDate.now();
            LocalDate end = start.plusMonths(mes).minusDays(1);
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            String startDate = start.format(fmt);
            String endDate = end.format(fmt);

            user.setPlano(plano.toUpperCase());
            user.setDataInicioPlano(LocalDate.parse(startDate));
            user.setDataExpiracao(LocalDate.parse(endDate));

            repo.save(user);

            //envia email de confirmação
            createContratoRenovadoEmail(user.getEmail(), user.getPlano(), mes, startDate, endDate);

            return user;
        }

        return null;

    }

    @Transactional
    public void createBoasVindasEmail(String email, String nome) {

        String subject = "Seu período de avaliação gratuita começou!";

        Map<String, Object> vars = Map.of(
                "name", nome
        );

        emailService.sendEmailUsingTemplate(email, subject, "boas-vindas", vars);
    }

    @Transactional
    public void createRenovacaoEmail(String email, String nome) {

        String subject = "Aviso de renovação do seu plano";

        Map<String, Object> vars = Map.of(
                "name", nome
        );

        emailService.sendEmailUsingTemplate(email, subject, "renovacao", vars);
    }

    @Transactional
    public void createContratoRenovadoEmail(String email, String planName, int mes, String startDate, String endDate) {

        String subject = "Aviso de confirmação do seu plano";

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        Map<String, Object> vars = Map.of(
                "planName", planName,
                "mes", mes,
                "startDate", String.format(startDate, fmt),
                "endDate", String.format(endDate, fmt)
        );

        emailService.sendEmailUsingTemplate(email, subject, "renovacao", vars);
    }

}
