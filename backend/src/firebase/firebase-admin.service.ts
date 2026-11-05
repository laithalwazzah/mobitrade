import { Injectable } from "@nestjs/common";
import { applicationDefault, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import type { BackendConfig } from "../config/backend-config";

const APP_NAME = "sa3erli-trusted-backend";

@Injectable()
export class FirebaseAdminService {
  readonly app: App;
  readonly auth: Auth;
  readonly firestore: Firestore;

  constructor(readonly config: BackendConfig) {
    if (config.emulatorMode) {
      process.env.FIREBASE_AUTH_EMULATOR_HOST = config.firebaseAuthEmulatorHost!;
      process.env.FIRESTORE_EMULATOR_HOST = config.firebaseFirestoreEmulatorHost!;
    }
    this.app = getApps().some((candidate) => candidate.name === APP_NAME)
      ? getApp(APP_NAME)
      : initializeApp(
          config.emulatorMode
            ? { projectId: config.firebaseProjectId }
            : { credential: applicationDefault(), projectId: config.firebaseProjectId },
          APP_NAME,
        );
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
  }
}
