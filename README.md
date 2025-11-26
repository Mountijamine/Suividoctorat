# Suivi Doctorat

A comprehensive microservices-based platform for managing doctoral studies, designed to streamline the administration of PhD programs, candidate registration, document management, and defense scheduling.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Microservices](#microservices)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Development](#development)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Suivi Doctorat is a full-stack application built with a microservices architecture that provides:

- **User Management**: Role-based authentication and authorization (Admin, Encadrant, Candidat)
- **Registration Management**: Campaign creation, candidate subscriptions, and approval workflows
- **Document Management**: Secure document upload, storage, and access control
- **Defense Scheduling**: Management of PhD defense sessions (Soutenance)
- **Notifications**: Real-time notifications for important events
- **Admin Dashboard**: Comprehensive administrative tools for managing the entire system

## 🏗️ Architecture

The application follows a microservices architecture pattern with the following components:

```
┌─────────────────┐
│  Frontend (Vue) │
└────────┬────────┘
         │
    ┌────▼─────┐
    │  Gateway │
    └────┬─────┘
         │
    ┌────▼──────────┐
    │ Eureka Server │
    └────┬──────────┘
         │
    ┌────▼──────────────────────────────────┐
    │                                        │
┌───▼────┐  ┌──────────┐  ┌──────────┐  ┌──▼─────────┐
│  Auth  │  │Inscription│  │Soutenance│  │Notification│
│Service │  │ Service  │  │ Service  │  │  Service   │
└────────┘  └──────────┘  └──────────┘  └────────────┘
```

### Core Services:

- **Config Server**: Centralized configuration management
- **Eureka Server**: Service discovery and registry
- **Gateway**: API Gateway for routing and load balancing
- **Gestion Auth Service**: Authentication, authorization, and user management
- **Inscription Service**: Campaign and registration management
- **Soutenance Service**: Defense scheduling and management
- **Notification Service**: Email and real-time notifications
- **Frontend App**: Vue.js-based user interface

## 🛠️ Technologies

### Backend:
- **Java 17**
- **Spring Boot 3.x**
- **Spring Cloud** (Config, Eureka, Gateway)
- **Spring Security** with JWT
- **Spring Data JPA**
- **MySQL** / MariaDB
- **Maven**

### Frontend:
- **Vue.js 3**
- **Axios**
- **Bootstrap / Tailwind CSS**

### DevOps:
- **Docker** (optional)
- **Git**

## 📋 Prerequisites

Before running this application, ensure you have:

- **JDK 17** or higher
- **Maven 3.6+**
- **Node.js 16+** and npm
- **MySQL 8.0+** or MariaDB
- **Git**
- **XAMPP** (optional, for local MySQL)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Mountijamine/Suividoctorat.git
cd Suividoctorat
```

### 2. Database Setup

Start MySQL (XAMPP or standalone) and create the database:

```sql
CREATE DATABASE suividoctorat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure Database Connection

Update the database credentials in each service's `application.properties` file:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/suividoctorat
spring.datasource.username=root
spring.datasource.password=your_password
```

### 4. Build the Project

```bash
mvn clean install
```

### 5. Start Services (in order)

#### Step 1: Start Config Server
```bash
mvn -pl config-server spring-boot:run
```

#### Step 2: Start Eureka Server
```bash
mvn -pl eureka-server spring-boot:run
```

#### Step 3: Start Gateway
```bash
mvn -pl gateway spring-boot:run
```

#### Step 4: Start Microservices
```bash
# Auth Service
mvn -pl gestion-auth-service spring-boot:run

# Inscription Service
mvn -pl inscription-service spring-boot:run

# Soutenance Service
mvn -pl soutenance-service spring-boot:run

# Notification Service
mvn -pl notification-service spring-boot:run
```

#### Step 5: Start Frontend
```bash
cd frontend-app
npm install
npm run serve
```

### 6. Access the Application

- **Frontend**: http://localhost:8080
- **Gateway**: http://localhost:8088
- **Eureka Dashboard**: http://localhost:8761
- **Auth Service**: http://localhost:8091

## 📦 Microservices

### Gestion Auth Service (Port: 8091)

Handles authentication, authorization, and user management.

**Key Features:**
- User registration with email verification
- JWT-based authentication
- Role-based access control (Admin, Encadrant, Candidat)
- User approval workflow
- Profile management

**Endpoints:**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/assign-role` - Assign roles (Admin only)
- `GET /api/users/pending` - List pending approvals (Admin only)
- `POST /api/users/{id}/approve` - Approve user (Admin only)

**Web Forms:**
- http://localhost:8091/signup
- http://localhost:8091/login

**Development Mode:**

Run with `dev` profile for auto-seeded admin user:

```bash
mvn -pl gestion-auth-service spring-boot:run -Dspring-boot.run.profiles=dev
```

Default admin credentials (dev mode):
- Email: `admin@local`
- Password: `admin123`

### Inscription Service (Port: 8082)

Manages registration campaigns and candidate subscriptions.

**Key Features:**
- Campaign creation and management
- Candidate subscription workflow
- Encadrant assignment to campaigns
- Document submission requirements
- Approval/rejection workflow

### Soutenance Service (Port: 8083)

Handles defense scheduling and management.

**Key Features:**
- Defense session scheduling
- Jury member assignment
- Room allocation
- Candidate defense tracking
- Result recording

### Notification Service (Port: 8084)

Provides notification functionality.

**Key Features:**
- Email notifications
- Real-time alerts
- Event-driven notifications
- Template management

### Document Management

Integrated into Auth Service for secure document handling.

**Key Features:**
- Secure file upload
- Role-based access control
- Document versioning
- Search and filter capabilities

**Endpoints:**
- `GET /documents/for-encadrant` - List documents by affiliation (Encadrant only)
- `GET /candidat/documents` - Candidate document dashboard
- `POST /candidat/documents/upload` - Upload document
- `POST /candidat/documents/delete` - Delete owned document
- `GET /documents/all` - List all documents (Admin only)

**Configuration:**
```properties
app.upload.dir=./uploads  # Document storage directory
```

## 🔌 API Documentation

### Campaign Integration

To integrate with the Inscription service:

**Configuration:**
```properties
app.inscription.url=http://localhost:8082
```

**Expected API Endpoints:**
- `GET /api/campaigns` - Returns campaigns with `{ id, title, description }`
- `POST /api/campaigns/{campaignId}/assign-encadrant` - Body: `{ email, assignedBy }`

The admin UI will fetch campaigns and allow encadrant assignment. If `app.inscription.url` is not configured, a placeholder message with instructions will be shown.

## ⚙️ Configuration

### Application Properties

Each microservice can be configured through its `application.properties` file:

**Common Properties:**
```properties
# Server Configuration
server.port=8091

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/suividoctorat
spring.datasource.username=root
spring.datasource.password=

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Eureka Client
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

**Auth Service Specific:**
```properties
# JWT Configuration
jwt.secret=your-secret-key
jwt.expiration=86400000

# Upload Directory
app.upload.dir=./uploads

# Email Configuration (for future features)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-password
```

### Environment Variables

You can override properties using environment variables:

```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/suividoctorat
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=your_password
export JWT_SECRET=your-secret-key
```

## 💻 Development

### Running Individual Services

```bash
# Using Maven wrapper (Windows)
./mvnw.cmd -pl service-name spring-boot:run

# Using Maven wrapper (Linux/Mac)
./mvnw -pl service-name spring-boot:run

# With specific profile
./mvnw.cmd -pl gestion-auth-service spring-boot:run -Dspring-boot.run.profiles=dev
```

### Database Migration

If you have an existing `users` table, run these ALTER statements to add columns for the approval workflow:

```sql
ALTER TABLE users ADD COLUMN requested_profile VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN approved TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN affiliation VARCHAR(512) DEFAULT NULL;
ALTER TABLE users ADD COLUMN approved_by VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN approved_at DATETIME DEFAULT NULL;
ALTER TABLE users ADD COLUMN rejection_reason VARCHAR(1024) DEFAULT NULL;
```

### Development Tools

**Hot Reload:**
- Frontend: Vue.js hot module replacement is enabled by default with `npm run serve`
- Backend: Use Spring Boot DevTools for automatic restart on code changes

**IDE Setup:**
- IntelliJ IDEA: Import as Maven project
- VS Code: Install Java Extension Pack and Spring Boot Extension Pack
- Eclipse: Import as Existing Maven Project

### Testing

```bash
# Run all tests
mvn test

# Run tests for specific service
mvn -pl gestion-auth-service test

# Run with coverage
mvn test jacoco:report
```

## 🔒 Security

### Authentication & Authorization

- **JWT Tokens**: All API endpoints are secured with JWT-based authentication
- **Role-Based Access Control**: Three main roles (Admin, Encadrant, Candidat)
- **Password Encryption**: BCrypt hashing for secure password storage
- **CSRF Protection**: Enabled for form submissions

### Security Best Practices

⚠️ **Important for Production:**

1. **Change Default Credentials**: Update the seeded admin password
2. **Disable Dev Profile**: Remove or disable the `dev` profile and `EnsureAdminPassword` helper
3. **Secure JWT Secret**: Use a strong, randomly generated JWT secret key
4. **Use HTTPS**: Enable SSL/TLS for all communications
5. **Object Storage**: Replace file system storage with secure object store (AWS S3, Azure Blob) and use signed URLs
6. **Environment Variables**: Store sensitive configuration in environment variables, not in properties files
7. **Database Security**: Use strong database passwords and restrict database access

### Document Security

- Document endpoints verify ownership and roles
- Files are served from disk in development
- **Production recommendation**: Use a secure object store and pre-signed URLs

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow Java Code Conventions
- Use meaningful variable and method names
- Add comments for complex logic
- Write unit tests for new features

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For questions or support, please contact:

- **Repository**: [https://github.com/Mountijamine/Suividoctorat](https://github.com/Mountijamine/Suividoctorat)
- **Issues**: [https://github.com/Mountijamine/Suividoctorat/issues](https://github.com/Mountijamine/Suividoctorat/issues)

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- Vue.js community for the frontend framework
- All contributors who have helped improve this project

---

**Note**: This is an educational/demonstration project. For production use, please review and implement appropriate security measures, monitoring, logging, and backup strategies.
