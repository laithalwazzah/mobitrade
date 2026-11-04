# Sprint 05 — Trusted Backend Foundation Report

Status: **READY FOR OWNER REVIEW**

## Requirement coverage

- Added an independent NestJS + strict TypeScript application under `backend/`; the Next.js frontend remains a static export with unchanged user-facing behavior.
- All routes are versioned below `/api/v1`. Liveness, readiness, OpenAPI UI/JSON, and authenticated `/auth/me` are implemented.
- Firebase Admin verifies bearer ID tokens. Emulator mode requires an explicit flag, the exact `demo-sa3erli-sprint05` project, and a loopback Auth Emulator. Production configuration uses ADC; client `NEXT_PUBLIC_FIREBASE_*` values are never read as server credentials.
- Reusable Firebase auth, verified-email, and `admin: true` guards exist. `/auth/me` returns only safe identity fields and the admin boolean.
- Exact CORS allowlist, Helmet headers, global rate limiting, 64 KiB default request limit, correlation IDs, structured JSON logs with token/PII redaction, consistent error envelopes, validated configuration, shutdown hooks, and startup failure handling are present.
- Local fixture tooling creates only dummy unverified/verified/admin accounts and can mutate claims only while guarded emulator mode is active. The unified runner uses a loopback Node server for `out/`, avoiding Firebase Hosting Emulator's remote project-metadata check.
- No merchant API, admin dashboard, live claim mutation, frontend migration, service-account JSON, deployment, or live Firebase call was added.

## Changed files

- `backend/package.json`, lockfile, TypeScript configuration, and `.env.example`.
- `backend/src/`: configuration, Firebase Admin adapter, auth/verified/admin guards, `/auth/me`, health probes, security middleware, logging/redaction, OpenAPI, and bootstrap.
- `backend/scripts/`: guarded Auth Emulator fixtures, emulator E2E runner, and full local frontend/backend/emulator runner.
- `backend/test/`: unit, integration, and real Auth Emulator E2E.
- Root `package.json`, `.gitignore`, `eslint.config.mjs`, and `tsconfig.json` for isolated commands/build output.
- `docs/sprints/ROADMAP.md`, this report, backend setup, and the authoritative Sprint 05 checklist.

## Test results

| Check | Result |
|---|---|
| `npm run backend:lint` | PASS |
| `npm run backend:test` | PASS — 21/21 |
| `npm run backend:build` | PASS |
| `npm run backend:test:emulator` | PASS — 3/3 against Auth Emulator only |
| `npm --prefix backend audit --omit=dev` | PASS — 0 known vulnerabilities |
| Root `npm run lint` | PASS |
| Root `npm test` | PASS — 41/41 |
| Root `npm run build` with `.env.local` | PASS — 12 static routes, 14 generated pages |
| Root `npm run build` without `.env.local` | PASS — 12 static routes, 14 generated pages; file restored without reading values |
| Existing current non-live frontend E2E | PASS — 88/88 on mobile and desktop |
| `npm run qa:sprint05` | PASS — frontend/API/Auth/Firestore started, fixtures seeded, endpoints checked, clean shutdown |
| Live Firebase | NOT RUN — prohibited and unnecessary |
| Owner manual checklist | PASS — 10/10, 0 FAIL, 0 BLOCKED |

## Owner manual QA evidence

- Local startup stayed isolated to the reserved demo project, loopback services, and dummy accounts only.
- Liveness and readiness passed; OpenAPI and the expected security headers were verified.
- Missing and invalid token handling returned safe envelopes.
- `/auth/me` passed for unverified, verified-owner, and admin identities and did not leak ID tokens or unrestricted claims.
- Verified-email/admin guards, exact-origin CORS, rate limiting, body limits, structured-log redaction, and correlation IDs passed.
- The existing frontend and local login remained functional on desktop and mobile.
- Shutdown completed cleanly and all required ports were confirmed free.
- Final manual total: **10/10 PASS, 0 FAIL, 0 BLOCKED**. Sprint 05 remains open pending explicit owner closure approval.

## Security evidence

- Configuration tests reject a real project id or remote host in emulator mode, and reject a hidden emulator host when emulator mode is off.
- Mocked tests never instantiate Firebase Admin; real token E2E runs inside `firebase emulators:exec` with a `demo-*` project. Firebase CLI confirms non-emulated services are blocked and shuts down the emulator.
- Missing, malformed, invalid, expired, revoked, unverified, normal, and admin identities are covered across unit/integration/E2E layers.
- Redaction, CORS, correlation ids, readiness failure, request size, throttling, security headers, and safe `/auth/me` response shape are asserted.

## Limitations and risks

- ADC production startup and a real production ID token are intentionally not tested in this sprint; production environment design is deployment-dependent.
- Readiness confirms validated Firebase Admin initialization, not a live external round trip, so probes do not create avoidable authentication traffic.
- Email verification and admin guards are foundations without business routes in Sprint 05; their real endpoint integration belongs to Sprint 06.
- Historical `form.spec.ts` and `failure.spec.ts` target the pre-Sprint-03 public price form and are not part of the current 88-test non-live regression set; `/add` must remain gated by Sprint 03/04. `live.spec.ts` remains prohibited because it writes to real Firestore.
- Manual QA is complete; explicit owner closure approval is still required before changing the sprint to CLOSED.

## Defects found and fixed

- The first unified-runner attempt set `NODE_ENV=development` before `next build`, which caused a non-standard environment warning and failed prerendering. The runner now builds the frontend with `NODE_ENV=production` and switches to development only for the local API process; the complete rerun passed.
- The first runner design included Firebase Hosting Emulator. Its CLI initialization attempted a read-only metadata request for the reserved demo project at a Google endpoint and received 403; no user project or data was accessed and no write occurred. Hosting Emulator was removed. The successful rerun serves `out/` through a loopback Node server and starts only Auth/Firestore Emulators, with no live Firebase endpoint request.
- Oversized JSON initially surfaced as HTTP 500 because the raw Express parser error reached the generic filter. It is now translated to a safe 413 `request/body-too-large` envelope, proven by integration tests.

## Roadmap

- Sprint 05: backend foundation.
- Sprint 06: merchant application/admin APIs and frontend migration.
- Sprint 07: admin dashboard.

Details are in `docs/sprints/ROADMAP.md`.
