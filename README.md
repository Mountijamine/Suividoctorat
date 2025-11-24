- GET /documents/for-encadrant
  - Encadrant-only: lists documents from users with the same `affiliation` as the encadrant (simple heuristic).

Configuration

- `app.upload.dir` (property) controls where uploaded files are stored. Default `./uploads`.

Security notes

- Document endpoints check ownership and roles. Files are served from disk; in production consider using a secure object store and signed URLs.

## Campaigns (Inscription microservice) — integration notes

This service contains a small read-only placeholder for campaigns and an admin helper to assign encadrants to campaigns. Campaign management (creation, subscription, approval) belongs to Microservice 2 (Inscription). To integrate:

- Set `app.inscription.url` in `application.properties` or via environment variable to the base URL of the Inscription service (for example `http://localhost:8082`).
- The admin UI will then attempt to fetch campaigns from: `GET {app.inscription.url}/api/campaigns`.
- To assign an encadrant to a campaign, the admin UI will POST to: `POST {app.inscription.url}/api/campaigns/{campaignId}/assign-encadrant` with JSON body { "email": "encadrant@example.com", "assignedBy": "admin@example.com" }.

The assignment call is best-effort: if `app.inscription.url` is not configured the Admin UI shows a placeholder message and instructions. The Inscription microservice API is not implemented here — this module only demonstrates how to call it and reports the response.

Please coordinate API shape with the Inscription microservice. The expected integration points are:

- GET /api/campaigns — returns a JSON array of campaigns with fields { id, title, description }
- POST /api/campaigns/{campaignId}/assign-encadrant — body { email, assignedBy } — returns 2xx on success

Add these endpoints to the Inscription service or provide a proxy if you need to test end-to-end.

Candidate documents UI

- GET /candidat/documents (HTML page)

  - Shows the candidate's uploaded documents with a search/filter box.

- POST /candidat/documents/upload (form multipart)

  - Upload a document (form field `file`). Redirects back to the documents page with success/error message.

- POST /candidat/documents/delete
  - Delete a document by id (owner only). Uses CSRF-protected form.

Admin filters

- GET /documents/all (admin) — list all documents
- GET /documents?filter=... (future) — planned: add server-side filters and pagination for admin dashboards

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

## DB migration (quick)

If you already have an existing `users` table, run these ALTER statements to add the new columns used by the approval workflow:

```sql
ALTER TABLE users ADD COLUMN requested_profile VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN approved TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN affiliation VARCHAR(512) DEFAULT NULL;
-- proof_url column removed per request
ALTER TABLE users ADD COLUMN approved_by VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN approved_at DATETIME DEFAULT NULL;
ALTER TABLE users ADD COLUMN rejection_reason VARCHAR(1024) DEFAULT NULL;
