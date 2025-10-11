Frontend Angular app (minimal)

How to run:

1. Open a terminal in `suividoctorat/frontend`.
2. Install dependencies:

```powershell
npm install
```

3. Start the dev server (uses proxy to backend gateway at http://localhost:8080):

```powershell
npx ng serve --host 0.0.0.0 --port 4200 --proxy-config proxy.conf.json
```

4. Open http://localhost:4200

Notes:
- The login button is a demo placeholder — we'll wire it to `/api/auth/login` once JWT is implemented.
- The doctorants page calls `/api/doctorants` via the proxy to `http://localhost:8080/api/doctorants` (gateway).
 - The login page will POST to `/api/auth/login` and store the returned `token` (JWT) in localStorage.
 - The dev server proxies `/api` to `http://localhost:8080` so the frontend can call the gateway without CORS.
