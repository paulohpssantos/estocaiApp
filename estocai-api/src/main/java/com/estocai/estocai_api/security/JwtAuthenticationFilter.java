package com.estocai.estocai_api.security;

import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${JWT_SECRET_KEY}")
    private String secretKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        //  Libera Actuator, Swagger e Auth do filtro JWT
        String path = request.getServletPath();
        if (path.startsWith("/actuator") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/auth")) {

            filterChain.doFilter(request, response);
            return;
        }

        // Continua validação normal do JWT
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                var claims = Jwts.parser()
                        .setSigningKey(secretKey)
                        .parseClaimsJws(token)
                        .getBody();

                String username = claims.getSubject();

                if (username != null) {
                    var auth = new UsernamePasswordAuthenticationToken(username, null, null);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
