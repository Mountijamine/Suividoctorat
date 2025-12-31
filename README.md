<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">Suivi Doctorat</h3>
  <p align="center">
    A microservices-based PhD tracking and management system for doctoral student registration, defense scheduling, and administrative oversight.
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#screenshots">Screenshots</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

<a href="https://github.com/Hamza-Alali-0/BudgetPlanner">
    <img src="screens/home1.png" alt="Home Page" width="600">
</a>

Suivi Doctorat is a distributed PhD management platform built as a set of Spring Boot microservices and an Angular frontend. The system includes services for discovery, API gateway routing, authentication, student registration, defense scheduling, and notifications. It supports:

- **Student Registration**: Manage doctoral student enrollment and academic information.
- **Defense Management**: Schedule and track PhD defense sessions (soutenances).
- **Authentication & Authorization**: Secure user management with role-based access control.
- **Notifications**: Automated email/SMS notifications for important events and deadlines.
- **Centralized Configuration**: Dynamic configuration management across all services.
- **Admin Features**: Administrative dashboard for managing students, defenses, and system oversight.
- **Microservices Architecture**: Designed to run as modular services (see `config-server`, `eureka-server`, `gateway`, `gestion-auth-service`, `inscription-service`, `soutenance-service`, `notification-service`, `frontend-app`).

### Built With

This project is built with the following technologies:

- [![Java][Java.com]][Java-url]
- [![Spring Boot][SpringBoot.com]][SpringBoot-url]
- [![Spring Cloud][SpringCloud.com]][SpringCloud-url]
- [![Maven][Maven.com]][Maven-url]
- [![Angular][Angular.com]][Angular-url]
- [![MySQL][MySQL.com]][MySQL-url]

<!-- Reference-style links for images -->

[Java.com]: https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=java&logoColor=white
[Java-url]: https://www.java.com/
[SpringBoot.com]: https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=spring&logoColor=white
[SpringBoot-url]: https://spring.io/projects/spring-boot
[SpringCloud.com]: https://img.shields.io/badge/Spring%20Cloud-6DB33F?style=for-the-badge&logo=spring&logoColor=white
[SpringCloud-url]: https://spring.io/projects/spring-cloud
[Maven.com]: https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white
[Maven-url]: https://maven.apache.org/
[Angular.com]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[MySQL.com]: https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white
[MySQL-url]: https://www.mysql.com/

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ARCHITECTURE -->

## Architecture

The repo is organized into multiple services (each with its own `pom.xml`):

- `config-server` — centralized configuration management for all microservices
- `eureka-server` — service discovery and registration
- `gateway` — API gateway for routing and edge concerns
- `gestion-auth-service` — user authentication and authorization with role management
- `inscription-service` — doctoral student registration and profile management
- `soutenance-service` — PhD defense scheduling, jury management, and tracking
- `notification-service` — automated notifications (email/SMS) for events and deadlines
- `frontend-app` — Angular single-page application

These services communicate over HTTP, register with Eureka for discovery, and fetch their configuration from the config-server at startup.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- SCREENSHOTS -->

## Screenshots

Here are some screenshots of the project:

| How it works                |  Creators                 | Signup screen      |
| --------------------------- | ------------------------- | ----------------------- |
| ![dashboard][dashboard-img] | ![students][students-img] | ![defense][defense-img] |

[dashboard-img]: screens/HOME2.png
[students-img]: screens/CREATORS.png
[defense-img]: screens/SIGNUP.png

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To run the project locally, follow these steps for a minimal development setup.

### Prerequisites

- Java JDK 11+
- Maven 3.6+
- Node.js + npm (for the frontend)
- MySQL (create a database and import provided SQL files where applicable)

### Installation

1. Clone the repository

```sh
git clone <repo-url>
```

2. Configure MySQL databases for each service and import initial SQL files if provided (check `inscription-service/db/migration_module2.sql`).

3. Update configuration files in `config-repo/` directory:

   - `application.yml` - common configuration
   - `gateway.yml` - gateway routing rules
   - `gestion-auth-service.yml` - authentication service config
   - `inscription-service.yml` - registration service config
   - `soutenance-service.yml` - defense service config
   - `notification-service.yml` - notification service config

4. Build and run backend services in order (from repo root):

```sh
mvn clean install
# Start in this order:
mvn -pl config-server spring-boot:run
mvn -pl eureka-server spring-boot:run
mvn -pl gateway spring-boot:run
mvn -pl gestion-auth-service,inscription-service,soutenance-service,notification-service spring-boot:run
```

5. Run the Angular frontend (open a separate terminal):

```sh
cd frontend-app
npm install
npm start
```

Adjust configuration in `config-repo/*.yml` files for database URLs, ports, and service endpoints as needed.

