import {
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

let firebaseApp: FirebaseApp | null | undefined;
let firestore: Firestore | null | undefined;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (firebaseApp !== undefined) return firebaseApp;

  const config: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (Object.values(config).some((value) => !value)) {
    firebaseApp = null;
    return firebaseApp;
  }

  firebaseApp =
    getApps().find((existingApp) => existingApp.name === "[DEFAULT]") ??
    initializeApp(config);
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
  return firestore;
}
