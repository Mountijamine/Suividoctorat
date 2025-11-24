# SuiviDoctorat — Thesis Tracking Platform

This repository contains a microservice-based platform to manage doctoral thesis workflows: user authentication, document uploads, and "soutenance" (thesis defense) requests. It includes Spring Boot backend services and an Angular frontend application.

This README (English) summarizes current features and developer instructions (Nov 2025).

## Key Features

- Authentication & role management (candidate, encadrant, admin).
- Candidates can create and manage soutenance requests and upload supporting documents.
- Encadrants can review and manage all soutenance requests, update statuses, and add jury members. Encadrants cannot create new requests.
- Role-based UI: different navigation and available actions depending on the authenticated role.
- Modular microservices: config server, eureka, gateway, notification, inscription, etc.

## Current Soutenance Behavior (summary)

- Candidate (`CANDIDAT`):
  - Create new soutenance requests (title, specialty, abstract).
  - Upload related documents and manage only their own requests.

- Encadrant (`ENCADRANT`):
  - View and manage all soutenance requests.
  - Change request status (proposed, authorized, scheduled, finished, rejected).
  - Add jury members to requests.
  - Cannot create new soutenance requests.

Note: the frontend normalizes role strings such as `role_encadrant` or `ENCADRANT` to `encadrant` for UI logic.

## Repository layout (high level)

- `frontend-app/` — Angular SPA (default dev server: `http://localhost:4200`).
- `gestion-auth-service/` — Authentication and user management (Spring Boot).
- `soutenance-service/` — Soutenance management (Spring Boot).
- `inscription-service/`, `notification-service/`, `gateway/`, `eureka-server/`, `config-server/` — supporting microservices.

## Local development quick start

Prerequisites: Java 17+, Maven, Node.js and npm, MySQL (or compatible DB).

1) Database

   - Create a MySQL database:
     ```sql
     CREATE DATABASE suividoctorat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
   - Adjust database credentials in each service's `application.properties` as needed.

2) Start backend service(s)

   - Example: run the soutenance service:
     ```powershell
     cd "d:\S final\suividoctorat\soutenance-service"
     ./mvnw.cmd spring-boot:run
     ```
   - Default soutenance API base: `http://localhost:8096` (check `application.properties`).

3) Frontend

   ```powershell
   cd "d:\S final\suividoctorat\frontend-app"
   npm install    # if missing
   npm start      # runs ng serve (http://localhost:4200)
   ```

   - If your browser shows an old cached page, do a hard reload (Ctrl+Shift+R) or restart the dev server.

## Important API endpoints (soutenance)

- `GET /api/soutenance/demandes` — list demandes.
- `GET /api/soutenance/demandes/{id}` — fetch a demande.
- `POST /api/soutenance/demandes` — create a demande (candidate only).
- `PUT /api/soutenance/demandes/{id}` — update a demande.
- `POST /api/soutenance/demandes/{id}/jury` — add a jury member (encadrant only).

Frontend route: `/soutenance` or `/soutenances` (soutenance dashboard).

## Developer & debugging notes

- Role normalization: frontend strips a `role_` prefix and lowercases role strings before using them for UI decisions.
- If an encadrant isn't seeing all demandes:
  - Check the frontend debug banner (shows detected role & email).
  - Verify `GET /api/soutenance/demandes` returns all demandes using curl or Postman.
- Common Angular template issue: call signals as functions when needed (e.g., `showStatusComment()` not `showStatusComment`).

## Git / Contributions

- Configure git identity so commits are attributed to your GitHub account:

  ```powershell
  git config --global user.name "Your Name"
  git config --global user.email "you@example.com"
  ```

- Preferred workflow: feature branch → push → open Pull Request → merge into default branch. Merged commits on default branch count as contributions on GitHub.

## Suggested next improvements

- Add tests for soutenance creation and encadrant workflows.
- Implement pagination and server-side filtering for the demandes endpoint.
- Harden file uploads (use object storage and signed URLs in production).

## Contact

If you want, I can create a PR with this README content as `README.md` (overwrite) or leave this file as `README_EN.md` and keep the original for reference. Tell me which you prefer and I will proceed.
