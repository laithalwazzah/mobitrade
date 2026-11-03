import { Bytes, doc, onSnapshot, serverTimestamp, writeBatch } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase";
import { isFirebaseEmulatorModeActive } from "@/lib/firebaseEmulatorMode";
import { buildMerchantApplicationRecords, hasMerchantValidationErrors, normalizeMerchantInput, parseMerchantApplication, SafeMerchantError, validateMerchantApplication, type MerchantApplication, type MerchantApplicationInput } from "@/lib/merchantApplication";

export type MerchantApplicationAdapter = {
  available: boolean;
  subscribe(uid: string, listener: (application: MerchantApplication | null) => void, onError: () => void): () => void;
  submit(uid: string, input: MerchantApplicationInput, file: File): Promise<void>;
};

type MerchantTestConfig = { enabled: true; unavailable?: boolean; status?: MerchantApplication["status"] | "none"; submit?: "success" | "duplicate" | "document-failure" | "write-failure"; submitDelayMs?: number; rejectionReason?: string };
declare global { interface Window { __SA3ERLI_MERCHANT_TEST__?: MerchantTestConfig; __SA3ERLI_MERCHANT_TEST_EVENTS__?: string[]; __SA3ERLI_MERCHANT_QA_READ_FAILURE_USED__?: boolean; } }

function unavailableAdapter(): MerchantApplicationAdapter {
  return { available: false, subscribe(_uid, listener) { queueMicrotask(() => listener(null)); return () => {}; }, async submit() { throw new SafeMerchantError("merchant/unavailable"); } };
}

function firebaseAdapter(): MerchantApplicationAdapter {
  const auth = getFirebaseAuth(); const db = getFirebaseFirestore();
  if (!auth || !db) return unavailableAdapter();
  const qaScenario = isFirebaseEmulatorModeActive() ? new URLSearchParams(window.location.search).get("qaScenario") : null;
  return {
    available: true,
    subscribe(uid, listener, onError) {
      if (qaScenario === "read-failure" && !window.__SA3ERLI_MERCHANT_QA_READ_FAILURE_USED__) {
        window.__SA3ERLI_MERCHANT_QA_READ_FAILURE_USED__ = true;
        queueMicrotask(onError);
        return () => {};
      }
      if (qaScenario === "duplicate") { queueMicrotask(() => listener(null)); return () => {}; }
      return onSnapshot(doc(db, "merchantApplications", uid), (snapshot) => listener(snapshot.exists() ? parseMerchantApplication(snapshot.data(), uid) : null), onError);
    },
    async submit(uid, input, file) {
      if (qaScenario === "document-failure") throw new SafeMerchantError("merchant/document-failed");
      if (qaScenario === "write-failure") throw new SafeMerchantError("merchant/write-failed");
      const user = auth.currentUser;
      if (!user || user.uid !== uid || !user.emailVerified) throw new SafeMerchantError("merchant/permission-denied");
      const validation = validateMerchantApplication(input, file);
      if (hasMerchantValidationErrors(validation)) throw new SafeMerchantError(validation.file ? "merchant/document-failed" : "merchant/write-failed");
      const shop = normalizeMerchantInput(input); if (!shop) throw new SafeMerchantError("merchant/write-failed");
      if (qaScenario === "slow-submit") await new Promise((resolve) => window.setTimeout(resolve, 500));
      let bytes: Bytes;
      try { bytes = Bytes.fromUint8Array(new Uint8Array(await file.arrayBuffer())); }
      catch { throw new SafeMerchantError("merchant/document-failed"); }
      try {
        const timestamp = serverTimestamp();
        const records = buildMerchantApplicationRecords(uid, shop, bytes, file, timestamp);
        const batch = writeBatch(db);
        batch.set(doc(db, "merchantApplications", uid), records.application);
        batch.set(doc(db, "merchantDocuments", uid), records.document);
        await batch.commit();
      } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && String(error.code).includes("permission-denied")) throw new SafeMerchantError("merchant/duplicate");
        throw new SafeMerchantError("merchant/write-failed");
      }
    },
  };
}

function mockApplication(uid: string, status: MerchantApplication["status"], reason?: string): MerchantApplication {
  return { ownerId: uid, shop: { name: "TEST Shop", area: "TEST Area", address: "TEST Address", whatsapp: "963911111111" }, status, submittedAt: "2026-11-03T00:00:00.000Z", ...(status === "rejected" && reason ? { rejectionReason: reason } : {}) };
}
function testAdapter(config: MerchantTestConfig): MerchantApplicationAdapter {
  const events = (window.__SA3ERLI_MERCHANT_TEST_EVENTS__ ??= []); const listeners = new Set<(value: MerchantApplication | null) => void>();
  return { available: true, subscribe(uid, listener) { listeners.add(listener); const timer = window.setTimeout(() => listener(config.status && config.status !== "none" ? mockApplication(uid, config.status, config.rejectionReason) : null), 0); return () => { clearTimeout(timer); listeners.delete(listener); }; }, async submit(uid) { const current = window.__SA3ERLI_MERCHANT_TEST__ ?? config; events.push("batch-application", "batch-document"); if (current.submit === "document-failure") throw new SafeMerchantError("merchant/document-failed"); if (current.submitDelayMs) await new Promise((resolve) => window.setTimeout(resolve, current.submitDelayMs)); if (current.submit === "duplicate") throw new SafeMerchantError("merchant/duplicate"); if (current.submit === "write-failure") throw new SafeMerchantError("merchant/write-failed"); events.push("batch-commit"); const pending = mockApplication(uid, "pending"); for (const listener of listeners) listener(pending); } };
}

export function createMerchantApplicationAdapter(): MerchantApplicationAdapter {
  const test = typeof window !== "undefined" && ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname) ? window.__SA3ERLI_MERCHANT_TEST__ : undefined;
  if (test?.enabled) return test.unavailable ? unavailableAdapter() : testAdapter(test);
  return firebaseAdapter();
}
