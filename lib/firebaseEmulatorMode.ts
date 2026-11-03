export const FIREBASE_EMULATOR_PROJECT_ID = "demo-sa3erli-sprint04";
export const FIRESTORE_EMULATOR_HOST = "127.0.0.1";
export const FIRESTORE_EMULATOR_PORT = 8080;
export const AUTH_EMULATOR_URL = "http://127.0.0.1:9099";

export type FirebaseRuntimeTarget = "live" | "emulator" | "blocked";

export function isLoopbackHostname(hostname: string): boolean {
  return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname.toLowerCase());
}

export function resolveFirebaseRuntimeTarget(emulatorFlag: string | undefined, hostname: string): FirebaseRuntimeTarget {
  if (emulatorFlag !== "1") return "live";
  return isLoopbackHostname(hostname) ? "emulator" : "blocked";
}

export function getFirebaseRuntimeTarget(): FirebaseRuntimeTarget {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_MODE === "1" ? "blocked" : "live";
  return resolveFirebaseRuntimeTarget(process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_MODE, window.location.hostname);
}

export function isFirebaseEmulatorModeActive(): boolean {
  return getFirebaseRuntimeTarget() === "emulator";
}
