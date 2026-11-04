import { Injectable } from "@nestjs/common";
import { applicationDefault, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { BackendConfig } from "../config/backend-config";
import {
  type SafeIdentity,
  type TokenVerifier,
  TokenVerificationError,
} from "../auth/auth.types";

function mapVerificationError(error: unknown): TokenVerificationError {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : "";
  if (code === "auth/id-token-expired") return new TokenVerificationError("expired");
  if (code === "auth/id-token-revoked") return new TokenVerificationError("revoked");
  if (code === "auth/internal-error" || code === "app/network-error") {
    return new TokenVerificationError("unavailable");
  }
  return new TokenVerificationError("invalid");
}

@Injectable()
export class FirebaseAdminTokenVerifier implements TokenVerifier {
  private readonly app: App;

  constructor(private readonly config: BackendConfig) {
    if (config.emulatorMode && config.firebaseAuthEmulatorHost) {
      process.env.FIREBASE_AUTH_EMULATOR_HOST = config.firebaseAuthEmulatorHost;
    }
    this.app = getApps().length > 0
      ? getApp()
      : initializeApp(
          config.emulatorMode
            ? { projectId: config.firebaseProjectId }
            : { credential: applicationDefault(), projectId: config.firebaseProjectId },
        );
  }

  async verifyIdToken(token: string): Promise<SafeIdentity> {
    try {
      const decoded = await getAuth(this.app).verifyIdToken(token, true);
      return {
        uid: decoded.uid,
        email: typeof decoded.email === "string" ? decoded.email : null,
        emailVerified: decoded.email_verified === true,
        admin: decoded.admin === true,
        providerIds: Object.keys(decoded.firebase?.identities ?? {}).sort(),
      };
    } catch (error) {
      throw mapVerificationError(error);
    }
  }

  readiness(): { ready: boolean; mode: "emulator" | "adc" } {
    return { ready: true, mode: this.config.emulatorMode ? "emulator" : "adc" };
  }
}
