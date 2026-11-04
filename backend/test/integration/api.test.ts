import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createApplication } from "../../src/bootstrap";
import { FakeTokenVerifier, testConfig } from "../helpers/fakes";

const applications: INestApplication[] = [];

async function application(options: Parameters<typeof testConfig>[0] = {}, verifier = new FakeTokenVerifier()) {
  const app = await createApplication(testConfig(options), verifier);
  applications.push(app);
  return { app, verifier, http: request(app.getHttpServer()) };
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
