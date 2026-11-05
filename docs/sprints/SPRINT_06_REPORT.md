# Sprint 06 — Merchant Backend and Frontend Migration Report

Status: **CLOSED — OWNER APPROVED**

Owner approval date: **2026-11-05**. Final owner manual QA: **10 PASS / 0 FAIL / 0 BLOCKED**.

## Requirement coverage

- Added all six versioned merchant/admin API routes under `/api/v1` with Firebase bearer authentication, verified-email and admin guards.
- Added strict shop normalization and Syrian WhatsApp normalization.
- Added multipart in-memory upload validation using actual JPEG/PNG/WebP signatures and the inclusive 1–700 KiB boundary.
- Added an Admin SDK repository that keeps application metadata and document bytes separate, creates both atomically, rejects duplicates/partial records, paginates admin lists, and never places bytes in list/detail JSON.
- Added pending-only atomic approve/reject decisions, mandatory rejection reason, optimistic version checks, and `merchantApplicationAudits` records.
- Added endpoint-specific throttles, strict DTO validation, request limits, safe Arabic error envelopes, private no-store document delivery, and expanded PII/document log redaction.
- Migrated the Sprint 04 frontend adapter to Firebase ID-token authenticated API calls and multipart submission. Missing/unsafe API configuration produces the existing unavailable/retry states.
- Locked direct client access to `merchantApplications`, `merchantDocuments`, and `merchantApplicationAudits`; preserved public `liveOffers` reads and approved-merchant checks used by existing publishing rules.
- No admin dashboard was added; it remains Sprint 07.

## Owner QA findings, repairs, and final retest

- **FAIL — multipart oversize localization:** a 700 KiB + 1 upload returned HTTP 413 but exposed Multer's English `File too large`. The global API filter now maps that specific transformed Multer exception to HTTP 413, stable code `merchant/document-too-large`, a safe Arabic message, and the existing correlation ID. Exactly 700 KiB remains accepted.
- **BLOCKED — atomicity inspection:** the checklist required Emulator UI while `firebase.json` disabled it. Enabling UI was tested but Firebase CLI did not serve the configured UI inside this `emulators:exec` workflow, so the unsupported step was replaced with `npm run qa:sprint06:verify-atomicity`. The command is read-only, Admin SDK based, demo/loopback guarded, compares both collection ID sets, validates private `Bytes`, and prints counts without PII. Automated execution returned `{"atomic":true,"applicationCount":3,"documentCount":3}`.
- **OpenAPI omission:** the admin list now documents exactly optional `status`, optional integer `limit` (1–50, default 20), and optional `pageToken`. Unsupported `page`/`pageSize` are not documented.

Final retest evidence:

- Exactly 700 KiB returned HTTP 201; 700 KiB + 1 returned HTTP 413 with stable code `merchant/document-too-large`, the safe Arabic message, and a correlation ID.
- The read-only atomicity verifier returned `atomic: true`, `applicationCount: 4`, and `documentCount: 4`.
- OpenAPI documented only `status`, `limit`, and `pageToken`; `limit` defaulted to 20 with range 1–50, and neither `page` nor `pageSize` appeared.

All previously passed cases remained PASS: authentication/verification gates, API-only multipart creation, real file signatures, duplicate rejection, owner status restoration/JSON redaction, admin authorization/private downloads, pagination/invalid-filter handling, decision concurrency/rejection/audit behavior, direct-client denial/public regressions, and responsive/accessibility/failure recovery.

## API routes

- `POST /api/v1/merchant-applications`
- `GET /api/v1/merchant-applications/me`
- `GET /api/v1/admin/merchant-applications`
- `GET /api/v1/admin/merchant-applications/:uid`
- `GET /api/v1/admin/merchant-applications/:uid/document`
- `PATCH /api/v1/admin/merchant-applications/:uid/decision`

## Changed areas

- Backend Firebase Admin/Firestore service, merchant domain/repository/service/controllers/DTOs, configuration, OpenAPI, redaction, emulator fixtures, scripts, and tests.
- Frontend merchant API adapter, safe API-base resolver, merchant response parser, environment example, and non-live browser contracts.
- Firestore rules and indexes.
- Sprint 06 unit, rules, emulator, integrated browser, manual checklist, setup, report, and roadmap.

## Exact automated results

| Check | Result |
|---|---|
| `npm run lint` | PASS |
| `npm test` | PASS — 46/46 |
| `npm --prefix backend test` | PASS — 30/30 |
| `npm run test:rules` | PASS — 4/4 |
| `npm run backend:test:emulator` | PASS — 4/4 |
| `npm run test:sprint06:integrated` | PASS — 2/2, mobile and desktop |
| `npm run build` with `.env.local` | PASS — static export generated 12 routes |
| `npm run build` without `.env.local` | PASS — static export generated 12 routes |
| `npm run test:e2e` | PASS — 88/88 non-live regressions |
| `npm run qa:sprint06:verify-atomicity` inside integrated QA | PASS — `atomic:true`, counts 3/3 |

The first regression attempt was discarded because `out/` still contained the intentionally emulator-configured integration build. The app was rebuilt without `.env.local`, then the complete safe regression set passed 88/88. Legacy `form.spec.ts`, `failure.spec.ts`, and `live.spec.ts` are excluded from the default non-live suite because they target the pre-auth price form or real Firestore writes; Sprint 03/04 removed that form from `/add`.

## Safety evidence

- Emulator mode requires an explicit flag, a `demo-*` project, and loopback Auth and Firestore hosts.
- Rules tests prove direct owner/admin/anonymous client access to merchant records and audits is denied.
- Backend emulator E2E proves Admin SDK API access succeeds while the same user/admin client tokens receive 403 directly.
- Integrated browser tests use only dummy `.example.test` accounts and synthetic PNG bytes.
- No live Firebase project request, real document, deployment, commit, or push occurred. Firebase CLI's public update check was observed once during verification; the Sprint 06 runners now disable that check.
- Backend-only packages added: runtime `class-transformer` and `class-validator`, plus development type package `@types/multer`.

## NOT RUN / limitations

- Production ADC, deployed API CORS, deployed index readiness, and real-network behavior: NOT RUN; deployment-dependent.
- Admin dashboard: intentionally not implemented until Sprint 07.
- Commercial records remain temporary Firestore `Bytes`; migration to secure object storage remains a production TODO.

## Risks and remaining work

- The API timeout is 10 seconds in the frontend; a future production observability pass should tune it from real latency data.
- Firestore composite index deployment must complete before filtered admin lists are used in production.
- Sprint 07 must consume the admin endpoints without restoring any direct Firestore business-data access.

No Sprint 06 implementation or QA blocker remains. The local QA stack stopped cleanly, ports `4000`, `4100`, `4400`, `4500`, `8080`, and `9099` were free, and no live Firebase project was used. Sprint 06 is **CLOSED — OWNER APPROVED**.
