package com.devbuild.gestionauth.security;

import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

public class TokenFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public TokenFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = null;
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            token = header.substring(7);
        } else {
            if (request.getCookies() != null) {
                for (jakarta.servlet.http.Cookie c : request.getCookies()) {
                    if ("JWT".equals(c.getName()) && StringUtils.hasText(c.getValue())) {
                        token = c.getValue();
                        break;
                    }
                }
            }
        }
        if (token != null) {
            try {
                Claims claims = jwtUtil.parseClaims(token);
                String username = claims.getSubject();
                String roles = (String) claims.get("roles");
                try { System.err.println("[TokenFilter] token valid for user=" + username + " roles=" + roles); } catch (Throwable t) {}
                Set authorities = java.util.Collections.emptySet();
                if (roles != null && !roles.isBlank()) {
                    authorities = Arrays.stream(roles.split(",")).map(r -> new org.springframework.security.core.authority.SimpleGrantedAuthority(r)).collect(Collectors.toSet());
                }
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(username, null, authorities);
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception ex) {
                try { System.err.println("[TokenFilter] token parse error: " + ex.getClass().getName() + ": " + ex.getMessage()); ex.printStackTrace(); } catch (Throwable t) {}
            }
        }
        filterChain.doFilter(request, response);
    }
}
