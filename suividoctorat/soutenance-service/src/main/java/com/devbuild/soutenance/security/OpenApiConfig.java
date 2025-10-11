package com.devbuild.soutenance.security;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI/Swagger documentation configuration
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI soutenanceOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Soutenance Service API")
                .description("API de gestion des soutenances de thèse pour le portail de suivi du doctorat")
                .version("1.0.0")
                .contact(new Contact()
                    .name("DevBuild Team")
                    .email("support@devbuild.com"))
                .license(new License()
                    .name("Apache 2.0")
                    .url("https://www.apache.org/licenses/LICENSE-2.0.html")));
    }
}
