# Sprint 05 — Authoritative manual QA checklist

Sprint status: **READY FOR OWNER REVIEW**

Use PowerShell from the repository root. Do not use a live Firebase project or real accounts. Prepare once with `npm run qa:sprint05`; keep that session open while running cases 1–9 from a second PowerShell window, then press Enter in the first window for case 10.

## 1. Local isolation and startup

**Steps**

1. Run `npm run qa:sprint05`.
2. Confirm the output identifies `demo-sa3erli-sprint05` and local URLs only.
3. Confirm no service-account file is requested.

**Expected:** loopback frontend, API, and Auth/Firestore emulators start; fixtures contain only dummy accounts; no live Firebase endpoint or Hosting Emulator is used.

**Result:** **PASS** — the session used the reserved local demo project, loopback services, and dummy accounts only; no service-account file or live Firebase project was used.

## 2. Liveness, readiness, and versioning

**Steps**

```powershell
Invoke-RestMethod http://127.0.0.1:4100/api/v1/health/live
Invoke-RestMethod http://127.0.0.1:4100/api/v1/health/ready
```

**Expected:** `status` is `ok` then `ready`; readiness reports `firebaseAuth: emulator`; every endpoint is under `/api/v1`.

**Result:** **PASS** — liveness returned `ok`, readiness returned `ready` with Auth Emulator, and the checked endpoints stayed under `/api/v1`.

## 3. OpenAPI and security headers

**Steps**

```powershell
$docs = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:4100/api/v1/docs
$live = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:4100/api/v1/health/live
$docs.StatusCode
$live.Headers['X-Content-Type-Options']
$live.Headers['X-Frame-Options']
```

**Expected:** docs return 200; headers are `nosniff` and `SAMEORIGIN`; OpenAPI lists health and `/auth/me` only, with no merchant API.

**Result:** **PASS** — OpenAPI loaded successfully and the expected Helmet security headers were present.

## 4. Missing and invalid bearer tokens

**Steps**

```powershell
try { Invoke-RestMethod http://127.0.0.1:4100/api/v1/auth/me } catch { $_.ErrorDetails.Message }
try { Invoke-RestMethod http://127.0.0.1:4100/api/v1/auth/me -Headers @{ Authorization = 'Bearer invalid' } } catch { $_.ErrorDetails.Message }
```

**Expected:** both return 401 error envelopes with safe Arabic messages, a correlation id, and `auth/missing-token` or `auth/invalid-token`. No raw Firebase error appears.

**Result:** **PASS** — missing and invalid bearer tokens returned safe 401 envelopes without raw Firebase details.

## 5. Valid emulator identities and safe `/auth/me`

**Steps:** sign into the Auth Emulator with each dummy account documented by the startup fixtures, keep the returned token only in a PowerShell variable, then call `/api/v1/auth/me` with `Authorization: Bearer $token`.

**Expected:** unverified, verified owner, and admin tokens are accepted. The response contains only `uid`, dummy `email`, `emailVerified`, `providerIds`, and `claims.admin`; it contains no token or unrestricted claims.

**Result:** **PASS** — unverified, verified-owner, and admin identities returned the expected safe `/auth/me` fields without token leakage.

## 6. Verified-email and admin authorization foundations

**Steps:** run `npm run backend:test` and inspect the guard cases.

**Expected:** unverified identity is rejected by `VerifiedEmailGuard`; normal verified user is accepted there but rejected by `AdminGuard`; only `admin: true` passes the admin guard. Sprint 05 exposes no merchant/admin business routes.

**Result:** **PASS** — verified-email and admin guards enforced the intended identity boundaries without exposing a Sprint 05 business route.

## 7. CORS, rate limiting, and body limit

**Steps:** run `npm run backend:test` and confirm the integration cases for allowed/disallowed origins, 429 rate limiting, and 413 oversized bodies.

**Expected:** only exact configured origins receive CORS headers; rate and body limits return consistent error envelopes.

**Result:** **PASS** — exact-origin CORS, rate limiting, and request-body limits behaved as documented.

## 8. Correlation IDs, errors, and redaction

**Steps:** send a request with `X-Correlation-Id: owner-check-1`, then run `npm run backend:test`.

**Expected:** the same safe id is returned in the response header; malformed ids are replaced; logs never contain authorization tokens, passwords, email, phone, or WhatsApp values; errors share the documented envelope.

**Result:** **PASS** — correlation IDs were preserved or safely replaced, error envelopes were consistent, and token/PII redaction was confirmed.

## 9. Frontend preservation

**Steps:** open `http://localhost:4000` and check home, login, account, add, compare, one product, and one shop on desktop and mobile.

**Expected:** existing static UI and behavior are unchanged; no browser request depends on the Nest API yet.

**Result:** **PASS** — the frontend and local login remained functional on desktop and mobile with no Sprint 05 user-facing regression.

## 10. Clean shutdown

**Steps:** press Enter in the `qa:sprint05` window, then run:

```powershell
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object LocalPort -In 4000,4100,4400,4500,8080,9099
```

**Expected:** no listed Sprint 05 port remains listening and temporary logs are removed.

**Result:** **PASS** — the local session shut down cleanly and all required ports were free afterward.

## Owner manual QA result

- Total: **10/10 PASS**.
- Failed: **0**.
- Blocked: **0**.
- Sprint disposition: **READY FOR OWNER REVIEW**. This records completed manual QA but does not close Sprint 05.

## Automated evidence before manual QA

- Backend TypeScript/lint: PASS.
- Backend unit + mocked integration: PASS — 21/21.
- Auth Emulator E2E: PASS — 3/3, project `demo-sa3erli-sprint05`; emulator stopped afterward.
- Backend dependency audit: PASS — 0 known vulnerabilities after compatible security overrides.
- Frontend lint: PASS; unit: PASS — 41/41.
- Frontend static build: PASS with and without `.env.local`; 12 routes and 14 generated pages in both runs.
- Current non-live frontend E2E: PASS — 88/88 on mobile and desktop.
- Unified local runner smoke: PASS after building both apps, starting loopback frontend/API and Auth/Firestore Emulators, seeding dummy fixtures, checking readiness, and shutting down cleanly.
