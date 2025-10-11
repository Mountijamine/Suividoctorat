# SuiviDoctorat - microservices scaffold

This repository was scaffolded with simple modules to start a microservices architecture for a doctoral lifecycle platform.

Modules:
- common: DTOs and mappers
- auth-service: authentication (simple demo)
- doctorant-service: manages doctorants
- gateway: simple gateway that proxies to services

Build:
Use `mvn -T 1C clean install` at the project root (the parent pom) to build all modules.

Run:
Start services individually: each is a Spring Boot app. Example:
- Run `auth-service` on port 8082
- Run `doctorant-service` on port 8081
- Run `gateway` on port 8080

Gateway behaviour and troubleshooting:
- The gateway proxies requests to the doctorant-service at `http://localhost:8081/api/doctorants`.
- If the doctorant-service is not running, the gateway will now return a 503 Service Unavailable JSON response instead of a stack trace. Start `doctorant-service` first to avoid `Connection refused` errors.

Next steps: add Spring Security with JWT, MapStruct generated mappers, persistence, and Angular frontend.
