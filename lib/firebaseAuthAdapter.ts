import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase";
import {
  SafeAuthError,
  type AuthAdapter,
  type AuthUser,
} from "@/lib/auth";

type AuthTestConfig = {
  enabled: true;
  unavailable?: boolean;
  initialUser?: AuthUser | null;
  listenerDelayMs?: number;
  google?: "success" | "cancel" | "failure" | "collision";
  verifyOnReload?: boolean;
};

declare global {
  interface Window {
    __SA3ERLI_AUTH_TEST__?: AuthTestConfig;
    __SA3ERLI_AUTH_TEST_EVENTS__?: string[];
  }
}

const TEST_SESSION_KEY = "sa3erli-auth-e2e-session";

function mapFirebaseUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    providerIds: user.providerData.map((provider) => provider.providerId),
  };
}

function createUnavailableAdapter(): AuthAdapter {
  const unavailable = async () => {
    throw new SafeAuthError("auth/unavailable");
  };
  return {
    available: false,
    subscribe(listener) {
      queueMicrotask(() => listener(null));
      return () => {};
    },
    register: unavailable,
    login: unavailable,
    signInWithGoogle: unavailable,
    logout: unavailable,
    sendPasswordReset: unavailable,
    sendVerification: unavailable,
    reloadUser: unavailable,
  };
}

function createFirebaseAdapter(): AuthAdapter {
  const app = getFirebaseApp();
  if (!app) return createUnavailableAdapter();
  const auth = getAuth(app);
  const persistenceReady = setPersistence(auth, browserLocalPersistence);

  return {
    available: true,
    subscribe(listener) {
      let active = true;
      let unsubscribe = () => {};
      void persistenceReady
        .then(() => {
          if (!active) return;
          unsubscribe = onAuthStateChanged(auth, (user) => {
            listener(user ? mapFirebaseUser(user) : null);
          });
        })
        .catch(() => {
          if (active) listener(null);
        });
      return () => {
        active = false;
        unsubscribe();
      };
    },
    async register(email, password) {
      await persistenceReady;
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(credential.user);
      return mapFirebaseUser(credential.user);
    },
    async login(email, password) {
      await persistenceReady;
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return mapFirebaseUser(credential.user);
    },
    async signInWithGoogle() {
      await persistenceReady;
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(auth, provider);
      return mapFirebaseUser(credential.user);
    },
    async logout() {
      await signOut(auth);
    },
    async sendPasswordReset(email) {
      await sendPasswordResetEmail(auth, email);
    },
    async sendVerification() {
      if (!auth.currentUser) throw new SafeAuthError("auth/invalid-credential");
      await sendEmailVerification(auth.currentUser);
    },
    async reloadUser() {
      if (!auth.currentUser) return null;
      await auth.currentUser.reload();
      return mapFirebaseUser(auth.currentUser);
    },
  };
}

function isLoopback(): boolean {
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function createTestAdapter(config: AuthTestConfig): AuthAdapter {
  const listeners = new Set<(user: AuthUser | null) => void>();
  const events = (window.__SA3ERLI_AUTH_TEST_EVENTS__ ??= []);

  function readUser(): AuthUser | null {
    const stored = window.localStorage.getItem(TEST_SESSION_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as AuthUser;
      } catch {
        window.localStorage.removeItem(TEST_SESSION_KEY);
      }
    }
    return config.initialUser ?? null;
  }

  function saveUser(user: AuthUser | null) {
    if (user) window.localStorage.setItem(TEST_SESSION_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(TEST_SESSION_KEY);
    for (const listener of listeners) listener(user);
  }

  function userFor(email: string, verified: boolean, providerId: string): AuthUser {
    return {
      uid: `test-${providerId}-${email}`,
      email,
      displayName: providerId === "google.com" ? "TEST Google User" : null,
      emailVerified: verified,
      providerIds: [providerId],
    };
  }

  return {
    available: true,
    subscribe(listener) {
      listeners.add(listener);
      const timeout = window.setTimeout(
        () => listener(readUser()),
        config.listenerDelayMs ?? 0,
      );
      return () => {
        window.clearTimeout(timeout);
        listeners.delete(listener);
      };
    },
    async register(email) {
      events.push("register");
      if (email === "existing@example.com") {
        throw new SafeAuthError("auth/email-already-in-use");
      }
      const user = userFor(email, false, "password");
      saveUser(user);
      events.push("verification-sent");
      return user;
    },
    async login(email, password) {
      events.push("login");
      if (password === "wrong-password") {
        throw new SafeAuthError("auth/invalid-credential");
      }
      const user = userFor(email, !email.startsWith("unverified"), "password");
      saveUser(user);
      return user;
    },
    async signInWithGoogle() {
      events.push("google");
      const googleScenario = window.__SA3ERLI_AUTH_TEST__?.google ?? config.google;
      if (googleScenario === "cancel") {
        throw new SafeAuthError("auth/popup-closed-by-user");
      }
      if (googleScenario === "failure") {
        throw new SafeAuthError("auth/network-request-failed");
      }
      if (googleScenario === "collision") {
        throw new SafeAuthError("auth/account-exists-with-different-credential");
      }
      const user = userFor("google@example.com", true, "google.com");
      saveUser(user);
      return user;
    },
    async logout() {
      events.push("logout");
      saveUser(null);
    },
    async sendPasswordReset() {
      events.push("password-reset");
    },
    async sendVerification() {
      events.push("verification-sent");
    },
    async reloadUser() {
      events.push("reload");
      const user = readUser();
      if (!user) return null;
      const nextUser = config.verifyOnReload
        ? { ...user, emailVerified: true }
        : user;
      saveUser(nextUser);
      return nextUser;
    },
  };
}

export function createAuthAdapter(): AuthAdapter {
  if (
    typeof window !== "undefined" &&
    isLoopback() &&
    window.__SA3ERLI_AUTH_TEST__?.enabled
  ) {
    if (window.__SA3ERLI_AUTH_TEST__.unavailable) return createUnavailableAdapter();
    return createTestAdapter(window.__SA3ERLI_AUTH_TEST__);
  }
  return createFirebaseAdapter();
}
