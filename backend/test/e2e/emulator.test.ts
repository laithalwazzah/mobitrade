import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createApplication } from "../../src/bootstrap";
import { loadBackendConfig } from "../../src/config/backend-config";
import { FirebaseAdminService } from "../../src/firebase/firebase-admin.service";
import { resetAuthEmulator, seedAuthEmulator } from "../../scripts/emulator-fixtures";

let app: INestApplication;
let http: ReturnType<typeof request>;
let tokens: Awaited<ReturnType<typeof seedAuthEmulator>>;

before(async () => {
  const config = loadBackendConfig(process.env);
  assert.equal(config.emulatorMode, true);
  assert.match(config.firebaseProjectId, /^demo-/);
  await resetAuthEmulator();
  const reset = await fetch(`http://${config.firebaseFirestoreEmulatorHost}/emulator/v1/projects/${config.firebaseProjectId}/databases/(default)/documents`, { method: "DELETE" });
  assert.equal(reset.ok, true);
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

describe("Merchant API + Auth/Firestore Emulator E2E", () => {
  it("creates privately, denies direct clients, reviews atomically, and records an audit", async () => {
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(24)]);
    const created = await http.post("/api/v1/merchant-applications")
      .set("Authorization", `Bearer ${tokens.owner.idToken}`)
      .field("name", "TEST Emulator Shop")
      .field("area", "TEST Area")
      .field("address", "TEST Address")
      .field("whatsapp", "0911111111")
      .attach("document", png, { filename: "record.png", contentType: "image/png" })
      .expect(201);
    assert.equal(created.body.application.ownerId, tokens.owner.uid);
    assert.equal(JSON.stringify(created.body).includes("bytes"), false);
    const adminFirebase = app.get(FirebaseAdminService);
    const [storedApplication, storedDocument] = await adminFirebase.firestore.getAll(
      adminFirebase.firestore.collection("merchantApplications").doc(tokens.owner.uid),
      adminFirebase.firestore.collection("merchantDocuments").doc(tokens.owner.uid),
    );
    assert.ok(storedApplication);
    assert.ok(storedDocument);
    assert.equal(storedApplication.exists, true);
    assert.equal(storedDocument.exists, true);
    assert.equal(Buffer.isBuffer(storedDocument.data()?.bytes), true);

    const direct = await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/demo-sa3erli-sprint05/databases/(default)/documents/merchantApplications/${tokens.owner.uid}`, {
      headers: { Authorization: `Bearer ${tokens.owner.idToken}` },
    });
    assert.equal(direct.status, 403);

    const mine = await http.get("/api/v1/merchant-applications/me").set("Authorization", `Bearer ${tokens.owner.idToken}`).expect(200);
    assert.equal(mine.body.application.status, "pending");
    const list = await http.get("/api/v1/admin/merchant-applications?status=pending").set("Authorization", `Bearer ${tokens.admin.idToken}`).expect(200);
    assert.ok(list.body.items.some((item: { ownerId: string }) => item.ownerId === tokens.owner.uid));
    assert.equal(JSON.stringify(list.body).includes("bytes"), false);
    const document = await http.get(`/api/v1/admin/merchant-applications/${tokens.owner.uid}/document`).set("Authorization", `Bearer ${tokens.admin.idToken}`).expect(200);
    assert.equal(document.headers["cache-control"], "private, no-store, max-age=0");
    assert.deepEqual(document.body, png);
    await http.patch(`/api/v1/admin/merchant-applications/${tokens.owner.uid}/decision`)
      .set("Authorization", `Bearer ${tokens.admin.idToken}`)
      .send({ decision: "approved", expectedVersion: 2 }).expect(409);
    const decision = await http.patch(`/api/v1/admin/merchant-applications/${tokens.owner.uid}/decision`)
      .set("Authorization", `Bearer ${tokens.admin.idToken}`)
      .send({ decision: "approved", expectedVersion: 1 }).expect(200);
    assert.equal(decision.body.application.status, "approved");
    assert.equal(decision.body.application.version, 2);
    const audits = await adminFirebase.firestore.collection("merchantApplicationAudits").where("applicationId", "==", tokens.owner.uid).get();
    assert.equal(audits.size, 1);
    assert.equal(audits.docs[0]?.data().toStatus, "approved");

    const auditList = await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/demo-sa3erli-sprint05/databases/(default)/documents/merchantApplicationAudits`, {
      headers: { Authorization: `Bearer ${tokens.admin.idToken}` },
    });
    assert.equal(auditList.status, 403);
  });
});
