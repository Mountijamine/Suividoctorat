Gestion Auth Service

Endpoints:
- POST /api/auth/signup {email,password,confirmPassword,firstName,lastName,phone,acceptTerms}
- POST /api/auth/login {email,password}
- POST /api/auth/assign-role {email,role} (requires authentication; admin only)

Setup with XAMPP / MySQL:
1. Start XAMPP and enable MySQL.
2. Create the database (phpMyAdmin or mysql CLI):

	CREATE DATABASE suividoctorat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

3. Verify MySQL credentials in `src/main/resources/application.properties` (default assumes root with no password).

Run locally:

	./mvnw.cmd -pl gestion-auth-service spring-boot:run

Web forms:
- http://localhost:8091/signup
- http://localhost:8091/login

Notes:
- The app uses JWT for API authentication. POST /api/auth/login returns {token: "..."}.
- `data.sql` seeds an admin user; change the password/hash for production.
- Email settings in properties are placeholders for future features.

Development helper:
- A development-only runner can reset the seeded admin user's password to a known value for local testing.
- To enable it, run the app with the `dev` profile enabled:

	./mvnw.cmd -pl gestion-auth-service spring-boot:run -Dspring-boot.run.profiles=dev

- The development admin credentials after enabling the `dev` profile will be:
	email: admin@local
	password: admin123

Additionally, on every startup a helper `EnsureAdminPassword` will ensure an admin user exists and that the stored password is a valid BCrypt hash. If not, it will reset the admin password to `admin123` for local convenience. Disable this behavior in production.

Remove or disable this helper in production.
