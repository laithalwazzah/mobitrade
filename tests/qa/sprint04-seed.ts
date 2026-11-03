import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  Bytes,
  connectFirestoreEmulator,
  doc,
  getFirestore,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import {
  AUTH_EMULATOR_URL,
  FIREBASE_EMULATOR_PROJECT_ID,
  FIRESTORE_EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "../../lib/firebaseEmulatorMode";

const PASSWORD = "Sprint04-QA-Only!123";
const scenarios = ["status", "duplicate", "failure", "privacy"] as const;
type Scenario = (typeof scenarios)[number];
type SeedAccount = { key: string; email: string; verified: boolean; admin?: boolean };

const accounts: SeedAccount[] = [
  { key: "unverified", email: "qa-unverified@sprint04.example.test", verified: false },
  { key: "pending", email: "qa-pending@sprint04.example.test", verified: true },
  { key: "approved", email: "qa-approved@sprint04.example.test", verified: true },
  { key: "rejected", email: "qa-rejected@sprint04.example.test", verified: true },
  { key: "second", email: "qa-second-owner@sprint04.example.test", verified: true },
  { key: "admin", email: "qa-admin@sprint04.example.test", verified: true, admin: true },
];

const apps: FirebaseApp[] = [];

async function requestJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const text = await response.text();
  if (!response.ok) throw new Error(`Local emulator request failed (${response.status}): ${text}`);
  return text ? JSON.parse(text) as Record<string, unknown> : {};
}

async function clearEmulators() {
  await requestJson(`${AUTH_EMULATOR_URL}/emulator/v1/projects/${FIREBASE_EMULATOR_PROJECT_ID}/accounts`, { method: "DELETE" });
  await requestJson(`http://${FIRESTORE_EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}/emulator/v1/projects/${FIREBASE_EMULATOR_PROJECT_ID}/databases/(default)/documents`, { method: "DELETE" });
}

async function createAuthAccount(account: SeedAccount) {
  const created = await requestJson(`${AUTH_EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: account.email, password: PASSWORD, returnSecureToken: true }),
  });
  const localId = String(created.localId ?? "");
  if (!localId) throw new Error(`Auth emulator did not return a uid for ${account.key}.`);
  if (account.verified || account.admin) {
    await requestJson(`${AUTH_EMULATOR_URL}/identitytoolkit.googleapis.com/v1/projects/${FIREBASE_EMULATOR_PROJECT_ID}/accounts:update?key=demo-api-key`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer owner" },
      body: JSON.stringify({
        localId,
        emailVerified: account.verified,
        ...(account.admin ? { customAttributes: JSON.stringify({ admin: true }) } : {}),
      }),
    });
  }
  return { ...account, uid: localId };
}

function firestoreFor(uid: string, claims: Record<string, unknown> = {}) {
  const app = initializeApp({ projectId: FIREBASE_EMULATOR_PROJECT_ID }, `qa-seed-${uid}-${apps.length}`);
  apps.push(app);
  const db = getFirestore(app);
  connectFirestoreEmulator(db, FIRESTORE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT, {
    mockUserToken: { sub: uid, email_verified: true, ...claims },
  });
  return db;
}

function bytesFromHex(hex: string) {
  const pairs = hex.match(/.{1,2}/g) ?? [];
  return Bytes.fromUint8Array(Uint8Array.from(pairs.map((pair) => Number.parseInt(pair, 16))));
}

const syntheticImages = {
  jpeg: bytesFromHex("ffd8ffe000104a46494600010100000100010000ffd9"),
  png: bytesFromHex("89504e470d0a1a0a0000000049454e44ae426082"),
  webp: bytesFromHex("524946460c000000574542505650382000000000"),
};

function writeDummyUploadFiles() {
  const relativeDir = join("test-artifacts", "sprint04-qa");
  const outputDir = join(process.cwd(), relativeDir);
  mkdirSync(outputDir, { recursive: true });
  const files = {
    jpeg: join(outputDir, "dummy-commercial-record.jpg"),
    png: join(outputDir, "dummy-commercial-record.png"),
    webp: join(outputDir, "dummy-commercial-record.webp"),
  };
  for (const kind of Object.keys(files) as Array<keyof typeof files>) {
    writeFileSync(files[kind], syntheticImages[kind].toUint8Array());
  }
  return relativeDir;
}

async function createMerchantPair(db: Firestore, uid: string, whatsapp: string, kind: keyof typeof syntheticImages) {
  const contentType = kind === "jpeg" ? "image/jpeg" : `image/${kind}`;
  const fileName = `commercial-record.${kind === "jpeg" ? "jpg" : kind}`;
  const bytes = syntheticImages[kind];
  const timestamp = serverTimestamp();
  const batch = writeBatch(db);
  batch.set(doc(db, "merchantApplications", uid), {
    ownerId: uid,
    shop: { name: `TEST QA ${kind.toUpperCase()}`, area: "TEST Area", address: "TEST Address", whatsapp },
    status: "pending",
    submittedAt: timestamp,
  });
  batch.set(doc(db, "merchantDocuments", uid), {
    bytes,
    fileName,
    contentType,
    size: bytes.toUint8Array().byteLength,
    createdAt: timestamp,
  });
  await batch.commit();
}

async function seedFirestore(created: Array<SeedAccount & { uid: string }>) {
  const pending = created.find((account) => account.key === "pending");
  const approved = created.find((account) => account.key === "approved");
  const rejected = created.find((account) => account.key === "rejected");
  const admin = created.find((account) => account.key === "admin");
  if (!pending || !approved || !rejected || !admin) throw new Error("Missing local QA account fixture.");

  await createMerchantPair(firestoreFor(pending.uid), pending.uid, "963911111111", "jpeg");
  await createMerchantPair(firestoreFor(approved.uid), approved.uid, "963922222222", "png");
  await createMerchantPair(firestoreFor(rejected.uid), rejected.uid, "963933333333", "webp");

  const adminDb = firestoreFor(admin.uid, { admin: true });
  await updateDoc(doc(adminDb, "merchantApplications", approved.uid), {
    status: "approved",
    reviewerId: admin.uid,
    reviewedAt: serverTimestamp(),
  });
  await updateDoc(doc(adminDb, "merchantApplications", rejected.uid), {
    status: "rejected",
    rejectionReason: "TEST QA: بيانات تجريبية غير مكتملة",
    reviewerId: admin.uid,
    reviewedAt: serverTimestamp(),
  });
}

function printInstructions(scenario: Scenario, created: Array<SeedAccount & { uid: string }>) {
  console.log(`Sprint 04 local QA fixtures ready (${scenario}).`);
  console.log(`Password for every dummy account: ${PASSWORD}`);
  for (const account of created) console.log(`${account.key}: ${account.email}`);
  console.log(`Safe dummy upload files: ${writeDummyUploadFiles()}`);
  if (scenario === "duplicate") console.log("Duplicate URL: http://127.0.0.1:4000/add?qaScenario=duplicate (sign in as pending). ");
  if (scenario === "failure") console.log("Failure URLs: /add?qaScenario=read-failure and /add?qaScenario=write-failure (sign in as second). ");
  if (scenario === "privacy") console.log("Privacy: compare pending with second; the second account has no merchant records.");
  if (scenario === "status") console.log("Status: sign in as pending, approved, and rejected accounts in turn.");
}

async function main() {
  const requested = process.argv[2] ?? "status";
  if (requested !== "reset" && !scenarios.includes(requested as Scenario)) throw new Error(`Unknown scenario: ${requested}`);
  await clearEmulators();
  if (requested === "reset") {
    console.log("Sprint 04 Auth and Firestore emulators reset.");
    return;
  }
  const created = [];
  for (const account of accounts) created.push(await createAuthAccount(account));
  await seedFirestore(created);
  printInstructions(requested as Scenario, created);
}

async function run() {
  try {
    await main();
  } finally {
    await Promise.all(apps.map((app) => deleteApp(app)));
  }
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Local QA seeding failed.");
  process.exitCode = 1;
});
