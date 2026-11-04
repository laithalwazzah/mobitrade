# Sprint 05 — Backend setup

The NestJS application is isolated under `backend/`. The existing Next.js application remains a static export and has no server routes.

## Prerequisites

- Node.js 20
- Java 21 and the already-installed global Firebase CLI (`firebase.cmd`) for local emulators; the scripts never download it
- Dependencies installed once in both roots: `npm install` and `npm --prefix backend install`

## One-command local environment

From the repository root in PowerShell:

```powershell
npm run qa:sprint05
```

This command builds the static frontend and backend, starts Auth/Firestore emulators for the reserved project `demo-sa3erli-sprint05`, serves `out/` with a loopback-only Node static server, seeds dummy Auth accounts including an `admin: true` fixture, starts the API on port 4100, and waits for Enter. Press Enter once to stop both servers and all emulators cleanly. Firebase Hosting Emulator is intentionally not used, so the CLI does not perform its remote hosting-project metadata check.

- Frontend: `http://localhost:4000`
- API live: `http://127.0.0.1:4100/api/v1/health/live`
- API ready: `http://127.0.0.1:4100/api/v1/health/ready`
- OpenAPI UI: `http://127.0.0.1:4100/api/v1/docs`
- OpenAPI JSON: `http://127.0.0.1:4100/api/v1/docs-json`

The fixtures use only `example.test` addresses and the dummy password `Sprint05-Dummy-Only!`. They exist only inside the Auth Emulator and are reset each time. The seeder refuses non-loopback hosts and any project id not exactly `demo-sa3erli-sprint05`.

## Backend environment contract

Copy `backend/.env.example` only for a backend process. Never copy browser `NEXT_PUBLIC_FIREBASE_*` values into server credentials.

| Name | Purpose |
|---|---|
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | API port; defaults to 4100 |
| `FIREBASE_PROJECT_ID` | Firebase project identity, not a secret |
| `BACKEND_EMULATOR_MODE` | Explicitly `1` only for local emulator mode |
| `FIREBASE_AUTH_EMULATOR_HOST` | Loopback `host:port`; accepted only in emulator mode |
| `CORS_ALLOWLIST` | Comma-separated exact origins; no wildcard or path |
| `REQUEST_BODY_LIMIT` | Express JSON/form limit; defaults to `64kb` |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window |
| `RATE_LIMIT_MAX` | Maximum requests per window |

Production will use Application Default Credentials (ADC) supplied by the hosting environment. Do not download or commit a service-account JSON file. `.gitignore` excludes environment files, PEM files, backend build output, logs, and test artifacts.

## Commands

```powershell
npm run backend:lint
npm run backend:test
npm run backend:build
npm run backend:test:emulator
```

The first three use mocks or compile only. `backend:test:emulator` starts Auth Emulator through Firebase CLI with the `demo-*` project, performs real emulator-token E2E, and shuts it down automatically. It cannot use a live project because configuration and seed guards reject it.

## Identity contract

Send a Firebase ID token as `Authorization: Bearer <token>`. `/api/v1/auth/me` returns only UID, email, verification state, provider ids, and the boolean admin claim. It never returns the token, refresh token, full decoded claims, or Firebase configuration.

`FirebaseAuthGuard`, `VerifiedEmailGuard`, and `AdminGuard` are reusable foundations. No merchant or admin business endpoint is exposed in Sprint 05.
