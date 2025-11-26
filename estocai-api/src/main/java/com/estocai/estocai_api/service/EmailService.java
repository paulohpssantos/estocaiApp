package com.estocai.estocai_api.service;

public interface EmailService {

    void sendPasswordResetEmail(String to, String subject, String htmlBody);
}