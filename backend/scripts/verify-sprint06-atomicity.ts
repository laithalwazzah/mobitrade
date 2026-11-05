import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { EMULATOR_PROJECT_ID, requireSafeEmulatorEnvironment } from "./emulator-fixtures";

async function main(): Promise<void> {
  requireSafeEmulatorEnvironment();
  if (getApps().length === 0) initializeApp({ projectId: EMULATOR_PROJECT_ID });
  const firestore = getFirestore();
  const [applications, documents] = await Promise.all([
    firestore.collection("merchantApplications").get(),
    firestore.collection("merchantDocuments").get(),
  ]);
  const applicationIds = applications.docs.map((document) => document.id).sort();
  const documentIds = documents.docs.map((document) => document.id).sort();
  if (JSON.stringify(applicationIds) !== JSON.stringify(documentIds)) {
    throw new Error("Atomicity check failed: application/document IDs do not match.");
  }
  for (const application of applications.docs) {
    if (application.data().ownerId !== application.id) {
      throw new Error("Atomicity check failed: an application ownerId does not match its document ID.");
    }
    const document = documents.docs.find((candidate) => candidate.id === application.id);
    if (!document || !Buffer.isBuffer(document.data().bytes)) {
      throw new Error("Atomicity check failed: a paired private Bytes document is missing or malformed.");
    }
  }
  console.log(JSON.stringify({ atomic: true, applicationCount: applicationIds.length, documentCount: documentIds.length }));
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Atomicity verification failed.");
  process.exitCode = 1;
});
