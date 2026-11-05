import { Timestamp, getFirestore } from "firebase-admin/firestore";
import { resetAuthEmulator, seedAuthEmulator, requireSafeEmulatorEnvironment } from "./emulator-fixtures";

async function resetFirestore() {
  requireSafeEmulatorEnvironment();
  const response = await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents`, { method: "DELETE" });
  if (!response.ok) throw new Error(`Firestore Emulator reset failed (${response.status})`);
}

async function main() {
  await resetAuthEmulator();
  await resetFirestore();
  const accounts = await seedAuthEmulator();
  const db = getFirestore();
  const fixtures = [
    ["pending", "pending"] as const,
    ["approved", "approved"] as const,
    ["rejected", "rejected"] as const,
  ];
  for (const [key, status] of fixtures) {
    const ownerId = accounts[key].uid;
    const timestamp = Timestamp.now();
    const batch = db.batch();
    batch.create(db.collection("merchantApplications").doc(ownerId), {
      ownerId,
      shop: { name: `TEST ${status} shop`, area: "TEST Area", address: "TEST Address", whatsapp: "963911111111" },
      status,
      submittedAt: timestamp,
      version: status === "pending" ? 1 : 2,
      ...(status !== "pending" ? { reviewedAt: timestamp, reviewerId: accounts.admin.uid } : {}),
      ...(status === "rejected" ? { rejectionReason: "TEST rejection reason" } : {}),
    });
    batch.create(db.collection("merchantDocuments").doc(ownerId), {
      bytes: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      fileName: "commercial-record.png",
      contentType: "image/png",
      size: 8,
      createdAt: timestamp,
    });
    await batch.commit();
  }
  console.log("Sprint 06 demo emulator fixtures seeded (owner, pending, approved, rejected, second owner, admin)." );
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Sprint 06 fixture seeding failed");
  process.exitCode = 1;
});
