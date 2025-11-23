package com.devbuild.gateway.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.config.CorsRegistry;
import org.springframework.web.reactive.config.WebFluxConfigurer;

@Configuration
public class CorsConfig implements WebFluxConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
    System.out.println("[CorsConfig] registering CORS mappings for /api/**");
        registry.addMapping("/api/**")
            .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*")
        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH","OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true)
        .exposedHeaders("Authorization");
    }
}
