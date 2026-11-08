import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveBackendApiBase } from "../lib/backendApi";

test("backend API base accepts HTTPS and loopback HTTP but rejects unsafe URLs", () => {
  assert.equal(resolveBackendApiBase("https://api.example.test"), "https://api.example.test/api/v1");
  assert.equal(resolveBackendApiBase("http://127.0.0.1:4100"), "http://127.0.0.1:4100/api/v1");
  assert.equal(resolveBackendApiBase("http://localhost:4100"), "http://localhost:4100/api/v1");
  assert.equal(resolveBackendApiBase("http://api.example.test"), null);
  assert.equal(resolveBackendApiBase("https://user:secret@api.example.test"), null);
  assert.equal(resolveBackendApiBase("https://api.example.test/path"), null);
  assert.equal(resolveBackendApiBase("javascript:alert(1)"), null);
});

test("frontend merchant workflow uses ID-token multipart API and never direct business-data Firestore", () => {
  const source = readFileSync("lib/firebaseMerchantAdapter.ts", "utf8");
  assert.ok(source.includes("getIdToken()"));
  assert.ok(source.includes("new FormData()"));
  assert.ok(source.includes('request("/merchant-applications"'));
  assert.ok(source.includes('request("/merchant-applications/me")'));
  assert.equal(source.includes("firebase/firestore"), false);
  assert.equal(source.includes("merchantDocuments"), false);
});

test("client rules deny direct merchant records and audits without widening public catalog reads", () => {
  const rules = readFileSync("firestore.rules", "utf8");
  for (const path of ["merchantApplications/{uid}", "merchantDocuments/{uid}", "merchantApplicationAudits/{id}", "merchantApplicationSummaries/{id}"]) {
    const start = rules.indexOf(`match /${path}`);
    assert.ok(start >= 0);
    assert.match(rules.slice(start, start + 130), /allow read, write: if false/);
  }
  assert.match(rules, /match \/liveOffers\/\{id\}[\s\S]*?allow read: if true/);
  assert.match(rules, /match \/submissions\/\{id\}[\s\S]*?allow create: if isApprovedMerchant\(\)/);
});

test("backend configuration cannot silently route emulator tests to live Firebase", () => {
  const config = readFileSync("backend/src/config/backend-config.ts", "utf8");
  assert.ok(config.includes('firebaseProjectId.startsWith("demo-")'));
  assert.ok(config.includes("loopback FIRESTORE_EMULATOR_HOST"));
  assert.ok(config.includes("Firebase emulator hosts are forbidden"));
});

test("Sprint 06 manual QA has a local read-only atomicity verifier without enabling client access", () => {
  const firebaseConfig = JSON.parse(readFileSync("firebase.json", "utf8")) as {
    emulators?: { ui?: { enabled?: boolean; port?: number } };
  };
  assert.equal(firebaseConfig.emulators?.ui?.enabled, false);
  const session = readFileSync("backend/scripts/sprint06-session.ps1", "utf8");
  assert.ok(session.includes("qa:sprint06:verify-atomicity"));
  const verifier = readFileSync("backend/scripts/verify-sprint06-atomicity.ts", "utf8");
  assert.ok(verifier.includes("requireSafeEmulatorEnvironment"));
  assert.equal(verifier.includes(".set("), false);
  assert.equal(verifier.includes(".create("), false);
  assert.equal(verifier.includes(".delete("), false);
  const rules = readFileSync("firestore.rules", "utf8");
  assert.match(rules, /match \/merchantApplications\/\{uid\}[\s\S]*?allow read, write: if false/);
  assert.match(rules, /match \/merchantDocuments\/\{uid\}[\s\S]*?allow read, write: if false/);
});
