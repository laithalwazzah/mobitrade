import { expect, test, type Page } from "@playwright/test";

const adminUser = { uid: "test-admin", email: "admin@example.test", displayName: "TEST Admin", emailVerified: true, providerIds: ["password"] };

async function configure(page: Page, role: "signed-out" | "unverified" | "user" | "admin", options: { summary?: "success" | "error"; list?: "success" | "empty" | "error" } = {}) {
  await page.addInitScript(({ role, options, adminUser }) => {
    const user = role === "signed-out" ? null : { ...adminUser, emailVerified: role !== "unverified" };
    window.__SA3ERLI_AUTH_TEST__ = { enabled: true, initialUser: user };
    window.__SA3ERLI_ADMIN_TEST__ = { enabled: true, role: role === "admin" ? "admin" : "user", ...options };
    window.localStorage.removeItem("sa3erli-auth-e2e-session");
  }, { role, options, adminUser });
}

test("admin role matrix is fail-closed without privileged content flash", async ({ page }) => {
  await configure(page, "signed-out");
  await page.goto("/admin");
  await page.waitForURL(/\/login\?returnTo=/);
  await expect(page.getByText("الملخص العالمي")).toHaveCount(0);

  await page.context().clearCookies();
  await configure(page, "user");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "غير مصرح" })).toBeVisible();
  await expect(page.getByText("الملخص العالمي")).toHaveCount(0);
});

test("unverified users are sent to verification without admin business requests", async ({ page }) => {
  await configure(page, "unverified");
  await page.goto("/admin");
  await page.waitForURL(/\/verify-email\?returnTo=/);
  await expect(page.getByText("الملخص العالمي")).toHaveCount(0);
  expect(await page.evaluate(() => window.__SA3ERLI_ADMIN_TEST_EVENTS__ ?? [])).toEqual([]);
});

test("admin summary and list keep independent loading, error, retry, and empty states", async ({ page }) => {
  await configure(page, "admin", { summary: "error", list: "success" });
  await page.goto("/admin");
  await expect(page.getByText("تعذر تحميل الملخص الإداري الموثوق الآن.")).toBeVisible();
  await expect(page.getByText("TEST محل أول")).toBeVisible();
  await expect(page.getByRole("link", { name: "مراجعة الطلب" }).first()).toHaveAttribute("href", /\/admin\/application\?id=/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("admin detail uses explicit private document action and approval omits reason", async ({ page }) => {
  await configure(page, "admin");
  await page.addInitScript(() => {
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.revokeObjectURL = (value) => { (window.__SA3ERLI_ADMIN_TEST_EVENTS__ ??= []).push("blob-revoked"); revoke(value); };
  });
  await page.goto("/admin/application?id=test-pending-1");
  await expect(page.getByRole("heading", { name: "بيانات الطلب" })).toBeVisible();
  expect(await page.evaluate(() => window.__SA3ERLI_ADMIN_TEST_EVENTS__?.includes("document") ?? false)).toBe(false);
  await page.getByRole("button", { name: "عرض الوثيقة" }).click();
  await expect(page.getByRole("dialog", { name: "الوثيقة الخاصة" })).toBeVisible();
  expect(await page.evaluate(() => window.__SA3ERLI_ADMIN_TEST_EVENTS__?.includes("document") ?? false)).toBe(true);
  await page.getByRole("button", { name: "إغلاق عرض الوثيقة" }).click();
  expect(await page.evaluate(() => window.__SA3ERLI_ADMIN_TEST_EVENTS__?.includes("blob-revoked") ?? false)).toBe(true);
  await page.getByRole("button", { name: "موافقة" }).click();
  await page.getByRole("button", { name: "تأكيد القرار" }).click();
  await expect(page.getByText("تم حفظ القرار بنجاح.")).toBeVisible();
  expect(await page.evaluate(() => window.__SA3ERLI_ADMIN_TEST_EVENTS__?.some((entry) => entry === "decision:approved:") ?? false)).toBe(true);
});

test("admin layouts remain RTL, focusable, reduced-motion safe, and overflow-free at five widths", async ({ page }) => {
  await configure(page, "admin");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 375, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 812 });
    await page.goto("/admin");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { name: "طلبات اعتماد المحلات" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);
  }
});

test("rejection requires a reason and remains keyboard accessible", async ({ page }) => {
  await configure(page, "admin");
  await page.goto("/admin/application?id=test-pending-1");
  await page.getByRole("button", { name: "رفض" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "تأكيد القرار" }).click();
  await expect(page.getByText("سبب الرفض مطلوب.")).toBeVisible();
  await page.getByLabel("سبب الرفض").fill("TEST سبب واضح");
  await page.getByRole("button", { name: "تأكيد القرار" }).click();
  await expect(page.getByText("تم حفظ القرار بنجاح.")).toBeVisible();
});
