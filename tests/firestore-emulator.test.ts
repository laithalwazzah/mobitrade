import test from "node:test";
import assert from "node:assert/strict";
import { initializeApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import {
  buildFirestoreWrites,
  type SubmissionPayload,
} from "../lib/submitOffer";

test("Firestore rules accept valid writes and reject forbidden operations", async () => {
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  assert.ok(emulatorHost, "FIRESTORE_EMULATOR_HOST must be set by Firebase CLI");
  const separator = emulatorHost.lastIndexOf(":");
  const host = emulatorHost.slice(0, separator);
  const port = Number(emulatorHost.slice(separator + 1));
  const app = initializeApp({ projectId: "demo-sa3erli" }, `rules-${Date.now()}`);
  const db = getFirestore(app);
  connectFirestoreEmulator(db, host, port);

  const payload: SubmissionPayload = {
    shop: {
      name: "TEST - احذفني",
      area: "Test Area",
      address: "Test Address",
      whatsapp: "963911111111",
    },
    offers: [
      {
        brand: "Samsung",
        name: "Galaxy A32",
        storage: "128GB",
        network: "4G",
        condition: "used",
        price: 100,
        currency: "USD",
      },
    ],
  };
  const clientId = `rules-${Date.now()}`;
  const writes = buildFirestoreWrites(payload, clientId, serverTimestamp());
  const liveWrite = writes.liveOffers[0];
  const liveRef = doc(db, "liveOffers", liveWrite.id);
  const submissionRef = doc(db, "submissions", clientId);
  const batch = writeBatch(db);
  batch.set(liveRef, liveWrite.data);
  batch.set(submissionRef, writes.submission.data);
  await batch.commit();

  assert.equal((await getDoc(liveRef)).exists(), true);
  await setDoc(liveRef, {
    ...liveWrite.data,
    price: 90,
    updatedAt: serverTimestamp(),
  });

  await assert.rejects(
    setDoc(doc(db, "liveOffers", `${liveWrite.id}-extra`), {
      ...liveWrite.data,
      extra: true,
      updatedAt: serverTimestamp(),
    }),
  );
  await assert.rejects(
    setDoc(doc(db, "liveOffers", liveWrite.id.replace("963911111111", "963922222222")), {
      ...liveWrite.data,
      updatedAt: serverTimestamp(),
    }),
  );
  await assert.rejects(
    setDoc(doc(db, "liveOffers", `${liveWrite.id}-zero`), {
      ...liveWrite.data,
      price: 0,
      updatedAt: serverTimestamp(),
    }),
  );
  await assert.rejects(
    setDoc(doc(db, "liveOffers", `${liveWrite.id}-condition`), {
      ...liveWrite.data,
      condition: "broken",
      updatedAt: serverTimestamp(),
    }),
  );
  await assert.rejects(
    setDoc(doc(db, "liveOffers", `${liveWrite.id}-undefined`), {
      ...liveWrite.data,
      notes: undefined,
      updatedAt: serverTimestamp(),
    }),
  );
  await assert.rejects(deleteDoc(liveRef));
  await assert.rejects(getDoc(submissionRef));
});
