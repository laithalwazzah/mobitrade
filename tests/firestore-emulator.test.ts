import assert from "node:assert/strict";
import { after, test } from "node:test";
import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app";
import {
  Bytes,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";

const PROJECT_ID = "demo-sa3erli-sprint04";
const MAX_BYTES = 700 * 1024;
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

function shop() {
  return { name: "TEST Shop", area: "TEST Area", address: "TEST Address", whatsapp: "963911111111" };
}

function application(uid: string, status: "pending" | "approved" | "rejected" = "pending") {
  return { ownerId: uid, shop: shop(), status, submittedAt: serverTimestamp() };
}

function merchantDocument(size: number, contentType = "image/png") {
  const extension = contentType === "image/jpeg" ? "jpg" : contentType === "image/png" ? "png" : "webp";
  return {
    bytes: Bytes.fromUint8Array(new Uint8Array(size)),
    fileName: `commercial-record.${extension}`,
    contentType,
    size,
    createdAt: serverTimestamp(),
  };
}

async function createPair(db: Firestore, uid: string, size = 16) {
  const batch = writeBatch(db);
  batch.set(doc(db, "merchantApplications", uid), application(uid));
  batch.set(doc(db, "merchantDocuments", uid), merchantDocument(size));
  await batch.commit();
}

after(async () => {
  await Promise.all(apps.map((app) => deleteApp(app)));
});

test("verified owner atomically creates and gets only their application and private bytes", async () => {
  const uid = "owner-basic";
  const owner = database(uid, { email_verified: true });
  await createPair(owner, uid);
  const applicationSnapshot = await getDoc(doc(owner, "merchantApplications", uid));
  const documentSnapshot = await getDoc(doc(owner, "merchantDocuments", uid));
  assert.equal(applicationSnapshot.exists(), true);
  assert.equal(documentSnapshot.exists(), true);
  assert.equal("bytes" in (applicationSnapshot.data() ?? {}), false);
  assert.equal(documentSnapshot.data()?.bytes instanceof Bytes, true);
  await assert.rejects(getDocs(collection(owner, "merchantApplications")));
  await assert.rejects(getDocs(collection(owner, "merchantDocuments")));
});

test("unverified and unauthenticated users cannot create or read merchant records", async () => {
  const uid = "owner-unverified";
  const unverified = database(uid, { email_verified: false });
  const anonymous = database();
  await assert.rejects(createPair(unverified, uid));
  await assert.rejects(getDoc(doc(unverified, "merchantApplications", uid)));
  await assert.rejects(getDoc(doc(unverified, "merchantDocuments", uid)));
  await assert.rejects(createPair(anonymous, "anonymous-owner"));
  await assert.rejects(getDoc(doc(anonymous, "merchantApplications", uid)));
  await assert.rejects(getDoc(doc(anonymous, "merchantDocuments", uid)));
});

test("another verified owner cannot read or write someone else's application or bytes", async () => {
  const uid = "owner-private";
  const owner = database(uid, { email_verified: true });
  const other = database("other-owner", { email_verified: true });
  await createPair(owner, uid);
  await assert.rejects(getDoc(doc(other, "merchantApplications", uid)));
  await assert.rejects(getDoc(doc(other, "merchantDocuments", uid)));
  await assert.rejects(setDoc(doc(other, "merchantApplications", uid), application(uid)));
  await assert.rejects(setDoc(doc(other, "merchantDocuments", uid), merchantDocument(16)));
});

test("trusted admin can list applications, read private bytes, and change pending status", async () => {
  const uid = "owner-admin-review";
  const owner = database(uid, { email_verified: true });
  const admin = database("admin-reviewer", { admin: true, email_verified: true });
  await createPair(owner, uid);
  const applications = await getDocs(collection(admin, "merchantApplications"));
  assert.ok(applications.docs.some((snapshot) => snapshot.id === uid));
  assert.equal((await getDoc(doc(admin, "merchantDocuments", uid))).exists(), true);
  await updateDoc(doc(admin, "merchantApplications", uid), {
    status: "approved",
    reviewerId: "admin-reviewer",
    reviewedAt: serverTimestamp(),
  });
  assert.equal((await getDoc(doc(owner, "merchantApplications", uid))).data()?.status, "approved");

  const rejectedUid = "owner-admin-rejected";
  const rejectedOwner = database(rejectedUid, { email_verified: true });
  await createPair(rejectedOwner, rejectedUid);
  await updateDoc(doc(admin, "merchantApplications", rejectedUid), {
    status: "rejected",
    rejectionReason: "TEST incomplete record",
    reviewerId: "admin-reviewer",
    reviewedAt: serverTimestamp(),
  });
  assert.equal((await getDoc(doc(rejectedOwner, "merchantApplications", rejectedUid))).data()?.status, "rejected");
});

test("clients cannot create approved/rejected status or change a pending decision", async () => {
  const uid = "owner-status";
  const owner = database(uid, { email_verified: true });
  const approvedBatch = writeBatch(owner);
  approvedBatch.set(doc(owner, "merchantApplications", uid), application(uid, "approved"));
  approvedBatch.set(doc(owner, "merchantDocuments", uid), merchantDocument(16));
  await assert.rejects(approvedBatch.commit());
  await createPair(owner, uid);
  await assert.rejects(updateDoc(doc(owner, "merchantApplications", uid), { status: "approved" }));
  await assert.rejects(updateDoc(doc(owner, "merchantApplications", uid), { status: "rejected", rejectionReason: "TEST" }));
  await assert.rejects(updateDoc(doc(owner, "merchantDocuments", uid), { size: 1 }));
  await assert.rejects(deleteDoc(doc(owner, "merchantApplications", uid)));
  await assert.rejects(deleteDoc(doc(owner, "merchantDocuments", uid)));
});

test("duplicate and partial merchant records are rejected atomically", async () => {
  const uid = "owner-duplicate";
  const owner = database(uid, { email_verified: true });
  await createPair(owner, uid);
  await assert.rejects(createPair(owner, uid));

  const partialApplicationUid = "partial-application";
  const partialApplicationOwner = database(partialApplicationUid, { email_verified: true });
  await assert.rejects(setDoc(doc(partialApplicationOwner, "merchantApplications", partialApplicationUid), application(partialApplicationUid)));
  assert.equal((await getDoc(doc(partialApplicationOwner, "merchantApplications", partialApplicationUid))).exists(), false);

  const partialDocumentUid = "partial-document";
  const partialDocumentOwner = database(partialDocumentUid, { email_verified: true });
  await assert.rejects(setDoc(doc(partialDocumentOwner, "merchantDocuments", partialDocumentUid), merchantDocument(16)));
  assert.equal((await getDoc(doc(partialDocumentOwner, "merchantDocuments", partialDocumentUid))).exists(), false);
});

test("document bytes accept exactly 700 KiB and reject one byte above the boundary", async () => {
  const exactUid = "owner-exact-boundary";
  const exactOwner = database(exactUid, { email_verified: true });
  await createPair(exactOwner, exactUid, MAX_BYTES);
  assert.equal((await getDoc(doc(exactOwner, "merchantDocuments", exactUid))).data()?.size, MAX_BYTES);

  const oversizedUid = "owner-oversized";
  const oversizedOwner = database(oversizedUid, { email_verified: true });
  await assert.rejects(createPair(oversizedOwner, oversizedUid, MAX_BYTES + 1));
  assert.equal((await getDoc(doc(oversizedOwner, "merchantApplications", oversizedUid))).exists(), false);
  assert.equal((await getDoc(doc(oversizedOwner, "merchantDocuments", oversizedUid))).exists(), false);
});

test("invalid bytes metadata and unauthorized publishing writes are denied while live offer reads stay public", async () => {
  const uid = "owner-invalid-metadata";
  const owner = database(uid, { email_verified: true });
  const batch = writeBatch(owner);
  batch.set(doc(owner, "merchantApplications", uid), application(uid));
  batch.set(doc(owner, "merchantDocuments", uid), { ...merchantDocument(16), size: 15 });
  await assert.rejects(batch.commit());

  const anonymous = database();
  await assert.rejects(setDoc(doc(anonymous, "liveOffers", "963911111111_test_new"), {
    shop: shop(),
    product: { brand: "TEST", name: "TEST", storage: "64GB", network: "4G" },
    condition: "new",
    price: 1,
    currency: "USD",
    updatedAt: serverTimestamp(),
  }));
  assert.equal((await getDoc(doc(anonymous, "liveOffers", "public-missing-document"))).exists(), false);
});
