# Backend roadmap

- **Sprint 05 — Trusted backend foundation:** versioned NestJS API, Firebase Admin token verification, security middleware, health/readiness, OpenAPI, emulator fixtures, and local orchestration.
- **Sprint 06 — Merchant application/admin APIs and frontend migration (CLOSED — OWNER APPROVED 2026-11-05):** trusted multipart owner submission/status APIs, protected paginated admin review/document/decision APIs, atomic audit/version contracts, client-rule denial, and frontend migration. Final owner QA: 10 PASS / 0 FAIL / 0 BLOCKED. No dashboard UI is included.
- **Sprint 07 — Admin dashboard:** build the protected review dashboard on top of the Sprint 06 contracts, including the deferred custom live-product UI verification.

Public catalog browsing and the static Next.js export remain unchanged. Sprint 07 must use the Sprint 06 API contracts and must not restore direct client access to merchant business data.
