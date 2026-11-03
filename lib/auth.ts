export type AuthUser = {
  uid: string;
  email: string;
  displayName: string | null;
  emailVerified: boolean;
  providerIds: string[];
};

export type AuthState =
  | { status: "loading"; user: null }
  | { status: "signed-out"; user: null }
  | { status: "signed-in-unverified"; user: AuthUser }
  | { status: "signed-in-verified"; user: AuthUser };

export type AuthErrorCode =
  | "auth/invalid-email"
  | "auth/weak-password"
  | "auth/email-already-in-use"
  | "auth/account-exists-with-different-credential"
  | "auth/credential-already-in-use"
  | "auth/invalid-credential"
  | "auth/user-disabled"
  | "auth/too-many-requests"
  | "auth/network-request-failed"
  | "auth/popup-closed-by-user"
  | "auth/cancelled-popup-request"
  | "auth/popup-blocked"
  | "auth/operation-not-allowed"
  | "auth/unavailable"
  | "auth/unknown";

export class SafeAuthError extends Error {
  constructor(public readonly code: AuthErrorCode) {
    super(code);
    this.name = "SafeAuthError";
  }
}

export type AuthAdapter = {
  readonly available: boolean;
  subscribe(listener: (user: AuthUser | null) => void): () => void;
  register(email: string, password: string): Promise<AuthUser>;
  login(email: string, password: string): Promise<AuthUser>;
  signInWithGoogle(): Promise<AuthUser>;
  logout(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  sendVerification(): Promise<void>;
  reloadUser(): Promise<AuthUser | null>;
};

export type AuthValidationErrors = {
  email?: string;
  password?: string;
  confirmation?: string;
};

export function authStateFromUser(user: AuthUser | null): AuthState {
  if (!user) return { status: "signed-out", user: null };
  return user.emailVerified
    ? { status: "signed-in-verified", user }
    : { status: "signed-in-unverified", user };
}

export function validateEmail(email: string): string | undefined {
  const value = email.trim();
  if (!value) return "أدخل البريد الإلكتروني.";
  if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "أدخل بريداً إلكترونياً صالحاً.";
  }
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "أدخل كلمة المرور.";
  if (password.length < 8) return "استخدم 8 أحرف على الأقل لكلمة المرور.";
  if (password.length > 128) return "كلمة المرور طويلة جداً.";
}

export function validateLoginInput(
  email: string,
  password: string,
): AuthValidationErrors {
  return {
    email: validateEmail(email),
    password: password ? undefined : "أدخل كلمة المرور.",
  };
}

export function validateRegistrationInput(
  email: string,
  password: string,
  confirmation: string,
): AuthValidationErrors {
  return {
    email: validateEmail(email),
    password: validatePassword(password),
    confirmation:
      confirmation && confirmation === password
        ? undefined
        : confirmation
          ? "كلمتا المرور غير متطابقتين."
          : "أعد كتابة كلمة المرور.",
  };
}

export function hasValidationErrors(errors: AuthValidationErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function sanitizeReturnPath(
  value: string | null | undefined,
  fallback = "/account",
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    let decoded = value;
    for (let index = 0; index < 2; index += 1) decoded = decodeURIComponent(decoded);
    if (decoded.startsWith("//") || decoded.includes("\\")) return fallback;
    const url = new URL(value, "https://sa3erli.invalid");
    if (url.origin !== "https://sa3erli.invalid" || !url.pathname.startsWith("/")) {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function mapAuthError(error: unknown): string {
  const code = getSafeAuthErrorCode(error);
  switch (code) {
    case "auth/invalid-email":
      return "أدخل بريداً إلكترونياً صالحاً.";
    case "auth/weak-password":
      return "كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل.";
    case "auth/invalid-credential":
    case "auth/user-disabled":
      return "تعذر تسجيل الدخول بهذه البيانات. تحقق منها أو استخدم طريقة دخول أخرى.";
    case "auth/email-already-in-use":
    case "auth/account-exists-with-different-credential":
    case "auth/credential-already-in-use":
      return "تعذر إكمال العملية بهذه الطريقة. جرّب تسجيل الدخول بالطريقة التي استخدمتها سابقاً.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "تم إلغاء نافذة تسجيل الدخول عبر Google.";
    case "auth/popup-blocked":
      return "تعذر فتح نافذة Google. اسمح بالنوافذ المنبثقة ثم حاول مجدداً.";
    case "auth/network-request-failed":
      return "تعذر الاتصال بخدمة تسجيل الدخول. تحقق من الإنترنت وحاول مجدداً.";
    case "auth/too-many-requests":
      return "محاولات كثيرة خلال وقت قصير. انتظر قليلاً ثم حاول مجدداً.";
    case "auth/operation-not-allowed":
    case "auth/unavailable":
      return "خدمة تسجيل الدخول غير متاحة حالياً.";
    default:
      return "تعذر إكمال العملية. حاول مجدداً.";
  }
}

export function getSafeAuthErrorCode(error: unknown): AuthErrorCode {
  if (error instanceof SafeAuthError) return error.code;
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String(error.code);
    const allowed: AuthErrorCode[] = [
      "auth/invalid-email",
      "auth/weak-password",
      "auth/email-already-in-use",
      "auth/account-exists-with-different-credential",
      "auth/credential-already-in-use",
      "auth/invalid-credential",
      "auth/user-disabled",
      "auth/too-many-requests",
      "auth/network-request-failed",
      "auth/popup-closed-by-user",
      "auth/cancelled-popup-request",
      "auth/popup-blocked",
      "auth/operation-not-allowed",
      "auth/unavailable",
    ];
    if (allowed.includes(code as AuthErrorCode)) return code as AuthErrorCode;
  }
  return "auth/unknown";
}

export function isProviderCollision(error: unknown): boolean {
  return [
    "auth/email-already-in-use",
    "auth/account-exists-with-different-credential",
    "auth/credential-already-in-use",
  ].includes(getSafeAuthErrorCode(error));
}
