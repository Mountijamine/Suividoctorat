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
```

## Notifications

Set `app.notification.url` in `src/main/resources/application.properties` to your `notification-service` endpoint (e.g. `http://localhost:8094/api/notifications`). When users sign up requesting a profile the auth service will POST a small payload to this URL (best-effort). Notification failures are ignored by the auth service.

## Next steps

- Add tests for signup/approve/reject flows.
- Integrate notification-service for production with authentication and retries.

## Troubleshooting: IllegalArgumentException when approving users

If you see an error like:

```
java.lang.IllegalArgumentException: Name for argument of type [java.lang.String] not specified, and parameter name information not available via reflection. Ensure that the compiler uses the '-parameters' flag.
```

Root cause:

- This happens when Spring MVC cannot determine the name of a handler method parameter for binding (e.g. a String argument annotated with `@RequestParam`). The JVM only exposes parameter names at runtime if the code was compiled with the `-parameters` flag. If the project is not compiled that way, Spring needs explicit names in `@RequestParam("name")`.

What we changed to fix it:

- Controller methods that accept form parameters now use explicit parameter names, for example:

```java
public String approveUser(@RequestParam("email") String email, Principal principal) { ... }
```

This avoids requiring the `-parameters` compiler flag and fixes the exception when approving/rejecting or assigning roles via the admin UI.

Admin logout

- The admin page includes a logout link at `/logout`. The logout handler clears the JWT cookie and invalidates the server session, then redirects to `/login`.

If you still hit problems when approving a user:

1. Check the server logs for the exact stack trace and the failing controller method name/line.
2. Verify your browser is including the CSRF token in the form POSTs (the admin UI forms include CSRF token as a cookie-based repository).
3. If you compiled the app with a custom build step that removes parameter names, ensure controller parameters carry explicit `@RequestParam("name")` annotations.

## Module 1 API endpoints (auth + user POVs)

Authentication / signup

- POST /api/auth/signup

  - Body (form or JSON): { email, password, confirmPassword, firstName, lastName, phone, acceptTerms, requestedProfile, affiliation }
  - Creates a user with requested profile. Admin approval may be required before role is granted.

- POST /api/auth/login
  - Body: { email, password }
  - Returns a JWT token (API) and sets a JWT cookie for web UI flows.

Profile (authenticated user)

- GET /profile

  - Returns the authenticated user's profile page (HTML). Shows approval status and roles.

- POST /profile
  - Fields: firstName, lastName, phone, affiliation, requestedProfile
  - Updates profile. If `requestedProfile` changes, approval is reset and admin must re-approve.

Documents (candidate upload / encadrant & admin views)

- Authenticated (candidate) multipart/form-data with `file` parameter. Stores file metadata and the file on disk under the `app.upload.dir` directory (default `./uploads`).
- Authenticated (candidate) multipart/form-data with `file` parameter. Stores file metadata and the file on disk under the `app.upload.dir` directory (default `./uploads`).
- Optional form fields: `title` (string) and `category` (string). These are saved with the document and can be used to filter documents in the UI.
- GET /documents/me

  - Upload a document (form field `file`). Form also accepts `title` and `category`. Redirects back to the documents page with success/error message.

- GET /documents/download/{id}

  - Download a document by id. Allowed for document owner or admin.

- GET /documents/all

  - Admin-only: list all documents (metadata).

- GET /documents/for-encadrant
  - Encadrant-only: lists documents from users with the same `affiliation` as the encadrant (simple heuristic).

Configuration

- `app.upload.dir` (property) controls where uploaded files are stored. Default `./uploads`.

Security notes

- Document endpoints check ownership and roles. Files are served from disk; in production consider using a secure object store and signed URLs.
