import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createApplication } from "../../src/bootstrap";
import { loadBackendConfig } from "../../src/config/backend-config";
import { resetAuthEmulator, seedAuthEmulator } from "../../scripts/emulator-fixtures";

let app: INestApplication;
let http: ReturnType<typeof request>;
let tokens: Awaited<ReturnType<typeof seedAuthEmulator>>;

before(async () => {
  const config = loadBackendConfig(process.env);
  assert.equal(config.emulatorMode, true);
  assert.match(config.firebaseProjectId, /^demo-/);
  await resetAuthEmulator();
  tokens = await seedAuthEmulator();
  app = await createApplication(config);
  http = request(app.getHttpServer());
});

after(async () => {
  await app?.close();
});

describe("Auth Emulator E2E", () => {
  it("accepts real emulator tokens for unverified, verified, and admin fixtures", async () => {
    const cases = [
      [tokens.unverified.idToken, false, false],
      [tokens.owner.idToken, true, false],
      [tokens.admin.idToken, true, true],
    ] as const;
    for (const [token, verified, admin] of cases) {
      const response = await http.get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`).expect(200);
      assert.equal(response.body.user.emailVerified, verified);
      assert.equal(response.body.claims.admin, admin);
    }
  });

  it("rejects tokens not issued by the local emulator", async () => {
    const response = await http.get("/api/v1/auth/me").set("Authorization", "Bearer not-an-emulator-token").expect(401);
    assert.equal(response.body.error.code, "auth/invalid-token");
  });

  it("reports emulator readiness and never exposes credentials", async () => {
    const response = await http.get("/api/v1/health/ready").expect(200);
    assert.equal(response.body.dependencies.firebaseAuth, "emulator");
    assert.equal(JSON.stringify(response.body).includes("key"), false);
  });
});
