import { resolveBackendApiBase } from "@/lib/backendApi";
import { getFirebaseAuth } from "@/lib/firebase";

export type AdminApplicationStatus = "pending" | "approved" | "rejected";

export type AdminIdentity = {
  uid: string;
  email: string;
  emailVerified: boolean;
  providerIds: string[];
  admin: boolean;
};

export type AdminSummary = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  version: number;
  updatedAt: string;
};

export type AdminApplicationListItem = {
  ownerId: string;
  shop: { name: string; area: string };
  status: AdminApplicationStatus;
  submittedAt: string;
  version: number;
};

export type AdminApplicationDetail = AdminApplicationListItem & {
  shop: { name: string; area: string; address: string; whatsapp: string };
  reviewedAt?: string;
  reviewerId?: string;
  rejectionReason?: string;
};

export type AdminListResponse = {
  items: AdminApplicationListItem[];
  nextPageToken: string | null;
};

export class AdminApiError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    readonly correlationId: string | null = null,
  ) {
    super(code);
    this.name = "AdminApiError";
  }
}

export type AdminApiAdapter = {
  readonly available: boolean;
  identity(signal?: AbortSignal): Promise<AdminIdentity>;
  summary(signal?: AbortSignal): Promise<AdminSummary>;
  list(query: { status?: AdminApplicationStatus; limit: number; pageToken?: string }, signal?: AbortSignal): Promise<AdminListResponse>;
  detail(ownerId: string, signal?: AbortSignal): Promise<AdminApplicationDetail>;
  document(ownerId: string, signal?: AbortSignal): Promise<{ blob: Blob; fileName: string }>;
  decide(ownerId: string, input: { decision: "approved" | "rejected"; expectedVersion: number; reason?: string }, signal?: AbortSignal): Promise<AdminApplicationDetail>;
};

type RecordValue = Record<string, unknown>;

function object(value: unknown): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new AdminApiError("response/invalid", 502);
  return value as RecordValue;
}

function string(value: unknown): string {
  if (typeof value !== "string" || !value) throw new AdminApiError("response/invalid", 502);
  return value;
}

function iso(value: unknown): string {
  const parsed = string(value);
  if (Number.isNaN(Date.parse(parsed))) throw new AdminApiError("response/invalid", 502);
  return parsed;
}

function integer(value: unknown, minimum = 0): number {
  if (!Number.isInteger(value) || (value as number) < minimum) throw new AdminApiError("response/invalid", 502);
  return value as number;
}

function status(value: unknown): AdminApplicationStatus {
  if (value !== "pending" && value !== "approved" && value !== "rejected") throw new AdminApiError("response/invalid", 502);
  return value;
}

function rejectSensitiveKeys(value: unknown): void {
  const serialized = JSON.stringify(value).toLowerCase();
  for (const forbidden of ["bytes", "base64", "documentmetadata", "filebody", "token"]) {
    if (serialized.includes(`\"${forbidden}`)) throw new AdminApiError("response/private-data", 502);
  }
}

export function parseAdminIdentity(value: unknown): AdminIdentity {
  rejectSensitiveKeys(value);
  const root = object(value);
  const user = object(root.user);
  const claims = object(root.claims);
  if (!Array.isArray(user.providerIds) || user.providerIds.some((item) => typeof item !== "string")) throw new AdminApiError("response/invalid", 502);
  return {
    uid: string(user.uid),
    email: string(user.email),
    emailVerified: user.emailVerified === true,
    providerIds: [...user.providerIds] as string[],
    admin: claims.admin === true,
  };
}

export function parseAdminSummary(value: unknown): AdminSummary {
  rejectSensitiveKeys(value);
  const summary = object(object(value).summary);
  const parsed = {
    total: integer(summary.total),
    pending: integer(summary.pending),
    approved: integer(summary.approved),
    rejected: integer(summary.rejected),
    version: integer(summary.version, 1),
    updatedAt: iso(summary.updatedAt),
  };
  if (parsed.total !== parsed.pending + parsed.approved + parsed.rejected) throw new AdminApiError("response/invalid", 502);
  return parsed;
}

function parseListItem(value: unknown): AdminApplicationListItem {
  const item = object(value);
  const shop = object(item.shop);
  const allowed = ["ownerId", "shop", "status", "submittedAt", "version"];
  if (Object.keys(item).some((key) => !allowed.includes(key)) || Object.keys(shop).some((key) => !["name", "area"].includes(key))) {
    throw new AdminApiError("response/private-data", 502);
  }
  return {
    ownerId: string(item.ownerId),
    shop: { name: string(shop.name), area: string(shop.area) },
    status: status(item.status),
    submittedAt: iso(item.submittedAt),
    version: integer(item.version, 1),
  };
}

export function parseAdminList(value: unknown): AdminListResponse {
  rejectSensitiveKeys(value);
  const root = object(value);
  if (!Array.isArray(root.items)) throw new AdminApiError("response/invalid", 502);
  if (root.nextPageToken !== null && typeof root.nextPageToken !== "string") throw new AdminApiError("response/invalid", 502);
  return { items: root.items.map(parseListItem), nextPageToken: root.nextPageToken as string | null };
}

export function parseAdminDetail(value: unknown): AdminApplicationDetail {
  rejectSensitiveKeys(value);
  const item = object(object(value).application);
  const shop = object(item.shop);
  const detail: AdminApplicationDetail = {
    ownerId: string(item.ownerId),
    shop: {
      name: string(shop.name),
      area: string(shop.area),
      address: string(shop.address),
      whatsapp: string(shop.whatsapp),
    },
    status: status(item.status),
    submittedAt: iso(item.submittedAt),
    version: integer(item.version, 1),
  };
  if (typeof item.reviewedAt === "string") detail.reviewedAt = iso(item.reviewedAt);
  if (typeof item.reviewerId === "string") detail.reviewerId = item.reviewerId;
  if (detail.status === "rejected" && typeof item.rejectionReason === "string") detail.rejectionReason = item.rejectionReason;
  return detail;
}

function safeFileName(header: string | null): string {
  const match = header?.match(/filename="?([^";]+)"?/i);
  const candidate = match?.[1]?.replace(/[^A-Za-z0-9._-]/g, "-");
  return candidate || "commercial-record";
}

async function parseError(response: Response): Promise<AdminApiError> {
  try {
    const body = object(await response.clone().json());
    const error = object(body.error);
    return new AdminApiError(
      typeof error.code === "string" ? error.code : "request/failed",
      response.status,
      typeof error.correlationId === "string" ? error.correlationId : null,
    );
  } catch {
    return new AdminApiError("request/failed", response.status);
  }
}

function isLoopback(): boolean {
  return typeof window !== "undefined" && ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

type AdminTestConfig = {
  enabled: true;
  role: "admin" | "user";
  summary?: "success" | "error";
  list?: "success" | "empty" | "error";
  detail?: AdminApplicationDetail;
};

declare global {
  interface Window {
    __SA3ERLI_ADMIN_TEST__?: AdminTestConfig;
    __SA3ERLI_ADMIN_TEST_EVENTS__?: string[];
  }
}

const testItems: AdminApplicationListItem[] = [
  { ownerId: "test-pending-1", shop: { name: "TEST محل أول", area: "اللاذقية" }, status: "pending", submittedAt: "2026-11-07T10:00:00.000Z", version: 1 },
  { ownerId: "test-approved-1", shop: { name: "TEST محل معتمد", area: "الرمل" }, status: "approved", submittedAt: "2026-11-06T10:00:00.000Z", version: 2 },
];

function testAdapter(config: AdminTestConfig): AdminApiAdapter {
  const events = (window.__SA3ERLI_ADMIN_TEST_EVENTS__ ??= []);
  const detail = config.detail ?? {
    ...testItems[0],
    shop: { ...testItems[0].shop, address: "TEST Address", whatsapp: "963911111111" },
  };
  return {
    available: true,
    async identity() {
      events.push("identity");
      return { uid: "test-admin", email: "admin@example.test", emailVerified: true, providerIds: ["password"], admin: config.role === "admin" };
    },
    async summary() {
      events.push("summary");
      if (config.summary === "error") throw new AdminApiError("admin/summary-unavailable", 503, "test-correlation");
      return { total: 7, pending: 3, approved: 2, rejected: 2, version: 4, updatedAt: "2026-11-07T12:00:00.000Z" };
    },
    async list() {
      events.push("list");
      if (config.list === "error") throw new AdminApiError("request/failed", 503, "test-correlation");
      return { items: config.list === "empty" ? [] : testItems, nextPageToken: null };
    },
    async detail() { events.push("detail"); return detail; },
    async document() { events.push("document"); return { blob: new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: "image/png" }), fileName: "commercial-record.png" }; },
    async decide(_ownerId, input) {
      events.push(`decision:${input.decision}:${input.reason ?? ""}`);
      return { ...detail, status: input.decision, version: detail.version + 1, ...(input.decision === "rejected" ? { rejectionReason: input.reason } : {}) };
    },
  };
}

function unavailableAdapter(): AdminApiAdapter {
  const unavailable = async (): Promise<never> => { throw new AdminApiError("admin/unavailable", 503); };
  return { available: false, identity: unavailable, summary: unavailable, list: unavailable, detail: unavailable, document: unavailable, decide: unavailable };
}

function productionAdapter(): AdminApiAdapter {
  const apiBase = resolveBackendApiBase();
  const auth = getFirebaseAuth();
  if (!apiBase || !auth) return unavailableAdapter();
  const configuredAuth = auth;

  async function request(path: string, init: RequestInit = {}, signal?: AbortSignal): Promise<Response> {
    const user = configuredAuth.currentUser;
    if (!user?.emailVerified) throw new AdminApiError("auth/verified-email-required", 403);
    const token = await user.getIdToken();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    try {
      const response = await fetch(`${apiBase}${path}`, {
        ...init,
        headers: { ...init.headers, Authorization: `Bearer ${token}` },
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) throw await parseError(response);
      return response;
    } finally {
      window.clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    }
  }

  return {
    available: true,
    async identity(signal) { return parseAdminIdentity(await (await request("/auth/me", {}, signal)).json()); },
    async summary(signal) { return parseAdminSummary(await (await request("/admin/merchant-applications/summary", {}, signal)).json()); },
    async list(query, signal) {
      const params = new URLSearchParams({ limit: String(query.limit) });
      if (query.status) params.set("status", query.status);
      if (query.pageToken) params.set("pageToken", query.pageToken);
      return parseAdminList(await (await request(`/admin/merchant-applications?${params}`, {}, signal)).json());
    },
    async detail(ownerId, signal) { return parseAdminDetail(await (await request(`/admin/merchant-applications/${encodeURIComponent(ownerId)}`, {}, signal)).json()); },
    async document(ownerId, signal) {
      const response = await request(`/admin/merchant-applications/${encodeURIComponent(ownerId)}/document`, {}, signal);
      return { blob: await response.blob(), fileName: safeFileName(response.headers.get("content-disposition")) };
    },
    async decide(ownerId, input, signal) {
      const payload = input.decision === "rejected"
        ? { decision: input.decision, expectedVersion: input.expectedVersion, reason: input.reason }
        : { decision: input.decision, expectedVersion: input.expectedVersion };
      return parseAdminDetail(await (await request(`/admin/merchant-applications/${encodeURIComponent(ownerId)}/decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }, signal)).json());
    },
  };
}

export function createAdminApiAdapter(): AdminApiAdapter {
  const testMode = process.env.NEXT_PUBLIC_ADMIN_TEST_MODE === "1";
  if (testMode && isLoopback() && window.__SA3ERLI_ADMIN_TEST__?.enabled) return testAdapter(window.__SA3ERLI_ADMIN_TEST__);
  return productionAdapter();
}

export function adminErrorMessage(error: unknown): string {
  const code = error instanceof AdminApiError ? error.code : "request/failed";
  if (code === "admin/summary-unavailable") return "تعذر تحميل الملخص الإداري الموثوق الآن.";
  if (code === "auth/admin-required") return "لا تملك صلاحية الوصول إلى لوحة الإدارة.";
  if (code === "merchant/version-conflict" || code === "merchant/not-pending") return "تغيّر الطلب منذ فتحه. تم تحديث البيانات قبل أي قرار جديد.";
  if (code === "rate_limit/exceeded") return "طلبات كثيرة خلال وقت قصير. انتظر قليلاً ثم حاول مجدداً.";
  if (code === "response/private-data" || code === "response/invalid") return "وصلت استجابة غير صالحة، ولم تُعرض أي بيانات حساسة.";
  return "تعذر إكمال الطلب الآن. حاول مجدداً.";
}
