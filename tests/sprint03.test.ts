import assert from "node:assert/strict";
import test from "node:test";
import { SafeAuthError, authStateFromUser, getSafeAuthErrorCode, isProviderCollision, mapAuthError, sanitizeReturnPath, validateEmail, validateLoginInput, validatePassword, validateRegistrationInput } from "../lib/auth";

const user = { uid: "u1", email: "user@example.com", displayName: null, emailVerified: false, providerIds: ["password"] };

test("auth states distinguish loading, signed out, unverified and verified", () => {
  assert.deepEqual(authStateFromUser(null), { status: "signed-out", user: null });
  assert.equal(authStateFromUser(user).status, "signed-in-unverified");
  assert.equal(authStateFromUser({ ...user, emailVerified: true }).status, "signed-in-verified");
});

test("email and password validation is deterministic", () => {
  assert.ok(validateEmail("bad")); assert.equal(validateEmail("user@example.com"), undefined);
  assert.ok(validatePassword("short")); assert.equal(validatePassword("long-enough"), undefined);
  assert.ok(validateLoginInput("", "").email);
  assert.ok(validateRegistrationInput("user@example.com", "long-enough", "different").confirmation);
  assert.equal(validateRegistrationInput("user@example.com", "long-enough", "long-enough").confirmation, undefined);
});

test("return paths allow internal URLs and reject redirects", () => {
  assert.equal(sanitizeReturnPath("/add?from=login#top"), "/add?from=login#top");
  for (const unsafe of ["https://evil.test", "//evil.test", "/\\evil.test", "/%2F%2Fevil.test", "%2Fadd", null]) assert.equal(sanitizeReturnPath(unsafe), "/account");
});

test("Firebase errors map to safe stable Arabic messages without raw details", () => {
  const raw = { code: "auth/invalid-credential", message: "SECRET backend detail" };
  const message = mapAuthError(raw);
  assert.ok(message.includes("تعذر")); assert.ok(!message.includes("SECRET"));
  assert.equal(getSafeAuthErrorCode({ code: "auth/not-in-allowlist" }), "auth/unknown");
  assert.equal(mapAuthError(new Error("secret")), "تعذر إكمال العملية. حاول مجدداً.");
});

test("provider collisions are identified without unsafe linking", () => {
  assert.equal(isProviderCollision(new SafeAuthError("auth/email-already-in-use")), true);
  assert.equal(isProviderCollision({ code: "auth/account-exists-with-different-credential" }), true);
  assert.equal(isProviderCollision({ code: "auth/popup-closed-by-user" }), false);
  assert.ok(mapAuthError({ code: "auth/account-exists-with-different-credential" }).includes("الطريقة"));
});
