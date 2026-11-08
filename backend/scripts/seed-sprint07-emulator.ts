import { getApps, initializeApp } from "firebase-admin/app";
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import { EMULATOR_PROJECT_ID, requireSafeEmulatorEnvironment, resetAuthEmulator, seedAuthEmulator } from "./emulator-fixtures";

const mode = process.argv[2] ?? "seed";
const SPRINT07_WEBP_BASE64 = "UklGRhICAABXRUJQVlA4WAoAAAAgAAAAAAAAAAAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggJAAAAFABAJ0BKgEAAQABQCYloAAE44AA8M//93m//7eb//t5v9+QAA==";

async function resetFirestore(): Promise<void> {
  requireSafeEmulatorEnvironment();
  const response = await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${EMULATOR_PROJECT_ID}/databases/(default)/documents`, { method: "DELETE" });
  if (!response.ok) throw new Error(`Firestore Emulator reset failed (${response.status})`);
}

function bytes(kind: "jpeg" | "png" | "webp"): Buffer {
  if (kind === "jpeg") return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  if (kind === "webp") return Buffer.from(SPRINT07_WEBP_BASE64, "base64");
  return Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
}

async function main(): Promise<void> {
  requireSafeEmulatorEnvironment();
  if (mode === "reset") { await resetAuthEmulator(); await resetFirestore(); return; }
  await resetAuthEmulator();
  await resetFirestore();
  const accounts = await seedAuthEmulator();
  if (getApps().length === 0) initializeApp({ projectId: EMULATOR_PROJECT_ID });
  const db = getFirestore();
  const timestamp = Timestamp.fromDate(new Date("2026-11-07T12:00:00.000Z"));
  const fixtures = [
    [accounts.pending.uid, "pending", "jpeg"],
    [accounts.owner.uid, "pending", "png"],
    [accounts.secondOwner.uid, "pending", "webp"],
    ["test-approved-2", "approved", "jpeg"],
    [accounts.approved.uid, "approved", "png"],
    [accounts.rejected.uid, "rejected", "webp"],
    ["test-rejected-2", "rejected", "png"],
  ] as const;
  const batch = db.batch();
  for (const [ownerId, status, kind] of fixtures) {
    const contentType = kind === "jpeg" ? "image/jpeg" : kind === "png" ? "image/png" : "image/webp";
    const documentBytes = bytes(kind);
    batch.create(db.collection("merchantApplications").doc(ownerId), {
      ownerId,
      shop: { name: `TEST ${status} ${kind} ${ownerId.slice(0, 8)}`, area: "TEST Area", address: "TEST Address", whatsapp: "963911111111" },
      status,
      submittedAt: timestamp,
      version: status === "pending" ? 1 : 2,
      ...(status !== "pending" ? { reviewedAt: timestamp, reviewerId: accounts.admin.uid } : {}),
      ...(status === "rejected" ? { rejectionReason: "TEST rejection reason" } : {}),
    });
    batch.create(db.collection("merchantDocuments").doc(ownerId), {
      bytes: documentBytes,
      fileName: `commercial-record.${kind === "jpeg" ? "jpg" : kind}`,
      contentType,
      size: documentBytes.length,
      createdAt: timestamp,
    });
  }
  batch.create(db.collection("merchantApplicationSummaries").doc("global"), {
    total: mode === "drift" ? 8 : 7,
    pending: 3,
    approved: 2,
    rejected: 2,
    version: 1,
    updatedAt: timestamp,
  });
  await batch.commit();
  console.log(JSON.stringify({ seeded: true, mode, total: 7, pending: 3, approved: 2, rejected: 2 }));
}

void main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Sprint 07 seed failed"); process.exitCode = 1; });
