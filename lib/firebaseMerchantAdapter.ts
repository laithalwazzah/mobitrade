import { resolveBackendApiBase } from "@/lib/backendApi";
import { getFirebaseAuth } from "@/lib/firebase";
import { parseMerchantApplication, SafeMerchantError, type MerchantApplication, type MerchantApplicationInput } from "@/lib/merchantApplication";

export type MerchantApplicationAdapter = {
  available: boolean;
  subscribe(uid: string, listener: (application: MerchantApplication | null) => void, onError: () => void): () => void;
  submit(uid: string, input: MerchantApplicationInput, file: File): Promise<void>;
};

type MerchantTestConfig = { enabled: true; unavailable?: boolean; status?: MerchantApplication["status"] | "none"; submit?: "success" | "duplicate" | "document-failure" | "write-failure"; submitDelayMs?: number; rejectionReason?: string };
declare global { interface Window { __SA3ERLI_MERCHANT_TEST__?: MerchantTestConfig; __SA3ERLI_MERCHANT_TEST_EVENTS__?: string[]; } }

function unavailableAdapter(): MerchantApplicationAdapter {
  return { available: false, subscribe(_uid, listener) { queueMicrotask(() => listener(null)); return () => {}; }, async submit() { throw new SafeMerchantError("merchant/unavailable"); } };
}

function apiAdapter(): MerchantApplicationAdapter {
  const auth = getFirebaseAuth();
  const apiBase = resolveBackendApiBase();
  if (!auth || !apiBase) return unavailableAdapter();
  const configuredAuth = auth;
  const listeners = new Set<(value: MerchantApplication | null) => void>();

  async function request(path: string, init: RequestInit = {}) {
    const user = configuredAuth.currentUser;
    if (!user?.emailVerified) throw new SafeMerchantError("merchant/permission-denied");
    const token = await user.getIdToken();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    try {
      return await fetch(`${apiBase}${path}`, { ...init, headers: { ...init.headers, Authorization: `Bearer ${token}` }, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }

  async function safeError(response: Response): Promise<SafeMerchantError> {
    let code: unknown;
    try {
      const body = await response.clone().json() as { error?: { code?: unknown } };
      code = body.error?.code;
    } catch {
      // Invalid or empty error bodies are intentionally reduced to a safe generic message.
    }
    if (response.status === 409 && code === "merchant/duplicate") return new SafeMerchantError("merchant/duplicate");
    if (response.status === 401 || response.status === 403) return new SafeMerchantError("merchant/permission-denied");
    return new SafeMerchantError("merchant/write-failed");
  }

  return {
    available: true,
    subscribe(uid, listener, onError) {
      listeners.add(listener);
      let active = true;
      void request("/merchant-applications/me")
        .then(async (response) => {
          if (!active) return;
          if (!response.ok) throw await safeError(response);
          const responseBody = await response.json() as { application?: unknown };
          listener(responseBody.application ? parseMerchantApplication(responseBody.application, uid) : null);
        })
        .catch(() => { if (active) onError(); });
      return () => { active = false; listeners.delete(listener); };
    },
    async submit(uid, input, file) {
      const user = configuredAuth.currentUser;
      if (!user || user.uid !== uid || !user.emailVerified) throw new SafeMerchantError("merchant/permission-denied");
      const body = new FormData();
      body.set("name", input.name);
      body.set("area", input.area);
      body.set("address", input.address);
      body.set("whatsapp", input.whatsapp);
      body.set("document", file, file.name);
      try {
        const response = await request("/merchant-applications", { method: "POST", body });
        if (!response.ok) throw await safeError(response);
        const responseBody = await response.json() as { application?: unknown };
        const parsed = parseMerchantApplication(responseBody.application, uid);
        for (const listener of listeners) listener(parsed);
      } catch (error) {
        if (error instanceof SafeMerchantError) throw error;
        throw new SafeMerchantError("merchant/write-failed");
      }
    },
  };
}

function mockApplication(uid: string, status: MerchantApplication["status"], reason?: string): MerchantApplication {
  return { ownerId: uid, shop: { name: "TEST Shop", area: "TEST Area", address: "TEST Address", whatsapp: "963911111111" }, status, submittedAt: "2026-11-03T00:00:00.000Z", version: 1, ...(status === "rejected" && reason ? { rejectionReason: reason } : {}) };
}
function testAdapter(config: MerchantTestConfig): MerchantApplicationAdapter {
  const events = (window.__SA3ERLI_MERCHANT_TEST_EVENTS__ ??= []); const listeners = new Set<(value: MerchantApplication | null) => void>();
  return { available: true, subscribe(uid, listener) { listeners.add(listener); const timer = window.setTimeout(() => listener(config.status && config.status !== "none" ? mockApplication(uid, config.status, config.rejectionReason) : null), 0); return () => { clearTimeout(timer); listeners.delete(listener); }; }, async submit(uid) { const current = window.__SA3ERLI_MERCHANT_TEST__ ?? config; events.push("api-application", "api-document"); if (current.submit === "document-failure") throw new SafeMerchantError("merchant/document-failed"); if (current.submitDelayMs) await new Promise((resolve) => window.setTimeout(resolve, current.submitDelayMs)); if (current.submit === "duplicate") throw new SafeMerchantError("merchant/duplicate"); if (current.submit === "write-failure") throw new SafeMerchantError("merchant/write-failed"); events.push("api-commit"); const pending = mockApplication(uid, "pending"); for (const listener of listeners) listener(pending); } };
}

export function createMerchantApplicationAdapter(): MerchantApplicationAdapter {
  const test = typeof window !== "undefined" && ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname) ? window.__SA3ERLI_MERCHANT_TEST__ : undefined;
  if (test?.enabled) return test.unavailable ? unavailableAdapter() : testAdapter(test);
  return apiAdapter();
}
