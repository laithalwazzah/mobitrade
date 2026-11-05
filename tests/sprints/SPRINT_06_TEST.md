# Sprint 06 — Merchant Backend and Frontend Migration QA

Status: **CLOSED — OWNER APPROVED**

Owner approval date: **2026-11-05**. Final owner QA: **10 PASS / 0 FAIL / 0 BLOCKED**.

This is the authoritative owner checklist. Use only dummy emulator identities and dummy image bytes. Never use a real commercial record or a live Firebase project.

## Prerequisites

- Node.js 20, Java 21+, Firebase CLI, and Chromium already installed.
- Ports `4000`, `4100`, `4400`, `4500`, `8080`, `9099`, and `9150` are free.
- From the repository root, run:

```powershell
npm run qa:sprint06
```

The command builds both applications, starts Auth and Firestore emulators for `demo-sa3erli-sprint05`, seeds dummy accounts plus pending/approved/rejected records, serves the static frontend on `http://127.0.0.1:4000`, starts the API on `http://127.0.0.1:4100`, and stops every child process when Enter is pressed.

All dummy accounts use the emulator-only password `Sprint05-Dummy-Only!`:

- `verified-owner@example.test` — verified owner with no application.
- `second-owner@example.test` — second verified owner with no application.
- `pending-owner@example.test` — pending fixture.
- `approved-owner@example.test` — approved fixture.
- `rejected-owner@example.test` — rejected fixture.
- `admin-reviewer@example.test` — verified `admin: true` fixture.
- `unverified-owner@example.test` — unverified fixture.

## Owner-facing cases

Record each as PASS, FAIL, or BLOCKED and add concise evidence.

1. **Authentication and verification gate** — Sign out, open `/add`, then test the unverified and verified accounts. Expected: signed out redirects to login, unverified redirects to verification, verified reaches the merchant workflow. Result: **PASS**. Evidence: owner completed all three gates using dummy emulator accounts.
2. **Create through API only** — With `verified-owner`, submit normalized shop data and a dummy PNG/JPEG/WebP. Expected: one pending application, no publishing form, and the browser sends one multipart request to `/api/v1/merchant-applications`. Result: **PASS**. Evidence: owner confirmed API-only submission and absence of publishing UI.
3. **Validation and file signatures** — Try blank fields, invalid Syrian WhatsApp, PDF/renamed text, zero bytes, 700 KiB, and 700 KiB + 1. Expected: safe Arabic errors; only real JPEG/PNG/WebP signatures from 1 byte through exactly 700 KiB pass. Result: **PASS**. Evidence: owner retest confirmed exactly 700 KiB returns HTTP 201; 700 KiB + 1 returns HTTP 413 with code `merchant/document-too-large`, the Arabic message `حجم صورة السجل التجاري يجب ألا يتجاوز 700 كيلوبايت.`, and a correlation ID.
4. **Duplicate and atomicity** — Resubmit the owner application, then run `npm run qa:sprint06:verify-atomicity` in a second PowerShell while QA is active. Expected: duplicate conflict and JSON containing `"atomic":true` with equal application/document counts. The verifier uses Admin SDK read operations against the loopback demo emulator only; direct client reads remain denied. Result: **PASS**. Evidence: owner retest returned `atomic: true`, `applicationCount: 4`, and `documentCount: 4`; duplicate rejection also remained PASS.
5. **Owner status restoration** — Sign in as pending, approved, and rejected fixtures and reload `/add`. Expected: correct persisted state and rejection reason; document bytes never appear in page/API JSON. Result: **PASS**. Evidence: owner confirmed all three fixture states and reload behavior.
6. **Admin authorization contracts** — Call OpenAPI endpoints using owner and admin emulator tokens. Expected: only admin can list/detail/download/decide; document response is private attachment with `Cache-Control: private, no-store`. Result: **PASS**. Evidence: owner confirmed owner denial, admin access, and private document response.
7. **Pagination and filters** — Use admin list with status and limit/page token. Expected: stable descending pages, valid next token, invalid filters/tokens rejected safely. Result: **PASS**. Evidence: owner confirmed functional filter/pagination behavior and safe invalid-filter rejection. OpenAPI retest documented exactly `status`, `limit`, and `pageToken`; `limit` defaults to 20 with range 1–50, while `page` and `pageSize` are absent.
8. **Decision concurrency and audit** — Decide a pending fixture with wrong then correct version; test rejection without and with reason. Expected: 409 on stale version, pending-only decision, required rejection reason, one audit record, no second decision. Result: **PASS**. Evidence: owner confirmed stale-version conflict, valid decision, and pending-only behavior.
9. **Direct-client denial and public regression** — From browser/client SDK try merchant application/document/audit reads and writes, then browse catalog/product/shop. Expected: merchant business data denied directly; catalog/live-offer public reads remain available. Result: **PASS**. Evidence: owner confirmed direct denial and unaffected public catalog browsing.
10. **Responsive, accessible recovery** — At 375×812 and 1280×800 test keyboard flow, focus, RTL, API unavailable/retry, reload, and overflow. Expected: no focus trap/overflow; safe status/error states; retry preserves the workflow. Result: **PASS**. Evidence: owner confirmed both viewports, keyboard/focus flow, RTL, recovery, and no overflow.

## Completed repair retests

1. Document-size boundary and localized HTTP 413 contract: **PASS**.
2. Read-only Admin SDK atomicity verification with equal 4/4 counts: **PASS**.
3. OpenAPI admin-list parameters, limits, default, and unsupported-parameter absence: **PASS**.

## Automated evidence completed by the agent

- Frontend unit: **46/46 PASS**.
- Backend unit/integration: **30/30 PASS**.
- Firestore client rules: **4/4 PASS**.
- Backend Auth/Firestore Emulator E2E: **4/4 PASS**.
- Integrated frontend/backend/emulator browser E2E: **2/2 PASS** (mobile and desktop).
- Read-only Admin SDK atomicity verifier: **PASS**, `atomic:true` with equal counts 3/3 in the seeded integrated run.
- Non-live browser regressions: **88/88 PASS**.
- Static export without `.env.local`: **PASS**, all 12 public routes generated.

Final owner total: **10 PASS / 0 FAIL / 0 BLOCKED**. The QA command stopped cleanly, all emulators stopped, the required ports were free, and no live Firebase project was used. Sprint 06 is **CLOSED — OWNER APPROVED**.
