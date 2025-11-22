package com.devbuild.gestionauth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expirationMs;

    public JwtUtil(@Value("${app.jwt.secret:}") String secret,
                   @Value("${app.jwt.expiration-ms:86400000}") long expirationMs) {
        if (secret == null || secret.isBlank()) {
            String errorMsg = "[JwtUtil] CRITICAL: 'app.jwt.secret' is not configured! Cannot start service without a JWT secret. " +
                             "Check Config Server connection or application.properties.";
            System.err.println(errorMsg);
            throw new IllegalStateException(errorMsg);
        }
        
        byte[] keyBytes;
        if (secret.startsWith("base64:")) {
            keyBytes = java.util.Base64.getDecoder().decode(secret.substring(7));
        } else {
            keyBytes = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        }
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret is too short; require at least 32 bytes of entropy (use a base64 string or a longer secret).");
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        // Log a masked snippet so developers can verify which secret was loaded (without printing full secret)
        try {
            String marker = secret.startsWith("base64:") ? "base64:" : "raw:";
            String visible = "";
            if (secret.startsWith("base64:")) {
                String s = secret.substring(7);
                visible = s.length() > 8 ? s.substring(0, 8) + "..." : s;
            } else {
                visible = secret.length() > 8 ? secret.substring(0, 8) + "..." : secret;
            }
            System.err.println("[JwtUtil] Using JWT secret from config (" + marker + " len=" + keyBytes.length + ") visible=" + visible);
        } catch (Throwable t) {}
        this.expirationMs = expirationMs;
        try { System.err.println("[JwtUtil] Token expiration configured: " + (expirationMs / 1000 / 60) + " minutes"); } catch (Throwable t) {}
    }

    public String generateToken(String username, Set<String> roles) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles.stream().collect(Collectors.joining(",")))
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }
}
