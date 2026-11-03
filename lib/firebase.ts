import {
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  AUTH_EMULATOR_URL,
  FIREBASE_EMULATOR_PROJECT_ID,
  FIRESTORE_EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
  getFirebaseRuntimeTarget,
} from "@/lib/firebaseEmulatorMode";

let firebaseApp: FirebaseApp | null | undefined;
let firestore: Firestore | null | undefined;
let auth: Auth | null | undefined;
let firestoreEmulatorConnected = false;
let authEmulatorConnected = false;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (firebaseApp !== undefined) return firebaseApp;

  const runtimeTarget = getFirebaseRuntimeTarget();
  if (runtimeTarget === "blocked") {
    firebaseApp = null;
    return firebaseApp;
  }

  const config: FirebaseOptions = runtimeTarget === "emulator"
    ? {
        apiKey: "demo-api-key",
        authDomain: `${FIREBASE_EMULATOR_PROJECT_ID}.localhost`,
        projectId: FIREBASE_EMULATOR_PROJECT_ID,
        appId: "demo-app-id",
      }
    : {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

  if (Object.values(config).some((value) => !value)) {
    firebaseApp = null;
    return firebaseApp;
  }

  const appName = runtimeTarget === "emulator" ? "sprint04-local-emulator" : "[DEFAULT]";
  firebaseApp =
    getApps().find((existingApp) => existingApp.name === appName) ??
    (runtimeTarget === "emulator" ? initializeApp(config, appName) : initializeApp(config));
  return firebaseApp;
}

export function getFirebaseFirestore(): Firestore | null {
  if (typeof window === "undefined") return null;
  if (firestore !== undefined) return firestore;
  const app = getFirebaseApp();
  if (!app) {
    firestore = null;
    return firestore;
  }
  firestore = getFirestore(app);
  if (getFirebaseRuntimeTarget() === "emulator" && !firestoreEmulatorConnected) {
    connectFirestoreEmulator(firestore, FIRESTORE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
    firestoreEmulatorConnected = true;
  }
  return firestore;
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  if (auth !== undefined) return auth;
  const app = getFirebaseApp();
  if (!app) {
    auth = null;
    return auth;
  }
  auth = getAuth(app);
  if (getFirebaseRuntimeTarget() === "emulator" && !authEmulatorConnected) {
    connectAuthEmulator(auth, AUTH_EMULATOR_URL, { disableWarnings: true });
    authEmulatorConnected = true;
  }
  return auth;
}
