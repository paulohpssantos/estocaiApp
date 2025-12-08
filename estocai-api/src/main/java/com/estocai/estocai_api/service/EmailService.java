package com.estocai.estocai_api.service;

public interface EmailService {

    void sendEmail(String to, String subject, String htmlBody);
}