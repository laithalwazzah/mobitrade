import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createApplication } from "../../src/bootstrap";
import { FakeMerchantRepository, FakeTokenVerifier, identities, testConfig } from "../helpers/fakes";

const applications: INestApplication[] = [];

async function application(options: Parameters<typeof testConfig>[0] = {}, verifier = new FakeTokenVerifier(), repository = new FakeMerchantRepository()) {
  const app = await createApplication(testConfig(options), verifier, repository);
  applications.push(app);
  return { app, verifier, repository, http: request(app.getHttpServer()) };
}

const png = (size = 32) => Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(Math.max(0, size - 8))]);
const validFields = { name: "  TEST   Shop  ", area: "  Lattakia ", address: "  TEST Address ", whatsapp: "0911111111" };
function createRequest(http: ReturnType<typeof request>, file = png(), type = "image/png") {
  let operation = http.post("/api/v1/merchant-applications").set("Authorization", "Bearer user");
  for (const [key, value] of Object.entries(validFields)) operation = operation.field(key, value);
  return operation.attach("document", file, { filename: "claimed.png", contentType: type });
}

afterEach(async () => {
  await Promise.all(applications.splice(0).map((app) => app.close()));
});

describe("trusted API foundation", () => {
  it("reports liveness and readiness without making a Firebase network call", async () => {
    const { http, verifier } = await application();
    const live = await http.get("/api/v1/health/live").expect(200);
    const ready = await http.get("/api/v1/health/ready").expect(200);
    assert.equal(live.body.status, "ok");
    assert.equal(ready.body.status, "ready");
    assert.equal(ready.body.dependencies.firebaseAuth, "emulator");
    assert.deepEqual(verifier.attempts, []);
  });

  it("returns a consistent readiness error envelope", async () => {
    const verifier = new FakeTokenVerifier();
    verifier.ready = false;
    const { http } = await application({}, verifier);
    const response = await http.get("/api/v1/health/ready").expect(503);
    assert.equal(response.body.error.code, "health/not-ready");
    assert.equal(response.body.error.status, 503);
    assert.match(response.body.error.correlationId, /^[a-f0-9-]{36}$/);
  });

  it("rejects missing, malformed, invalid, expired, and revoked tokens safely", async () => {
    const { http } = await application();
    const missing = await http.get("/api/v1/auth/me").expect(401);
    assert.equal(missing.body.error.code, "auth/missing-token");
    const malformed = await http.get("/api/v1/auth/me").set("Authorization", "Basic nope").expect(401);
    assert.equal(malformed.body.error.code, "auth/invalid-token");
    const invalid = await http.get("/api/v1/auth/me").set("Authorization", "Bearer invalid").expect(401);
    assert.equal(invalid.body.error.code, "auth/invalid-token");
    const expired = await http.get("/api/v1/auth/me").set("Authorization", "Bearer expired").expect(401);
    assert.equal(expired.body.error.code, "auth/expired-token");
    const revoked = await http.get("/api/v1/auth/me").set("Authorization", "Bearer revoked").expect(401);
    assert.equal(revoked.body.error.code, "auth/revoked-token");
  });

  it("returns only safe identity fields for unverified, normal, and admin users", async () => {
    const { http } = await application();
    for (const token of ["unverified", "user", "admin"]) {
      const response = await http.get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`).expect(200);
      assert.deepEqual(Object.keys(response.body).sort(), ["claims", "user"]);
      assert.deepEqual(Object.keys(response.body.user).sort(), ["email", "emailVerified", "providerIds", "uid"]);
      assert.deepEqual(Object.keys(response.body.claims), ["admin"]);
      assert.equal("token" in response.body, false);
    }
  });

  it("applies the exact CORS allowlist", async () => {
    const { http } = await application();
    const allowed = await http.get("/api/v1/health/live").set("Origin", "http://localhost:4000").expect(200);
    assert.equal(allowed.headers["access-control-allow-origin"], "http://localhost:4000");
    const denied = await http.get("/api/v1/health/live").set("Origin", "https://evil.example").expect(200);
    assert.equal(denied.headers["access-control-allow-origin"], undefined);
  });

  it("uses trusted or generated correlation ids", async () => {
    const { http } = await application();
    const supplied = await http.get("/api/v1/health/live").set("X-Correlation-Id", "test-request-1").expect(200);
    assert.equal(supplied.headers["x-correlation-id"], "test-request-1");
    const unsafe = await http.get("/api/v1/health/live").set("X-Correlation-Id", "bad value").expect(200);
    assert.match(String(unsafe.headers["x-correlation-id"]), /^[a-f0-9-]{36}$/);
  });

  it("enforces request body limits", async () => {
    const { http } = await application({ requestBodyLimit: "256b" });
    const response = await http.post("/api/v1/auth/me").send({ value: "x".repeat(1024) }).expect(413);
    assert.equal(response.body.error.code, "request/body-too-large");
  });

  it("returns a safe envelope for invalid JSON and unknown routes", async () => {
    const { http } = await application();
    const invalid = await http.post("/api/v1/auth/me").type("json").send("{").expect(400);
    assert.equal(invalid.body.error.code, "request/invalid-json");
    const missing = await http.get("/api/v1/not-a-route").expect(404);
    assert.equal(missing.body.error.code, "request/failed");
  });

  it("enforces rate limits with an error envelope", async () => {
    const { http } = await application({ rateLimitMax: 2 });
    await http.get("/api/v1/health/live").expect(200);
    await http.get("/api/v1/health/live").expect(200);
    const limited = await http.get("/api/v1/health/live").expect(429);
    assert.equal(limited.body.error.code, "rate_limit/exceeded");
  });

  it("serves versioned OpenAPI documentation", async () => {
    const { http } = await application();
    await http.get("/api/v1/docs").expect(200).expect("content-type", /text\/html/);
    const specification = await http.get("/api/v1/docs-json").expect(200);
    assert.ok(specification.body.paths["/api/v1/auth/me"]);
    assert.ok(specification.body.paths["/api/v1/health/live"]);
  });

  it("sets baseline security headers", async () => {
    const { http } = await application();
    const response = await http.get("/api/v1/health/live").expect(200);
    assert.equal(response.headers["x-content-type-options"], "nosniff");
    assert.equal(response.headers["x-frame-options"], "SAMEORIGIN");
  });
});

describe("merchant application APIs", () => {
  it("requires authentication and verified email", async () => {
    const { http } = await application();
    await http.get("/api/v1/merchant-applications/me").expect(401);
    await http.get("/api/v1/merchant-applications/me").set("Authorization", "Bearer unverified").expect(403);
    await http.post("/api/v1/merchant-applications").set("Authorization", "Bearer unverified").expect(403);
  });

  it("normalizes fields and creates metadata and private bytes atomically", async () => {
    const { http, repository } = await application();
    const response = await createRequest(http).expect(201);
    assert.equal(response.body.application.shop.name, "TEST Shop");
    assert.equal(response.body.application.shop.whatsapp, "963911111111");
    assert.equal(response.body.application.status, "pending");
    assert.equal(response.body.application.version, 1);
    assert.equal("bytes" in response.body.application, false);
    assert.equal(repository.applications.size, 1);
    assert.equal(repository.documents.get(identities.user.uid)?.bytes.equals(png()), true);
    const mine = await http.get("/api/v1/merchant-applications/me").set("Authorization", "Bearer user").expect(200);
    assert.equal(mine.body.application.ownerId, identities.user.uid);
    assert.equal(JSON.stringify(mine.body).includes("bytes"), false);
  });

  it("validates real signatures, declared type, exact size boundaries, and strict fields", async () => {
    await createRequest((await application()).http, Buffer.from("not an image")).expect(400);
    await createRequest((await application()).http, png(), "image/jpeg").expect(400);
    const boundary = await createRequest((await application()).http, png(700 * 1024)).expect(201);
    assert.equal(boundary.body.application.status, "pending");
    const oversized = await createRequest((await application()).http, png(700 * 1024 + 1)).expect(413);
    assert.equal(oversized.body.error.code, "merchant/document-too-large");
    assert.equal(oversized.body.error.message, "حجم صورة السجل التجاري يجب ألا يتجاوز 700 كيلوبايت.");
    assert.equal(oversized.body.error.status, 413);
    assert.match(oversized.body.error.correlationId, /^[a-f0-9-]{36}$/);
    assert.equal(JSON.stringify(oversized.body).includes("File too large"), false);
    const { http } = await application();
    await http.post("/api/v1/merchant-applications").set("Authorization", "Bearer user")
      .field(validFields).field("unexpected", "nope")
      .attach("document", png(), { filename: "x.png", contentType: "image/png" }).expect(400);
  });

  it("rejects duplicate and partial records and recovers after a failed atomic create", async () => {
    const repository = new FakeMerchantRepository();
    const { http } = await application({}, new FakeTokenVerifier(), repository);
    await createRequest(http).expect(201);
    const duplicate = await createRequest(http).expect(409);
    assert.equal(duplicate.body.error.code, "merchant/duplicate");

    const partial = new FakeMerchantRepository();
    partial.documents.set(identities.user.uid, { bytes: png(), fileName: "commercial-record.png", contentType: "image/png", size: 32, createdAt: new Date().toISOString() });
    const partialApp = await application({}, new FakeTokenVerifier(), partial);
    assert.equal((await createRequest(partialApp.http).expect(409)).body.error.code, "merchant/inconsistent-record");

    const failing = new FakeMerchantRepository();
    failing.failNextCreate = true;
    const retryApp = await application({}, new FakeTokenVerifier(), failing);
    await createRequest(retryApp.http).expect(500);
    assert.equal(failing.applications.size, 0);
    assert.equal(failing.documents.size, 0);
    await createRequest(retryApp.http).expect(201);
  });

  it("keeps admin list, detail, and private document admin-only", async () => {
    const { http } = await application();
    await createRequest(http).expect(201);
    await http.get("/api/v1/admin/merchant-applications").set("Authorization", "Bearer user").expect(403);
    const list = await http.get("/api/v1/admin/merchant-applications?status=pending&limit=1").set("Authorization", "Bearer admin").expect(200);
    assert.equal(list.body.items.length, 1);
    assert.equal(JSON.stringify(list.body).includes("bytes"), false);
    const detail = await http.get(`/api/v1/admin/merchant-applications/${identities.user.uid}`).set("Authorization", "Bearer admin").expect(200);
    assert.equal("bytes" in detail.body.application, false);
    const denied = await http.get(`/api/v1/admin/merchant-applications/${identities.user.uid}/document`).set("Authorization", "Bearer user").expect(403);
    assert.equal(denied.body.error.code, "auth/admin-required");
    const document = await http.get(`/api/v1/admin/merchant-applications/${identities.user.uid}/document`).set("Authorization", "Bearer admin").expect(200);
    assert.equal(document.headers["cache-control"], "private, no-store, max-age=0");
    assert.equal(document.headers["content-type"], "image/png");
    assert.deepEqual(document.body, png());
  });

  it("paginates safely and rejects invalid filters and cursors", async () => {
    const repository = new FakeMerchantRepository();
    for (const [index, uid] of ["owner-a", "owner-b", "owner-c"].entries()) {
      repository.applications.set(uid, { ownerId: uid, shop: { name: uid, area: "A", address: "B", whatsapp: `96391111111${index}` }, status: index === 2 ? "approved" : "pending", submittedAt: `2026-11-0${index + 1}T00:00:00.000Z`, version: 1 });
    }
    const { http } = await application({}, new FakeTokenVerifier(), repository);
    const first = await http.get("/api/v1/admin/merchant-applications?status=pending&limit=1").set("Authorization", "Bearer admin").expect(200);
    assert.equal(first.body.items.length, 1);
    assert.ok(first.body.nextPageToken);
    const second = await http.get(`/api/v1/admin/merchant-applications?status=pending&limit=1&pageToken=${first.body.nextPageToken}`).set("Authorization", "Bearer admin").expect(200);
    assert.equal(second.body.items.length, 1);
    assert.notEqual(first.body.items[0].ownerId, second.body.items[0].ownerId);
    await http.get("/api/v1/admin/merchant-applications?status=invalid").set("Authorization", "Bearer admin").expect(400);
    await http.get("/api/v1/admin/merchant-applications?pageToken=YWJj").set("Authorization", "Bearer admin").expect(400);
  });

  it("makes pending-only audited decisions with optimistic concurrency", async () => {
    const { http, repository } = await application();
    await createRequest(http).expect(201);
    const uid = identities.user.uid;
    await http.patch(`/api/v1/admin/merchant-applications/${uid}/decision`).set("Authorization", "Bearer user").send({ decision: "approved", expectedVersion: 1 }).expect(403);
    await http.patch(`/api/v1/admin/merchant-applications/${uid}/decision`).set("Authorization", "Bearer admin").send({ decision: "rejected", expectedVersion: 1 }).expect(400);
    await http.patch(`/api/v1/admin/merchant-applications/${uid}/decision`).set("Authorization", "Bearer admin").send({ decision: "approved", reason: "not allowed", expectedVersion: 1 }).expect(400);
    await http.patch(`/api/v1/admin/merchant-applications/${uid}/decision`).set("Authorization", "Bearer admin").send({ decision: "approved", expectedVersion: 2 }).expect(409);
    const approved = await http.patch(`/api/v1/admin/merchant-applications/${uid}/decision`).set("Authorization", "Bearer admin").send({ decision: "approved", expectedVersion: 1 }).expect(200);
    assert.equal(approved.body.application.version, 2);
    assert.equal(repository.audits.length, 1);
    await http.patch(`/api/v1/admin/merchant-applications/${uid}/decision`).set("Authorization", "Bearer admin").send({ decision: "rejected", reason: "late", expectedVersion: 2 }).expect(409);
  });

  it("documents all Sprint 06 routes in OpenAPI", async () => {
    const { http } = await application();
    const specification = await http.get("/api/v1/docs-json").expect(200);
    for (const route of ["/api/v1/merchant-applications", "/api/v1/merchant-applications/me", "/api/v1/admin/merchant-applications", "/api/v1/admin/merchant-applications/{uid}", "/api/v1/admin/merchant-applications/{uid}/document", "/api/v1/admin/merchant-applications/{uid}/decision"]) {
      assert.ok(specification.body.paths[route], route);
    }
    const parameters = specification.body.paths["/api/v1/admin/merchant-applications"].get.parameters;
    assert.deepEqual(parameters.map((parameter: { name: string }) => parameter.name).sort(), ["limit", "pageToken", "status"]);
    const status = parameters.find((parameter: { name: string }) => parameter.name === "status");
    assert.equal(status.required, false);
    assert.deepEqual(status.schema.enum, ["pending", "approved", "rejected"]);
    const limit = parameters.find((parameter: { name: string }) => parameter.name === "limit");
    assert.equal(limit.schema.minimum, 1);
    assert.equal(limit.schema.maximum, 50);
    assert.equal(limit.schema.default, 20);
    const pageToken = parameters.find((parameter: { name: string }) => parameter.name === "pageToken");
    assert.equal(pageToken.required, false);
    assert.equal(pageToken.schema.maxLength, 512);
    assert.equal(parameters.some((parameter: { name: string }) => ["page", "pageSize"].includes(parameter.name)), false);
  });
});
