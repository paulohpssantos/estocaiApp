package com.estocai.estocai_api.service.impl;


import com.estocai.estocai_api.service.EmailService;
import com.estocai.estocai_api.service.GmailOAuth2TokenService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.lang.Nullable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final String from;
    private final GmailOAuth2TokenService tokenService;

    public EmailServiceImpl(JavaMailSender mailSender,
                            TemplateEngine templateEngine,
                            @Value("${spring.mail.username}") String from,
                            @Nullable GmailOAuth2TokenService tokenService) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.from = from;
        this.tokenService = tokenService;
    }

    public void sendEmail(String to, String subject, String htmlBody) {
        try {
            // Se estiver usando OAuth2 via GmailOAuth2TokenService, atualiza o access token antes do envio
            if (mailSender instanceof JavaMailSenderImpl && tokenService != null) {
                String accessToken = tokenService.refreshAccessToken();
                ((JavaMailSenderImpl) mailSender).setPassword(accessToken);
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            ClassPathResource logo = new ClassPathResource("static/img/estocai_old.png");
            helper.addInline("estocaiLogo", logo);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Erro enviando email", e);
        }
    }

    // Método utilitário: renderiza template Thymeleaf e envia
    public void sendEmailUsingTemplate(String to, String subject, String templateName, Map<String, Object> variables) {
        Context ctx = new Context();
        if (variables != null) ctx.setVariables(variables);
        String html = templateEngine.process(templateName, ctx);
        sendEmail(to, subject, html);
    }




}
