import { expect, test, type Page } from "@playwright/test";

const verified = { uid: "test-owner", email: "merchant@example.com", displayName: null, emailVerified: true, providerIds: ["password"] };

async function setup(page: Page, merchant: NonNullable<Window["__SA3ERLI_MERCHANT_TEST__"]>) {
  await page.addInitScript(({ user, merchantConfig }) => {
    window.__SA3ERLI_AUTH_TEST__ = { enabled: true, initialUser: user };
    window.__SA3ERLI_MERCHANT_TEST__ = merchantConfig;
    window.__SA3ERLI_MERCHANT_TEST_EVENTS__ = [];
  }, { user: verified, merchantConfig: merchant });
}

async function fillValid(page: Page) {
  await page.getByLabel("اسم المحل").fill("TEST Shop");
  await page.getByLabel("المنطقة أو الحي").fill("TEST Area");
  await page.getByLabel("العنوان التفصيلي").fill("TEST Address");
  await page.getByLabel("رقم واتساب المحل").fill("0911111111");
  await page.getByLabel("صورة السجل التجاري").setInputFiles({ name: "record.png", mimeType: "image/png", buffer: Buffer.from("safe-test-image") });
}

test("verified owner sees an accessible application form and validation", async ({ page }) => {
  await setup(page, { enabled: true, status: "none" });
  await page.goto("/add");
  await expect(page.getByRole("heading", { name: "طلب اعتماد محل" })).toBeVisible();
  await page.getByRole("button", { name: "إرسال طلب الاعتماد" }).click();
  await expect(page.locator("[aria-invalid=true]")).toHaveCount(5);
  await expect(page.getByText("أرفق صورة السجل التجاري.")).toBeVisible();
  await page.getByLabel("صورة السجل التجاري").setInputFiles({ name: "record.pdf", mimeType: "application/pdf", buffer: Buffer.from("not-an-image") });
  await page.getByRole("button", { name: "إرسال طلب الاعتماد" }).click();
  await expect(page.locator("#commercial-record-error")).toContainText("JPG أو PNG أو WebP");
});

test("one guarded submission commits both records atomically then becomes pending", async ({ page }) => {
  await setup(page, { enabled: true, status: "none", submit: "success", submitDelayMs: 300 });
  await page.goto("/add");
  await fillValid(page);
  const submit = page.getByRole("button", { name: "إرسال طلب الاعتماد" });
  await submit.click();
  const busy = page.getByRole("button", { name: /جارٍ حفظ السجل/ });
  await expect(busy).toBeDisabled();
  await busy.click({ force: true });
  await expect(page.getByRole("heading", { name: "طلبك قيد المراجعة" })).toBeVisible();
  expect(await page.evaluate(() => window.__SA3ERLI_MERCHANT_TEST_EVENTS__)).toEqual(["api-application", "api-document", "api-commit"]);
  await expect(page.locator("form")).toHaveCount(0);
});

test("duplicate and document failures are safe, private, and do not grant approval", async ({ page }) => {
  await setup(page, { enabled: true, status: "none", submit: "duplicate" });
  await page.goto("/add");
  await fillValid(page);
  await page.getByRole("button", { name: "إرسال طلب الاعتماد" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "طلب اعتماد سابق" })).toBeVisible();
  await page.evaluate(() => { window.__SA3ERLI_MERCHANT_TEST__ = { enabled: true, status: "none", submit: "document-failure" }; });
  await page.getByRole("button", { name: "إرسال طلب الاعتماد" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "تعذر تجهيز صورة" })).toBeVisible();
  await expect(page.getByText("تم اعتماد محلك")).toHaveCount(0);
  await expect(page.locator('a[href^="http"], a[href^="gs:"]')).toHaveCount(0);
});

test("failed atomic write has no commit event and leaves the form available", async ({ page }) => {
  await setup(page, { enabled: true, status: "none", submit: "write-failure" });
  await page.goto("/add");
  await fillValid(page);
  await page.getByRole("button", { name: "إرسال طلب الاعتماد" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "تعذر إرسال طلب الاعتماد" })).toBeVisible();
  expect(await page.evaluate(() => window.__SA3ERLI_MERCHANT_TEST_EVENTS__)).toEqual(["api-application", "api-document"]);
  await expect(page.getByRole("button", { name: "إرسال طلب الاعتماد" })).toBeEnabled();
});

for (const status of ["pending", "approved", "rejected"] as const) {
  test(`${status} status is server-derived and never exposes publishing`, async ({ page }) => {
    await setup(page, { enabled: true, status, ...(status === "rejected" ? { rejectionReason: "بيانات غير مكتملة" } : {}) });
    await page.goto("/add");
    const heading = status === "pending" ? "طلبك قيد المراجعة" : status === "approved" ? "تم اعتماد محلك" : "لم يُقبل طلب الاعتماد";
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /أرسل الأسعار/ })).toHaveCount(0);
  });
}

test("missing Firebase services shows unavailable without local approval", async ({ page }) => {
  await setup(page, { enabled: true, unavailable: true });
  await page.goto("/add");
  await expect(page.getByText(/خدمة طلبات اعتماد المحلات غير متاحة/)).toBeVisible();
  await expect(page.getByText("تم اعتماد محلك")).toHaveCount(0);
});

test("merchant workflow is RTL, keyboard reachable, responsive and has no overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await setup(page, { enabled: true, status: "none" });
  await page.goto("/add");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.getByLabel("اسم المحل").focus();
  await expect(page.getByLabel("اسم المحل")).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
