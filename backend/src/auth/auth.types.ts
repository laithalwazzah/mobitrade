export interface SafeIdentity {
  readonly uid: string;
  readonly email: string | null;
  readonly emailVerified: boolean;
  readonly admin: boolean;
  readonly providerIds: readonly string[];
}

export interface TokenVerifier {
  verifyIdToken(token: string): Promise<SafeIdentity>;
  readiness(): { ready: boolean; mode: "emulator" | "adc" };
}

export class TokenVerificationError extends Error {
  constructor(
    readonly code: "invalid" | "expired" | "revoked" | "unavailable",
  ) {
    super(code);
    this.name = "TokenVerificationError";
  }
}

export const TOKEN_VERIFIER = Symbol("TOKEN_VERIFIER");
