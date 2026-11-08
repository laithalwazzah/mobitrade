import type { SafeIdentity, TokenVerifier } from "../../src/auth/auth.types";
import { TokenVerificationError } from "../../src/auth/auth.types";
import type { BackendConfig } from "../../src/config/backend-config";
import type { CreateMerchantRecord, ListMerchantApplicationsQuery, MerchantApplicationsRepository } from "../../src/merchant/merchant.repository";
import { MerchantDomainError, type MerchantApplication, type MerchantApplicationSummary, type MerchantDecision, type MerchantDocument } from "../../src/merchant/merchant.types";
import { decodePageToken, encodePageToken } from "../../src/merchant/merchant.validation";

export const identities = {
  unverified: {
    uid: "user-unverified",
    email: "unverified@example.test",
    emailVerified: false,
    admin: false,
    providerIds: ["password"],
  },
  user: {
    uid: "user-normal",
    email: "owner@example.test",
    emailVerified: true,
    admin: false,
    providerIds: ["password"],
  },
  admin: {
    uid: "user-admin",
    email: "admin@example.test",
    emailVerified: true,
    admin: true,
    providerIds: ["password", "google.com"],
  },
} satisfies Record<string, SafeIdentity>;

export class FakeTokenVerifier implements TokenVerifier {
  readonly attempts: string[] = [];
  ready = true;

  async verifyIdToken(token: string): Promise<SafeIdentity> {
    this.attempts.push(token);
    if (token === "expired") throw new TokenVerificationError("expired");
    if (token === "revoked") throw new TokenVerificationError("revoked");
    if (token === "unavailable") throw new TokenVerificationError("unavailable");
    if (token === "unverified") return identities.unverified;
    if (token === "user") return identities.user;
    if (token === "admin") return identities.admin;
    throw new TokenVerificationError("invalid");
  }

  readiness(): { ready: boolean; mode: "emulator" } {
    return { ready: this.ready, mode: "emulator" };
  }
}

export class FakeMerchantRepository implements MerchantApplicationsRepository {
  readonly applications = new Map<string, MerchantApplication>();
  readonly documents = new Map<string, MerchantDocument>();
  readonly audits: Array<Record<string, unknown>> = [];
  failNextCreate = false;
  summaryUnavailable = false;
  summaryState: MerchantApplicationSummary = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    version: 1,
    updatedAt: "2026-11-07T00:00:00.000Z",
  };

  async create(ownerId: string, record: CreateMerchantRecord): Promise<MerchantApplication> {
    if (this.failNextCreate) { this.failNextCreate = false; throw new Error("simulated storage failure"); }
    const hasApplication = this.applications.has(ownerId);
    const hasDocument = this.documents.has(ownerId);
    if (hasApplication && hasDocument) throw new MerchantDomainError("duplicate");
    if (hasApplication || hasDocument) throw new MerchantDomainError("inconsistent-record");
    const submittedAt = new Date().toISOString();
    const application: MerchantApplication = { ownerId, shop: record.shop, status: "pending", submittedAt, version: 1 };
    const document: MerchantDocument = { ...record.document, createdAt: submittedAt };
    this.applications.set(ownerId, application);
    this.documents.set(ownerId, document);
    this.summaryState = {
      ...this.summaryState,
      total: this.summaryState.total + 1,
      pending: this.summaryState.pending + 1,
      version: this.summaryState.version + 1,
      updatedAt: submittedAt,
    };
    return application;
  }

  async findByOwner(ownerId: string) { return this.applications.get(ownerId) ?? null; }
  async findById(ownerId: string) { return this.applications.get(ownerId) ?? null; }
  async getDocument(ownerId: string) { return this.documents.get(ownerId) ?? null; }

  async list(query: ListMerchantApplicationsQuery) {
    const cursor = decodePageToken(query.pageToken);
    if (query.pageToken && !cursor) throw new MerchantDomainError("invalid-page-token");
    let items = [...this.applications.values()]
      .filter((item) => !query.status || item.status === query.status)
      .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt) || right.ownerId.localeCompare(left.ownerId));
    if (cursor) items = items.filter((item) => item.submittedAt < cursor.submittedAt || (item.submittedAt === cursor.submittedAt && item.ownerId < cursor.uid));
    const page = items.slice(0, query.limit);
    const last = page.at(-1);
    return {
      items: page.map((item) => ({
        ownerId: item.ownerId,
        shop: { name: item.shop.name, area: item.shop.area },
        status: item.status,
        submittedAt: item.submittedAt,
        version: item.version,
      })),
      nextPageToken: items.length > query.limit && last ? encodePageToken({ submittedAt: last.submittedAt, uid: last.ownerId }) : null,
    };
  }

  async summary() {
    if (this.summaryUnavailable) throw new MerchantDomainError("summary-unavailable");
    return this.summaryState;
  }

  async decide(ownerId: string, reviewerId: string, decision: MerchantDecision) {
    const current = this.applications.get(ownerId);
    if (!current) throw new MerchantDomainError("not-found");
    if (current.status !== "pending") throw new MerchantDomainError("not-pending");
    if (current.version !== decision.expectedVersion) throw new MerchantDomainError("version-conflict");
    const reviewedAt = new Date().toISOString();
    const next: MerchantApplication = { ...current, status: decision.decision, reviewerId, reviewedAt, version: current.version + 1, ...(decision.decision === "rejected" ? { rejectionReason: decision.reason } : {}) };
    this.applications.set(ownerId, next);
    this.audits.push({ applicationId: ownerId, reviewerId, fromStatus: "pending", toStatus: decision.decision, fromVersion: current.version, toVersion: next.version });
    this.summaryState = {
      ...this.summaryState,
      pending: this.summaryState.pending - 1,
      [decision.decision]: this.summaryState[decision.decision] + 1,
      version: this.summaryState.version + 1,
      updatedAt: reviewedAt,
    };
    return next;
  }
}

export function testConfig(overrides: Partial<BackendConfig> = {}): BackendConfig {
  return {
    environment: "test",
    port: 4100,
    apiPrefix: "api/v1",
    firebaseProjectId: "demo-sa3erli-sprint05",
    firebaseAuthEmulatorHost: "127.0.0.1:9099",
    firebaseFirestoreEmulatorHost: "127.0.0.1:8080",
    emulatorMode: true,
    corsAllowlist: ["http://localhost:4000"],
    requestBodyLimit: "1kb",
    rateLimitWindowMs: 60_000,
    rateLimitMax: 100,
    ...overrides,
  };
}
