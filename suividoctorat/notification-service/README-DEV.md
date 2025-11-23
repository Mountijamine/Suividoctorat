Notification service — Development mail setup
=========================================

This file describes how to capture sent emails in development using MailHog (recommended) or Mailtrap.

1) Using MailHog (recommended, local)

- Start MailHog with Docker:

```powershell
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

- MailHog will expose:
  - SMTP server: `localhost:1025` (used by the app)
  - Web UI: http://localhost:8025 (view captured emails)

- The project includes `application-dev.yml` (Spring profile `dev`) configured to use MailHog.

2) Using Mailtrap (alternative)

- Sign up at https://mailtrap.io and get SMTP credentials.
- Update `application-dev.yml` Mailtrap block with your `username` and `password` (uncomment Mailtrap block).

3) Run the notification-service with the `dev` profile

```powershell
mvn -pl notification-service spring-boot:run -Dspring-boot.run.profiles=dev
```

4) Test sending and preview

- Preview email (no send):
```powershell
curl -Method POST -Uri http://localhost:8094/api/notifications/preview -ContentType 'application/json' -Body (@{
  to = 'test@example.com'
  templateCode = 'RESET_PASSWORD'
  variables = @{ fullname='Alice'; link='http://localhost:4200/reset?token=abc' ; token='abc' }
} | ConvertTo-Json)
```

- Send test email (captured by MailHog):
```powershell
curl -Method POST -Uri http://localhost:8094/api/notifications/email -ContentType 'application/json' -Body (@{
  to = 'recipient@example.com'
  templateCode = 'RESET_PASSWORD'
  variables = @{ fullname='Alice'; link='http://localhost:4200/reset?token=abc' ; token='abc' }
} | ConvertTo-Json)
```

Then open http://localhost:8025 to inspect the email.

Notes
- If you run Spring Boot from your IDE, make sure to activate the `dev` profile (`-Dspring.profiles.active=dev`) or set the run configuration accordingly.
- `application-dev.yml` turns off `dry-run` so mails are sent to the configured SMTP sink (MailHog/Mailtrap).
