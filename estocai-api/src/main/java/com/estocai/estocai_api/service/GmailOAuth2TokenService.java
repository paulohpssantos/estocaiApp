package com.estocai.estocai_api.service;

import java.io.IOException;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.UserCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GmailOAuth2TokenService {

    @Value("${spring.mail.client-id}")
    private String clientId;

    @Value("${spring.mail.client-secret}")
    private String clientSecret;

    @Value("${spring.mail.refresh-token}")
    private String refreshToken;

    public String refreshAccessToken() throws IOException {

        System.out.println("Refreshing access token using clientId=" + clientId + " refreshToken=" + refreshToken + " clientSecret=" + clientSecret);

        UserCredentials creds = UserCredentials.newBuilder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRefreshToken(refreshToken)
                .build();

        AccessToken token = creds.refreshAccessToken();
        return token.getTokenValue();
    }
}
