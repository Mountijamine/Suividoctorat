Config Server module

This module runs a Spring Cloud Config Server that serves configuration from a local git repository.

Quick start

1. Create a local git repo for config files (example path used by default):
   mkdir %USERPROFILE%\suividoctorat-config-repo
   cd %USERPROFILE%\suividoctorat-config-repo
   git init
   echo "# sample config" > application.yml
   git add . && git commit -m "initial"

2. Run Eureka server and then run config-server:
   cd eureka-server
   .\mvnw.cmd -DskipTests spring-boot:run

   cd ..\config-server
   .\mvnw.cmd -DskipTests spring-boot:run

3. Access config server:
   http://localhost:8888/application/main

Customize

- Edit `src/main/resources/application.properties` to change `spring.cloud.config.server.git.uri` and `default-label` to the branch you want.
