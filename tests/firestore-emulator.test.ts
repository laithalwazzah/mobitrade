import assert from "node:assert/strict";
import { after, test } from "node:test";
import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app";
import { Bytes, collection, connectFirestoreEmulator, deleteDoc, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc, updateDoc, writeBatch, type Firestore } from "firebase/firestore";

const PROJECT_ID = "demo-sa3erli-sprint04";
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
assert.ok(emulatorHost, "FIRESTORE_EMULATOR_HOST must be set by Firebase CLI");
const separator = emulatorHost.lastIndexOf(":");
const host = emulatorHost.slice(0, separator);
const port = Number(emulatorHost.slice(separator + 1));
const apps: FirebaseApp[] = [];
let sequence = 0;

function database(uid?: string, claims: Record<string, unknown> = {}): Firestore {
  const app = initializeApp({ projectId: PROJECT_ID }, `rules-${sequence += 1}`);
  apps.push(app);
  const db = getFirestore(app);
  connectFirestoreEmulator(db, host, port, uid ? { mockUserToken: { sub: uid, ...claims } } : undefined);
  return db;
}

function application(uid: string) {
  return { ownerId: uid, shop: { name: "TEST", area: "TEST", address: "TEST", whatsapp: "963911111111" }, status: "pending", submittedAt: serverTimestamp(), version: 1 };
}

function merchantDocument() {
  return { bytes: Bytes.fromUint8Array(new Uint8Array([1])), fileName: "commercial-record.png", contentType: "image/png", size: 1, createdAt: serverTimestamp() };
}

after(async () => { await Promise.all(apps.map((app) => deleteApp(app))); });

test("all direct client merchant business-data access is denied", async () => {
  for (const db of [database(), database("owner", { email_verified: true }), database("admin", { email_verified: true, admin: true })]) {
    const batch = writeBatch(db);
    batch.set(doc(db, "merchantApplications", "owner"), application("owner"));
    batch.set(doc(db, "merchantDocuments", "owner"), merchantDocument());
    await assert.rejects(batch.commit());
    await assert.rejects(getDoc(doc(db, "merchantApplications", "owner")));
    await assert.rejects(getDoc(doc(db, "merchantDocuments", "owner")));
    await assert.rejects(getDocs(collection(db, "merchantApplications")));
    await assert.rejects(updateDoc(doc(db, "merchantApplications", "owner"), { status: "approved" }));
    await assert.rejects(deleteDoc(doc(db, "merchantDocuments", "owner")));
  }
});

test("audit records are inaccessible to every client claim", async () => {
  for (const db of [database(), database("owner", { email_verified: true }), database("admin", { email_verified: true, admin: true })]) {
    await assert.rejects(getDocs(collection(db, "merchantApplicationAudits")));
    await assert.rejects(setDoc(doc(db, "merchantApplicationAudits", "fake"), { action: "decision" }));
    await assert.rejects(getDoc(doc(db, "merchantApplicationSummaries", "global")));
    await assert.rejects(getDocs(collection(db, "merchantApplicationSummaries")));
    await assert.rejects(setDoc(doc(db, "merchantApplicationSummaries", "global"), { total: 0, pending: 0, approved: 0, rejected: 0 }));
  }
});

test("catalog and live-offer public reads retain their intended permission", async () => {
  const anonymous = database();
  assert.equal((await getDoc(doc(anonymous, "liveOffers", "missing"))).exists(), false);
});

test("unapproved clients still cannot publish or read submission logs", async () => {
  const owner = database("owner", { email_verified: true });
  await assert.rejects(setDoc(doc(owner, "liveOffers", "963911111111_test_new"), {
    shop: { name: "TEST", area: "TEST", address: "TEST", whatsapp: "963911111111" },
    product: { brand: "TEST", name: "TEST", storage: "64GB", network: "4G" },
    condition: "new", price: 1, currency: "USD", updatedAt: serverTimestamp(),
  }));
  await assert.rejects(getDocs(collection(owner, "submissions")));
});
