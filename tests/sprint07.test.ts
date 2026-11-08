import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { AdminApiError, parseAdminDetail, parseAdminIdentity, parseAdminList, parseAdminSummary } from "../lib/adminApi";

const item = {
  ownerId: "test-owner",
  shop: { name: "TEST Shop", area: "TEST Area" },
  status: "pending",
  submittedAt: "2026-11-07T00:00:00.000Z",
  version: 1,
};

test("Sprint 07 defensive parsers accept only the approved minimized contracts", () => {
  assert.deepEqual(parseAdminList({ items: [item], nextPageToken: null }).items[0], item);
  assert.throws(() => parseAdminList({ items: [{ ...item, shop: { ...item.shop, address: "private" } }], nextPageToken: null }), AdminApiError);
  assert.throws(() => parseAdminList({ items: [{ ...item, bytes: "secret" }], nextPageToken: null }), AdminApiError);
  assert.throws(() => parseAdminDetail({ application: { ...item, shop: { ...item.shop, address: "A", whatsapp: "963911111111" }, bytes: "secret" } }), AdminApiError);
});

test("Sprint 07 summary parser enforces non-negative integer invariants", () => {
  const valid = { summary: { total: 7, pending: 3, approved: 2, rejected: 2, version: 4, updatedAt: "2026-11-07T00:00:00.000Z" } };
  assert.equal(parseAdminSummary(valid).total, 7);
  assert.throws(() => parseAdminSummary({ summary: { ...valid.summary, total: 8 } }), AdminApiError);
  assert.throws(() => parseAdminSummary({ summary: { ...valid.summary, pending: -1 } }), AdminApiError);
  assert.throws(() => parseAdminSummary({ summary: { ...valid.summary, total: 7.5 } }), AdminApiError);
});

test("Sprint 07 identity parser trusts only the safe auth/me shape", () => {
  const identity = parseAdminIdentity({ user: { uid: "admin", email: "admin@example.test", emailVerified: true, providerIds: ["password"] }, claims: { admin: true } });
  assert.equal(identity.admin, true);
  assert.throws(() => parseAdminIdentity({ user: { uid: "admin", email: "admin@example.test", emailVerified: true, providerIds: [], token: "forbidden" }, claims: { admin: true } }), AdminApiError);
});

test("Sprint 07 approval payload omits rejection reason in the production adapter", () => {
  const source = readFileSync("lib/adminApi.ts", "utf8");
  assert.match(source, /input\.decision === "rejected"[\s\S]*?reason: input\.reason[\s\S]*?: \{ decision: input\.decision, expectedVersion: input\.expectedVersion \}/);
  assert.match(source, /cache: "no-store"/);
});

test("Sprint 07 document viewer is explicit, memory-only, and cleans every approved lifecycle", () => {
  const source = readFileSync("components/admin/AdminApplicationPage.tsx", "utf8");
  assert.match(source, /onClick=\{show\}/);
  assert.match(source, /URL\.createObjectURL/);
  assert.match(source, /URL\.revokeObjectURL/);
  assert.match(source, /useEffect\(\(\) => clear/);
  assert.match(source, /\[clear, ownerId\]/);
  assert.match(source, /value\.status === 401 \|\| value\.status === 403/);
  for (const forbidden of ["localStorage", "indexedDB", "caches.open", "prefetchDocument"]) assert.equal(source.includes(forbidden), false);
});

test("Sprint 07 static routes use a Suspense boundary for query id", () => {
  assert.equal(readFileSync("app/admin/page.tsx", "utf8").includes("AdminDashboard"), true);
  const detail = readFileSync("app/admin/application/page.tsx", "utf8");
  assert.equal(detail.includes("Suspense"), true);
  assert.equal(readFileSync("components/admin/AdminApplicationPage.tsx", "utf8").includes("useSearchParams"), true);
});

test("Sprint 07 test adapter is explicit-build and loopback-only with no URL switch", () => {
  const source = readFileSync("lib/adminApi.ts", "utf8");
  assert.match(source, /NEXT_PUBLIC_ADMIN_TEST_MODE === "1"/);
  assert.match(source, /testMode && isLoopback\(\) && window\.__SA3ERLI_ADMIN_TEST__/);
  assert.equal(source.includes("URLSearchParams(window.location"), false);
  assert.equal(source.includes("firestore.googleapis.com"), false);
});

test("Sprint 07 client rules deny direct access to aggregate and all merchant business data", () => {
  const rules = readFileSync("firestore.rules", "utf8");
  for (const path of ["merchantApplications/{uid}", "merchantDocuments/{uid}", "merchantApplicationAudits/{id}", "merchantApplicationSummaries/{id}"]) {
    assert.match(rules.slice(rules.indexOf(`match /${path}`), rules.indexOf(`match /${path}`) + 140), /allow read, write: if false/);
  }
});

test("Sprint 07 verifier is read-only by default and repair is guarded for demo loopback only", () => {
  const verifier = readFileSync("backend/scripts/verify-sprint07-summary.ts", "utf8");
  assert.match(verifier, /requireSafeEmulatorEnvironment\(\)/);
  assert.match(verifier, /process\.argv\.includes\("--repair"\)/);
  assert.match(verifier, /if \(repair && !consistent\)[\s\S]*?requireSafeEmulatorEnvironment\(\)[\s\S]*?reference\.set/);
  assert.equal(verifier.includes("applicationDefault"), false);
  const runner = readFileSync("backend/scripts/run-sprint07.ps1", "utf8");
  assert.match(runner, /demo-sa3erli-sprint05/);
  assert.match(runner, /127\.0\.0\.1:9099/);
  assert.match(runner, /127\.0\.0\.1:8080/);
});

test("Sprint 07 deterministic seed declares exactly 3 pending, 2 approved, and 2 rejected fixtures", () => {
  const seed = readFileSync("backend/scripts/seed-sprint07-emulator.ts", "utf8");
  assert.match(seed, /pending: 3/);
  assert.match(seed, /approved: 2/);
  assert.match(seed, /rejected: 2/);
  assert.match(seed, /"jpeg"/);
  assert.match(seed, /"png"/);
  assert.match(seed, /"webp"/);
});

test("Sprint 07 admin pagination exposes the deterministic five-item page size", () => {
  const dashboard = readFileSync("components/admin/AdminDashboard.tsx", "utf8");
  assert.match(dashboard, /<option value=\{5\}>5<\/option>/);
  assert.match(dashboard, /setPageToken\(undefined\); setHistory\(\[\]\)/);
  assert.equal(dashboard.includes("pageSize"), false);
});

test("Sprint 07 WebP seed contains a complete deterministic RIFF payload", () => {
  const seed = readFileSync("backend/scripts/seed-sprint07-emulator.ts", "utf8");
  const encoded = seed.match(/SPRINT07_WEBP_BASE64 = "([A-Za-z0-9+/=]+)"/)?.[1];
  assert.ok(encoded, "valid WebP fixture constant is missing");
  const bytes = Buffer.from(encoded, "base64");
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP");
  assert.equal(bytes.readUInt32LE(4), bytes.length - 8);
  assert.ok(bytes.length > 12);
});
