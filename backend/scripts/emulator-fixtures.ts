import { getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export const EMULATOR_PROJECT_ID = "demo-sa3erli-sprint05";
export const DUMMY_PASSWORD = "Sprint05-Dummy-Only!";
export const fixtureAccounts = {
  unverified: { email: "unverified-owner@example.test", emailVerified: false, admin: false },
  owner: { email: "verified-owner@example.test", emailVerified: true, admin: false },
  admin: { email: "admin-reviewer@example.test", emailVerified: true, admin: true },
} as const;

interface IdentityResponse {
  localId: string;
  idToken: string;
}

export function requireSafeEmulatorEnvironment(env: NodeJS.ProcessEnv = process.env): string {
  if (env.BACKEND_EMULATOR_MODE !== "1") throw new Error("BACKEND_EMULATOR_MODE=1 is required");
  if (env.FIREBASE_PROJECT_ID !== EMULATOR_PROJECT_ID) throw new Error("Only the Sprint 05 demo project is allowed");
  const host = env.FIREBASE_AUTH_EMULATOR_HOST ?? "";
  if (!/^(127\.0\.0\.1|localhost|\[::1\]):9099$/.test(host)) {
    throw new Error("Only the loopback Auth Emulator on port 9099 is allowed");
  }
  return host;
}

async function identityRequest(host: string, action: string, body: Record<string, unknown>): Promise<IdentityResponse> {
  const response = await fetch(`http://${host}/identitytoolkit.googleapis.com/v1/accounts:${action}?key=demo-key`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Auth Emulator fixture request failed (${response.status})`);
  return await response.json() as IdentityResponse;
}

export async function resetAuthEmulator(env: NodeJS.ProcessEnv = process.env): Promise<void> {
  const host = requireSafeEmulatorEnvironment(env);
  const response = await fetch(`http://${host}/emulator/v1/projects/${EMULATOR_PROJECT_ID}/accounts`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Auth Emulator reset failed (${response.status})`);
}

export async function seedAuthEmulator(env: NodeJS.ProcessEnv = process.env) {
  const host = requireSafeEmulatorEnvironment(env);
  process.env.FIREBASE_AUTH_EMULATOR_HOST = host;
  const app = getApps().length > 0 ? getApp() : initializeApp({ projectId: EMULATOR_PROJECT_ID });
  const auth = getAuth(app);
  const result: Record<keyof typeof fixtureAccounts, { uid: string; idToken: string }> = {} as Record<
    keyof typeof fixtureAccounts,
    { uid: string; idToken: string }
  >;

  for (const [name, fixture] of Object.entries(fixtureAccounts) as Array<
    [keyof typeof fixtureAccounts, (typeof fixtureAccounts)[keyof typeof fixtureAccounts]]
  >) {
    const created = await identityRequest(host, "signUp", {
      email: fixture.email,
      password: DUMMY_PASSWORD,
      returnSecureToken: true,
    });
    await auth.updateUser(created.localId, { emailVerified: fixture.emailVerified });
    if (fixture.admin) await auth.setCustomUserClaims(created.localId, { admin: true });
    const signedIn = await identityRequest(host, "signInWithPassword", {
      email: fixture.email,
      password: DUMMY_PASSWORD,
      returnSecureToken: true,
    });
    result[name] = { uid: created.localId, idToken: signedIn.idToken };
  }
  return result;
}
