import type { SafeIdentity, TokenVerifier } from "../../src/auth/auth.types";
import { TokenVerificationError } from "../../src/auth/auth.types";
import type { BackendConfig } from "../../src/config/backend-config";

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

export function testConfig(overrides: Partial<BackendConfig> = {}): BackendConfig {
  return {
    environment: "test",
    port: 4100,
    apiPrefix: "api/v1",
    firebaseProjectId: "demo-sa3erli-sprint05",
    firebaseAuthEmulatorHost: "127.0.0.1:9099",
    emulatorMode: true,
    corsAllowlist: ["http://localhost:4000"],
    requestBodyLimit: "1kb",
    rateLimitWindowMs: 60_000,
    rateLimitMax: 100,
    ...overrides,
  };
}
