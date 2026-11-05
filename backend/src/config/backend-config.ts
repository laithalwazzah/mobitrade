export type RuntimeEnvironment = "development" | "test" | "production";

export interface BackendConfig {
  readonly environment: RuntimeEnvironment;
  readonly port: number;
  readonly apiPrefix: "api/v1";
  readonly firebaseProjectId: string;
  readonly firebaseAuthEmulatorHost: string | null;
  readonly firebaseFirestoreEmulatorHost: string | null;
  readonly emulatorMode: boolean;
  readonly corsAllowlist: readonly string[];
  readonly requestBodyLimit: string;
  readonly rateLimitWindowMs: number;
  readonly rateLimitMax: number;
}

const LOOPBACK_HOST = /^(localhost|127\.0\.0\.1|\[::1\]):([1-9][0-9]{0,4})$/;
const PROJECT_ID = /^[a-z][a-z0-9-]{4,29}$/;

function integer(
  value: string | undefined,
  fallback: number,
  name: string,
  minimum: number,
  maximum: number,
): number {
  const parsed = value === undefined || value === "" ? fallback : Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
  }
  return parsed;
}

function parseEnvironment(value: string | undefined): RuntimeEnvironment {
  const environment = value ?? "development";
  if (environment !== "development" && environment !== "test" && environment !== "production") {
    throw new Error("NODE_ENV must be development, test, or production");
  }
  return environment;
}

function parseAllowlist(value: string | undefined, environment: RuntimeEnvironment): string[] {
  const entries = (value ?? (environment === "production" ? "" : "http://localhost:4000"))
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (entries.length === 0) {
    throw new Error("CORS_ALLOWLIST must contain at least one exact origin");
  }

  for (const entry of entries) {
    let url: URL;
    try {
      url = new URL(entry);
    } catch {
      throw new Error("CORS_ALLOWLIST contains an invalid origin");
    }
    if ((url.protocol !== "http:" && url.protocol !== "https:") || url.origin !== entry || entry.includes("*")) {
      throw new Error("CORS_ALLOWLIST must contain exact HTTP(S) origins without wildcards or paths");
    }
  }
  return [...new Set(entries)];
}

export function loadBackendConfig(env: NodeJS.ProcessEnv = process.env): BackendConfig {
  const environment = parseEnvironment(env.NODE_ENV);
  const emulatorMode = env.BACKEND_EMULATOR_MODE === "1";
  const firebaseProjectId = env.FIREBASE_PROJECT_ID?.trim() ?? "";
  const emulatorHost = env.FIREBASE_AUTH_EMULATOR_HOST?.trim() || null;
  const firestoreEmulatorHost = env.FIRESTORE_EMULATOR_HOST?.trim() || null;

  if (!PROJECT_ID.test(firebaseProjectId)) {
    throw new Error("FIREBASE_PROJECT_ID is required and must be a valid project id");
  }
  if (emulatorMode) {
    if (!firebaseProjectId.startsWith("demo-")) {
      throw new Error("Emulator mode requires a demo-* Firebase project id");
    }
    if (!emulatorHost || !LOOPBACK_HOST.test(emulatorHost)) {
      throw new Error("Emulator mode requires a loopback FIREBASE_AUTH_EMULATOR_HOST");
    }
    if (!firestoreEmulatorHost || !LOOPBACK_HOST.test(firestoreEmulatorHost)) {
      throw new Error("Emulator mode requires a loopback FIRESTORE_EMULATOR_HOST");
    }
  } else if (emulatorHost || firestoreEmulatorHost) {
    throw new Error("Firebase emulator hosts are forbidden unless BACKEND_EMULATOR_MODE=1");
  }

  return {
    environment,
    port: integer(env.PORT, 4100, "PORT", 1024, 65535),
    apiPrefix: "api/v1",
    firebaseProjectId,
    firebaseAuthEmulatorHost: emulatorHost,
    firebaseFirestoreEmulatorHost: firestoreEmulatorHost,
    emulatorMode,
    corsAllowlist: parseAllowlist(env.CORS_ALLOWLIST, environment),
    requestBodyLimit: env.REQUEST_BODY_LIMIT?.trim() || "64kb",
    rateLimitWindowMs: integer(env.RATE_LIMIT_WINDOW_MS, 60_000, "RATE_LIMIT_WINDOW_MS", 100, 3_600_000),
    rateLimitMax: integer(env.RATE_LIMIT_MAX, 100, "RATE_LIMIT_MAX", 1, 10_000),
  };
}
