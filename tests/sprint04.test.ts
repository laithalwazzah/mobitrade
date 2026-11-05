import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  COMMERCIAL_RECORD_MAX_BYTES,
  buildMerchantApplicationRecords,
  mapMerchantError,
  merchantDocumentPath,
  normalizeMerchantInput,
  parseMerchantApplication,
  safeMerchantFileName,
  SafeMerchantError,
  validateMerchantApplication,
} from "../lib/merchantApplication";
import {
  AUTH_EMULATOR_URL,
  FIREBASE_EMULATOR_PROJECT_ID,
  FIRESTORE_EMULATOR_HOST,
  isLoopbackHostname,
  resolveFirebaseRuntimeTarget,
} from "../lib/firebaseEmulatorMode";

const valid = { name: "TEST Shop", area: "TEST Area", address: "TEST Address", whatsapp: "0911111111" };
const image = { name: "record.png", type: "image/png", size: 1024 };

test("merchant validation accepts the exact 700 KiB boundary and normalizes WhatsApp", () => {
  assert.deepEqual(validateMerchantApplication(valid, { ...image, size: COMMERCIAL_RECORD_MAX_BYTES }), {});
  assert.equal(normalizeMerchantInput(valid)?.whatsapp, "963911111111");
});

test("merchant validation rejects missing fields, unsafe types, zero bytes, and one byte over the boundary", () => {
  assert.ok(validateMerchantApplication({ name: "", area: "", address: "", whatsapp: "bad" }, null).file);
  assert.ok(validateMerchantApplication(valid, { ...image, type: "application/pdf" }).file);
  assert.ok(validateMerchantApplication(valid, { ...image, size: 0 }).file);
  assert.ok(validateMerchantApplication(valid, { ...image, size: COMMERCIAL_RECORD_MAX_BYTES + 1 }).file);
});

test("document identity and canonical safe file names are deterministic", () => {
  assert.equal(merchantDocumentPath("owner-1"), "merchantDocuments/owner-1");
  assert.equal(safeMerchantFileName("image/jpeg"), "commercial-record.jpg");
  assert.equal(safeMerchantFileName("image/png"), "commercial-record.png");
  assert.equal(safeMerchantFileName("image/webp"), "commercial-record.webp");
});

test("application parsing excludes document bytes and parses status defensively", () => {
  const uid = "owner-1";
  const parsed = parseMerchantApplication({ ownerId: uid, shop: normalizeMerchantInput(valid), status: "pending", submittedAt: { toDate: () => new Date("2026-11-03T00:00:00Z") } }, uid);
  assert.equal(parsed?.status, "pending");
  assert.equal("bytes" in (parsed ?? {}), false);
  assert.equal(parseMerchantApplication({ ownerId: "other" }, uid), null);
});

test("duplicate and document errors map to safe Arabic messages", () => {
  assert.match(mapMerchantError(new SafeMerchantError("merchant/duplicate")), /طلب اعتماد سابق/);
  assert.match(mapMerchantError(new SafeMerchantError("merchant/document-failed")), /تعذر تجهيز صورة/);
  assert.doesNotMatch(mapMerchantError(new Error("SECRET")), /SECRET/);
});

test("merchant adapter sends multipart data to the trusted API without direct Firestore access", () => {
  const source = readFileSync("lib/firebaseMerchantAdapter.ts", "utf8");
  for (const required of ["FormData", 'body.set("document", file', 'request("/merchant-applications"', "user.getIdToken()", "Authorization"] as const) assert.ok(source.includes(required), required);
  assert.equal(/base64|btoa\(|readAsDataURL/i.test(source), false);
  assert.equal(source.includes("firebase/firestore"), false);
});

test("batch payload has exact safe keys, shared timestamp, and no undefined values", () => {
  const timestamp = { sentinel: "REQUEST_TIME" };
  const bytes = new Uint8Array([1, 2, 3]);
  const shop = normalizeMerchantInput(valid);
  assert.ok(shop);
  const records = buildMerchantApplicationRecords("owner-1", shop, bytes, image, timestamp);
  assert.deepEqual(Object.keys(records.application).sort(), ["ownerId", "shop", "status", "submittedAt"]);
  assert.deepEqual(Object.keys(records.document).sort(), ["bytes", "contentType", "createdAt", "fileName", "size"]);
  assert.equal(records.application.submittedAt, records.document.createdAt);
  assert.equal(JSON.stringify(records).includes("undefined"), false);
});

test("Firestore rules reserve merchant business data for the backend while preserving approval checks", () => {
  const rules = readFileSync("firestore.rules", "utf8");
  for (const required of [
    "request.auth.token.email_verified == true",
    "match /merchantApplications/{uid}",
    "match /merchantDocuments/{uid}",
    "match /merchantApplicationAudits/{id}",
    "allow read, write: if false",
    "isApprovedMerchant()",
    "match /liveOffers/{id}",
    "allow read: if true",
  ] as const) assert.ok(rules.includes(required), required);
  assert.equal(rules.includes("allow create: if true"), false);
  assert.equal(rules.includes("match /merchantApplications/{uid} {\n      allow get: if true"), false);
  assert.equal(rules.includes("match /merchantDocuments/{uid} {\n      allow get: if true"), false);
});

test("bytes field is exempt from indexing and all Firebase Storage setup is removed", () => {
  const indexes = JSON.parse(readFileSync("firestore.indexes.json", "utf8")) as { fieldOverrides: Array<{ collectionGroup: string; fieldPath: string; indexes: unknown[] }> };
  assert.deepEqual(indexes.fieldOverrides, [{ collectionGroup: "merchantDocuments", fieldPath: "bytes", indexes: [] }]);
  assert.equal(existsSync("storage.rules"), false);
  assert.equal(readFileSync(".env.example", "utf8").includes("STORAGE_BUCKET"), false);
  assert.equal(readFileSync("lib/firebase.ts", "utf8").includes("firebase/storage"), false);
});

test("local Firebase QA mode requires the explicit flag and a loopback hostname", () => {
  assert.equal(resolveFirebaseRuntimeTarget(undefined, "localhost"), "live");
  assert.equal(resolveFirebaseRuntimeTarget("0", "127.0.0.1"), "live");
  assert.equal(resolveFirebaseRuntimeTarget("1", "localhost"), "emulator");
  assert.equal(resolveFirebaseRuntimeTarget("1", "127.0.0.1"), "emulator");
  assert.equal(resolveFirebaseRuntimeTarget("1", "::1"), "emulator");
  assert.equal(resolveFirebaseRuntimeTarget("1", "prices.example.test"), "blocked");
  assert.equal(isLoopbackHostname("prices.example.test"), false);
});

test("emulator QA code is pinned to demo identity and loopback services with no live fallback", () => {
  assert.equal(FIREBASE_EMULATOR_PROJECT_ID.startsWith("demo-"), true);
  assert.equal(FIRESTORE_EMULATOR_HOST, "127.0.0.1");
  assert.equal(new URL(AUTH_EMULATOR_URL).hostname, "127.0.0.1");
  const firebaseSource = readFileSync("lib/firebase.ts", "utf8");
  assert.ok(firebaseSource.includes('runtimeTarget === "blocked"'));
  assert.ok(firebaseSource.includes("sprint04-local-emulator"));
  assert.ok(firebaseSource.includes("connectAuthEmulator"));
  assert.ok(firebaseSource.includes("connectFirestoreEmulator"));
  const seedSource = readFileSync("tests/qa/sprint04-seed.ts", "utf8");
  assert.equal(seedSource.includes("https://"), false);
  assert.ok(seedSource.includes("AUTH_EMULATOR_URL"));
  assert.ok(seedSource.includes("FIRESTORE_EMULATOR_HOST"));
});

test("manual QA failure scenarios stay local and API failures remain retryable", () => {
  const source = readFileSync("lib/firebaseMerchantAdapter.ts", "utf8");
  assert.ok(source.includes("window.__SA3ERLI_MERCHANT_TEST__"));
  assert.ok(source.includes('current.submit === "document-failure"'));
  assert.ok(source.includes('current.submit === "write-failure"'));
  assert.ok(source.includes("submitDelayMs"));
  assert.ok(source.includes("onError"));
  assert.ok(source.includes("AbortController"));
});
