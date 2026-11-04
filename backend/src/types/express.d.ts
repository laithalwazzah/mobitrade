import type { SafeIdentity } from "../auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      auth?: SafeIdentity;
      correlationId?: string;
    }
  }
}

export {};
