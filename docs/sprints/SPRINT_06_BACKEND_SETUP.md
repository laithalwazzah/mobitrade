# Sprint 06 — Backend and emulator setup

## Local QA

From PowerShell at the repository root:

```powershell
npm run qa:sprint06
```

This command is deliberately local-only. It uses project id `demo-sa3erli-sprint05`, loopback Auth/Firestore emulators, a loopback API, dummy accounts, and synthetic image signatures. It builds the static frontend and NestJS backend, starts all processes, and shuts them down after Enter.

Useful local endpoints:

- Frontend: `http://127.0.0.1:4000`
- API root: `http://127.0.0.1:4100/api/v1`
- Readiness: `http://127.0.0.1:4100/api/v1/health/ready`
- OpenAPI: `http://127.0.0.1:4100/api/v1/docs`
- OpenAPI JSON: `http://127.0.0.1:4100/api/v1/docs-json`

For a read-only atomicity check while `qa:sprint06` is running, open a second PowerShell at the repository root and run:

```powershell
npm run qa:sprint06:verify-atomicity
```

The verifier is pinned to project `demo-sa3erli-sprint05` and loopback Auth/Firestore emulator hosts. It only reads the two collections through Admin SDK, checks that their document-ID sets match and that every private document contains `Bytes`, then prints counts without PII. It performs no create/update/delete. Direct browser/client SDK access remains denied by rules.

## Backend environment names

- `NODE_ENV`
- `PORT`
- `FIREBASE_PROJECT_ID`
- `BACKEND_EMULATOR_MODE`
- `FIREBASE_AUTH_EMULATOR_HOST`
- `FIRESTORE_EMULATOR_HOST`
- `CORS_ALLOWLIST`
- `REQUEST_BODY_LIMIT`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`

Production must use Application Default Credentials supplied by the hosting environment. Never use `NEXT_PUBLIC_FIREBASE_*` values as Admin credentials and never commit a service-account JSON file.

## Frontend environment name

- `NEXT_PUBLIC_API_BASE_URL` — an HTTPS origin in production, or loopback HTTP for local QA. Paths, credentials, query strings, fragments, and non-loopback plain HTTP are rejected.

The frontend obtains the current Firebase ID token and sends it as `Authorization: Bearer …`. Merchant metadata and the commercial-record file are sent as multipart form data. The frontend no longer reads or writes `merchantApplications`, `merchantDocuments`, or `merchantApplicationAudits` directly.

## Firebase Console prerequisites before a future deployment

1. Deploy the reviewed `firestore.rules`: direct client access to the three merchant business-data collections is denied; `liveOffers` public reads and approved-merchant publishing checks remain intact.
2. Deploy `firestore.indexes.json`: it retains the bytes index exemption and adds the status/submittedAt/admin-list composite index.
3. Configure backend ADC and exact production `CORS_ALLOWLIST`.
4. Configure the static frontend with the deployed HTTPS API origin.
5. Verify Auth provider configuration from Sprint 03.

Do not deploy from the QA scripts. Sprint 06 has no admin dashboard; admin endpoints are exercised through OpenAPI/tests until Sprint 07.

## API behavior

- Owner endpoints require a valid Firebase ID token and verified email.
- Admin endpoints additionally require the trusted custom claim `admin: true`.
- Commercial records accept only genuine JPEG/PNG/WebP signatures, 1–700 KiB inclusive.
- Multipart files over 700 KiB return HTTP 413 with stable code `merchant/document-too-large`, a safe Arabic message, and the request correlation ID.
- Metadata and `Bytes` live in separate Firestore documents and are created atomically.
- Decisions are pending-only, version-checked, atomic, and accompanied by an audit document.
- Document downloads are admin-only attachments with no-store headers.
- Admin list query parameters are exactly `status` (optional enum), `limit` (optional integer 1–50, default 20), and `pageToken` (optional opaque continuation token). `page` and `pageSize` are unsupported.
