package com.devbuild.gestionauth.security;

import com.devbuild.gestionauth.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final boolean devApiOpen;

    public SecurityConfig(UserDetailsService userDetailsService, JwtUtil jwtUtil, org.springframework.core.env.Environment env) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.devApiOpen = Boolean.parseBoolean(env.getProperty("app.dev.api-open", "false"));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        TokenFilter tokenFilter = new TokenFilter(jwtUtil);
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> {
                // Allow signup/login/verification endpoints without auth
                auth.requestMatchers(HttpMethod.POST, "/api/auth/signup", "/api/auth/login",
                    "/api/auth/send-verification-code", "/api/auth/verify-code",
                    "/api/auth/password-reset/request", "/api/auth/password-reset/confirm").permitAll();
                auth.requestMatchers(HttpMethod.GET, "/api/auth/confirm").permitAll();
                auth.requestMatchers(HttpMethod.OPTIONS, "/api/**").permitAll();
            
                auth.requestMatchers("/", "/index.html", "/static/**", "/assets/**", "/favicon.ico").permitAll();
                auth.requestMatchers(HttpMethod.GET, "/profile").permitAll();
                auth.requestMatchers(HttpMethod.POST, "/profile").authenticated();
                auth.requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN");
               
                auth.requestMatchers("/api/**").authenticated();
                auth.anyRequest().denyAll();
            })
            .addFilterBefore(tokenFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
