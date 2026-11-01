import { expect, test } from "@playwright/test";
import { fillCatalogOffer, fillShop, watchPage } from "./helpers";

declare global {
  interface Window {
    __testOpenedUrls: string[];
  }
}

async function stubOpen(page: import("@playwright/test").Page, blocked = false) {
  await page.addInitScript((shouldBlock) => {
    const opened: string[] = [];
    Object.defineProperty(window, "__testOpenedUrls", { value: opened });
    window.open = ((initialUrl?: string | URL) => {
      if (shouldBlock) return null;
      const record = (value: string) => {
        if (value && value !== "about:blank") opened.push(value);
      };
      record(String(initialUrl ?? ""));
      const location = {
        set href(value: string) { record(value); },
        get href() { return ""; },
      };
      return {
        document: { title: "", body: { textContent: "" } },
        location,
        close() {},
        opener: null,
      };
    }) as typeof window.open;
  }, blocked);
}

test("1.8 and 1.10b delayed Firestore falls back near five seconds and guards double submit", async ({ page }) => {
  test.skip(test.info().project.name !== "desktop", "network timing is executed once");
  const clean = watchPage(page, (url) => url.includes("firestore.googleapis.com"));
  await stubOpen(page);
  let commits = 0;
  await page.route("**/firestore.googleapis.com/**", async (route) => {
    if (
      route.request().method() === "POST" &&
      route.request().postData()?.includes("liveOffers")
    ) commits += 1;
    await new Promise((resolve) => setTimeout(resolve, 6_500));
    await route.abort();
  });
  await page.goto("/add");
  await fillShop(page);
  await fillCatalogOffer(page);
  const button = page.getByRole("button", { name: "أرسل الأسعار" });
  const started = Date.now();
  await button.evaluate((element) => {
    (element as HTMLButtonElement).click();
    (element as HTMLButtonElement).click();
    (element as HTMLButtonElement).click();
  });
  await expect(page.getByRole("button", { name: "جارٍ الإرسال..." })).toBeDisabled();
  await expect(page.getByText("تم تجهيز طلبك. سنراجع الأسعار وننشرها بالموقع قريباً.")).toBeVisible({ timeout: 8_000 });
  const elapsed = Date.now() - started;
  expect(elapsed).toBeGreaterThanOrEqual(4_500);
  expect(elapsed).toBeLessThan(6_500);
  expect(commits).toBe(1);
  clean();
});

test("1.10a blocked Firestore shows static-data warning and structured WhatsApp fallback", async ({ page }) => {
  test.skip(test.info().project.name !== "desktop", "failure flow is executed once");
  const clean = watchPage(page, (url) => url.includes("firestore.googleapis.com"));
  await stubOpen(page);
  await page.route("**/firestore.googleapis.com/**", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByText("تعذر تحميل أحدث الأسعار، يتم عرض البيانات المحفوظة")).toBeVisible({ timeout: 12_000 });
  await page.goto("/add");
  await fillShop(page);
  await fillCatalogOffer(page);
  const started = Date.now();
  await page.getByRole("button", { name: "أرسل الأسعار" }).click();
  await expect(page.getByText("تم تجهيز طلبك. سنراجع الأسعار وننشرها بالموقع قريباً.")).toBeVisible({ timeout: 7_000 });
  expect(Date.now() - started).toBeLessThan(6_500);
  const urls = await page.evaluate(() => window.__testOpenedUrls);
  expect(urls).toHaveLength(1);
  expect(urls[0]).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  const message = await page.getByLabel("نص رسالة واتساب").inputValue();
  expect(message).toContain("بيانات المحل:");
  expect(message).toContain("1. Samsung Galaxy A32");
  expect(message).toContain("رقم الطلب:");
  const dataText = message.split("---DATA---\n")[1]?.split("\n---END---")[0];
  expect(dataText).toBeTruthy();
  const data = JSON.parse(dataText!);
  expect(data.shop.whatsapp).toBe("963911111111");
  expect(data.offers[0]).toMatchObject({ condition: "used", network: "4G" });
  clean();
});

test("1.10c blocked popup keeps typed data and exposes copy fallback", async ({ page }) => {
  test.skip(test.info().project.name !== "desktop", "failure flow is executed once");
  const clean = watchPage(page, (url) => url.includes("firestore.googleapis.com"));
  await stubOpen(page, true);
  await page.route("**/firestore.googleapis.com/**", (route) => route.abort());
  await page.goto("/add");
  await fillShop(page);
  await fillCatalogOffer(page);
  await page.getByRole("button", { name: "أرسل الأسعار" }).click();
  await expect(page.getByText(/تعذّر فتح واتساب/)).toBeVisible({ timeout: 7_000 });
  await expect(page.getByLabel("نص رسالة واتساب")).toContainText("TEST - احذفني");
  await expect(page.getByLabel("اسم المحل")).toHaveValue("TEST - احذفني");
  await expect(page.getByLabel("السعر")).toHaveValue("100");
  clean();
});
