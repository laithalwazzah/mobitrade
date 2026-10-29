import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

let firestore: Firestore | null | undefined;

export function getFirebaseFirestore(): Firestore | null {
  if (typeof window === "undefined") return null;
  if (firestore !== undefined) return firestore;

  const config: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (Object.values(config).some((value) => !value)) {
    firestore = null;
    return firestore;
  }

  const app =
    getApps().find((existingApp) => existingApp.name === "[DEFAULT]") ??
    initializeApp(config);
  firestore = getFirestore(app);
  return firestore;
}
