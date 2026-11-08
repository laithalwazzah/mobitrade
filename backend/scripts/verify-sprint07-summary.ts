import { getApps, initializeApp } from "firebase-admin/app";
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import { EMULATOR_PROJECT_ID, requireSafeEmulatorEnvironment } from "./emulator-fixtures";

type Counts = { total: number; pending: number; approved: number; rejected: number };

function valid(value: Record<string, unknown> | undefined): value is Record<string, number> {
  if (!value) return false;
  const fields = [value.total, value.pending, value.approved, value.rejected, value.version];
  return fields.every((item) => Number.isInteger(item) && (item as number) >= 0)
    && (value.version as number) >= 1
    && value.total === (value.pending as number) + (value.approved as number) + (value.rejected as number);
}

async function main(): Promise<void> {
  requireSafeEmulatorEnvironment();
  if (getApps().length === 0) initializeApp({ projectId: EMULATOR_PROJECT_ID });
  const db = getFirestore();
  const applications = await db.collection("merchantApplications").get();
  const recomputed: Counts = { total: applications.size, pending: 0, approved: 0, rejected: 0 };
  for (const application of applications.docs) {
    const status: unknown = application.data().status;
    if (status !== "pending" && status !== "approved" && status !== "rejected") throw new Error("Malformed application status prevents summary verification.");
    recomputed[status] += 1;
  }
  const reference = db.collection("merchantApplicationSummaries").doc("global");
  const snapshot = await reference.get();
  const stored = snapshot.exists ? snapshot.data() : undefined;
  const consistent = valid(stored) && stored.total === recomputed.total && stored.pending === recomputed.pending && stored.approved === recomputed.approved && stored.rejected === recomputed.rejected;
  const repair = process.argv.includes("--repair");
  if (repair && !consistent) {
    requireSafeEmulatorEnvironment();
    await reference.set({ ...recomputed, version: valid(stored) ? Number(stored.version) + 1 : 1, updatedAt: Timestamp.now() });
  }
  console.log(JSON.stringify({ consistent, repaired: repair && !consistent, recomputed, stored: valid(stored) ? { total: stored.total, pending: stored.pending, approved: stored.approved, rejected: stored.rejected } : null }));
  if (!consistent && !repair) process.exitCode = 2;
}

void main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Summary verification failed"); process.exitCode = 1; });
