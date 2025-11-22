package com.devbuild.gestionauth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class GestionAuthApplication {
    public static void main(String[] args) {
        SpringApplication.run(GestionAuthApplication.class, args);
    }
}
