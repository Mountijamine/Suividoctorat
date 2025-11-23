# Suividoctorat - SPA migration / local dev notes

This file documents the local development flow after migrating the UI to an Angular SPA.

Key points

- The frontend SPA lives in `frontend-app/`. Start it with `npm install` and `npm start` (use `-- --port 4300` if 4200 is in use).
- The auth microservice is `gestion-auth-service` and normally registers with Eureka. For local dev the client has been disabled to avoid errors when no Eureka server is running.
- The gateway at `gateway/` contains dev-friendly routes that forward `/api/auth/**` and any unmatched `/api/**` to `http://localhost:8091` (the local auth service) so the SPA can call APIs without a running Eureka server.

Running locally (PowerShell)

Start the backend services first (in separate shells):

```powershell
cd C:\Users\DELL\Desktop\doctorat\suividoctorat\gestion-auth-service
mvn -DskipTests spring-boot:run

cd C:\Users\DELL\Desktop\doctorat\suividoctorat\gateway
mvn -DskipTests spring-boot:run
```

Start the frontend (another shell):

```powershell
cd C:\Users\DELL\Desktop\doctorat\suividoctorat\frontend-app
npm install
npm start -- --port 4300
```

Eureka and production mode

- For production or full microservice testing, run a Eureka server and re-enable Eureka clients by removing `eureka.client.enabled=false` from `gestion-auth-service/src/main/resources/application.properties` and updating the gateway routes to use `lb://` service IDs. The current setting disables the Eureka client in the auth service so it won't attempt to contact a non-existent Eureka server (which produced `com.netflix.discovery.shared.transport.TransportException`).

If you want, I can add a lightweight Eureka server module to this repo for local testing and wire it into the gateway and services.
