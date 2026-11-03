import { expect, test, type Page } from "@playwright/test";

type TestUser = { uid: string; email: string; displayName: string | null; emailVerified: boolean; providerIds: string[] };

async function installMock(page: Page, options: { initialUser?: TestUser | null; listenerDelayMs?: number; google?: "success" | "cancel" | "failure" | "collision"; verifyOnReload?: boolean; unavailable?: boolean } = {}) {
  await page.addInitScript((config) => {
    window.__SA3ERLI_AUTH_TEST__ = { enabled: true, ...config };
    window.__SA3ERLI_AUTH_TEST_EVENTS__ = [];
    window.__SA3ERLI_MERCHANT_TEST__ = { enabled: true, status: "none" };
  }, options);
}

const verified: TestUser = { uid: "test-user", email: "verified@example.com", displayName: null, emailVerified: true, providerIds: ["password"] };
const unverified: TestUser = { ...verified, email: "unverified@example.com", emailVerified: false };

test("registration validates fields, handles collision, and reaches verification", async ({ page }) => {
  await installMock(page);
  await page.goto("/register?returnTo=%2Fadd");
  await page.getByRole("button", { name: "إنشاء حساب" }).click();
  await expect(page.getByText("أدخل البريد الإلكتروني.")).toBeVisible();
  await page.getByLabel("البريد الإلكتروني").fill("existing@example.com");
  await page.getByLabel("كلمة المرور", { exact: true }).fill("strong-pass");
  await page.getByLabel("تأكيد كلمة المرور").fill("strong-pass");
  await page.getByRole("button", { name: "إنشاء حساب" }).click();
  await expect(page.getByText(/تعذر إكمال العملية بهذه الطريقة/)).toBeVisible();
  await page.getByLabel("البريد الإلكتروني").fill("new@example.com");
  await page.getByRole("button", { name: "إنشاء حساب" }).click();
  await expect(page).toHaveURL(/\/verify-email\?returnTo=%2Fadd/);
  await expect(page.getByText("new@example.com")).toBeVisible();
});

test("login uses safe errors and sanitizes the return path", async ({ page }) => {
  await installMock(page);
  await page.goto("/login?returnTo=https%3A%2F%2Fevil.test");
  await page.getByLabel("البريد الإلكتروني").fill("user@example.com");
  await page.getByLabel("كلمة المرور").fill("wrong-password");
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page.getByText(/تعذر تسجيل الدخول/)).toBeVisible();
  await page.getByLabel("كلمة المرور").fill("correct-password");
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/account/);
  await expect(page).not.toHaveURL(/evil/);
});

test("reset response stays generic and logout clears the session", async ({ page }) => {
  await installMock(page, { initialUser: verified });
  await page.goto("/forgot-password");
  await page.getByLabel("البريد الإلكتروني").fill("nobody@example.com");
  await page.getByRole("button", { name: "إرسال رابط الاستعادة" }).click();
  await expect(page.getByRole("status")).toContainText("إذا كان البريد مرتبطاً بحساب");
  await page.goto("/account");
  await expect(page.getByText("verified@example.com")).toBeVisible();
  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("link", { name: "تسجيل الدخول" })).toBeVisible();
});

test("verification resend and reload gate merchant access", async ({ page }) => {
  await installMock(page, { initialUser: unverified, verifyOnReload: true });
  await page.goto("/add");
  await expect(page).toHaveURL(/\/verify-email\?returnTo=%2Fadd/);
  await page.getByRole("button", { name: "إعادة إرسال رسالة التحقق" }).click();
  await expect(page.getByRole("status")).toContainText("أُعيد إرسال");
  await page.getByRole("button", { name: "تحققت من بريدي" }).click();
  await expect(page).toHaveURL(/\/add/);
  await expect(page.getByRole("heading", { name: "طلب اعتماد محل" })).toBeVisible();
  await expect(page.getByRole("button", { name: /أرسل الأسعار/ })).toHaveCount(0);
});

test("Google success, cancellation, failure and collision are truthful", async ({ page }) => {
  await installMock(page, { google: "cancel" });
  for (const scenario of ["cancel", "failure", "collision"] as const) {
    await page.goto("/login");
    await page.evaluate((google) => { window.__SA3ERLI_AUTH_TEST__ = { enabled: true, google }; }, scenario);
    await page.getByRole("button", { name: "المتابعة باستخدام Google" }).click();
    await expect(page.locator("p[role=alert]")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  }
});

test("Google success opens account and session restoration never flashes login", async ({ page }) => {
  await installMock(page, { google: "success", listenerDelayMs: 250 });
  await page.goto("/login");
  await page.getByRole("button", { name: "المتابعة باستخدام Google" }).click();
  await expect(page).toHaveURL(/\/account/);
  await page.reload();
  await expect(page.getByLabel("جارٍ استعادة الجلسة")).toBeVisible();
  await expect(page.getByRole("link", { name: "تسجيل الدخول" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "حسابي" })).toBeVisible();
});

test("signed-out add redirects safely", async ({ page }) => {
  await installMock(page);
  await page.goto("/add");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fadd/);
});

test("missing configuration is clear", async ({ page }) => {
  await installMock(page, { unavailable: true });
  await page.goto("/login");
  await expect(page.getByText(/خدمة تسجيل الدخول غير متاحة/)).toBeVisible();
});

test("auth pages are RTL, keyboard reachable and responsive", async ({ page }) => {
  await installMock(page);
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus-visible")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
