import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fillCatalogOffer, fillCustomOffer, fillShop, watchPage } from "./helpers";

const runToken = Date.now().toString();

function remember(collection: string, id: string) {
  mkdirSync("test-artifacts", { recursive: true });
  const path = "test-artifacts/firestore-document-ids.json";
  let items: { collection: string; id: string }[] = [];
  try { items = JSON.parse(readFileSync(path, "utf8")); } catch {}
  if (!items.some((item) => item.collection === collection && item.id === id)) {
    items.push({ collection, id });
    writeFileSync(path, `${JSON.stringify(items, null, 2)}\n`);
  }
}

async function submissionPage(context: BrowserContext, suffix: string) {
  const page = await context.newPage();
  const clientId = `test-e2e-${runToken}-${suffix}`;
  await page.addInitScript((id) => {
    Object.defineProperty(crypto, "randomUUID", { value: () => id });
  }, clientId);
  return { page, clientId };
}

async function submit(page: Page) {
  await page.getByRole("button", { name: "أرسل الأسعار" }).click();
  await expect(page.getByText("تمت إضافة عرضك للموقع.")).toBeVisible({ timeout: 10_000 });
}

test("1.9 real Firestore live create, replace, conditions, custom products, currencies and static-shop match", async ({ context }) => {
  test.skip(test.info().project.name !== "desktop", "live writes are executed once");
  const allCleanups: (() => void)[] = [];

  const usedId = "963911111111_samsung-galaxy-a32-128gb-4g_used";
  const newId = "963911111111_samsung-galaxy-a32-128gb-4g_new";
  const customXId = "963911111111_samsung-test-phone-x-64gb-4g_new";
  const testYId = "963911111111_samsung-test-phone-y-64gb-4g_new";
  const hdoYId = "963937272727_samsung-test-phone-y-64gb-4g_new";

  {
    const { page, clientId } = await submissionPage(context, "a");
    allCleanups.push(watchPage(page));
    await page.goto("/add");
    await fillShop(page);
    await fillCatalogOffer(page, { condition: "مستعمل", price: "100" });
    await submit(page);
    await expect(page.getByRole("link", { name: /Samsung Galaxy A32 128GB/ })).toHaveAttribute("href", "/product?id=p2");
    await expect(page.getByRole("link", { name: "الصفحة الرئيسية" })).toHaveAttribute("href", "/");
    await expect(page.getByLabel("اسم المحل")).toHaveCount(0);
    remember("liveOffers", usedId); remember("submissions", clientId);
    await page.close();
  }

  {
    const page = await context.newPage(); allCleanups.push(watchPage(page));
    await page.goto("/");
    await page.getByRole("button", { name: "مستعمل", exact: true }).click();
    await expect(page.locator('a[href="/product?id=p2"]').getByText("$100", { exact: true })).toBeVisible();
    await page.goto("/product?id=p2");
    await expect(page.getByText("TEST - احذفني", { exact: true })).toBeVisible();
    await page.goto("/shop?id=live-963911111111");
    await expect(page.getByText("Galaxy A32", { exact: true })).toBeVisible();
    await page.close();
  }

  for (const [suffix, condition, price, id] of [
    ["c", "مستعمل", "90", usedId],
    ["d", "جديد", "80", newId],
  ] as const) {
    const { page, clientId } = await submissionPage(context, suffix); allCleanups.push(watchPage(page));
    await page.goto("/add"); await fillShop(page); await fillCatalogOffer(page, { condition, price }); await submit(page);
    remember("liveOffers", id); remember("submissions", clientId); await page.close();
  }
  {
    const page = await context.newPage(); allCleanups.push(watchPage(page));
    await page.goto("/product?id=p2");
    await expect(page.getByText("$90", { exact: true })).toBeVisible();
    await expect(page.getByText("$80", { exact: true })).toBeVisible();
    await page.goto("/shop?id=live-963911111111");
    await expect(page.getByText("جديد", { exact: true })).toBeVisible();
    await expect(page.getByText("مستعمل", { exact: true })).toBeVisible();
    await page.close();
  }

  {
    const { page, clientId } = await submissionPage(context, "e"); allCleanups.push(watchPage(page));
    await page.goto("/add"); await fillShop(page); await fillCustomOffer(page, "TEST Phone X"); await submit(page);
    await expect(page.getByRole("link", { name: /TEST Phone X/ })).toHaveAttribute("href", "/product?id=live-samsung-test-phone-x-64gb-4g");
    remember("liveOffers", customXId); remember("submissions", clientId); await page.close();
    const fresh = await context.newPage(); allCleanups.push(watchPage(fresh));
    await fresh.goto("/");
    await expect(fresh.locator('a[href="/product?id=live-samsung-test-phone-x-64gb-4g"]')).toBeVisible();
    await fresh.goto("/product?id=live-samsung-test-phone-x-64gb-4g");
    await expect(fresh.getByRole("heading", { name: "TEST Phone X" })).toBeVisible(); await fresh.close();
  }

  {
    const { page, clientId } = await submissionPage(context, "f"); allCleanups.push(watchPage(page));
    await page.goto("/add"); await fillShop(page); await fillCatalogOffer(page, { condition: "مستعمل", price: "900000" });
    await page.locator("fieldset").first().getByRole("button", { name: "ليرة", exact: true }).click(); await submit(page);
    remember("liveOffers", usedId); remember("submissions", clientId); await page.close();
    const fresh = await context.newPage(); allCleanups.push(watchPage(fresh)); await fresh.goto("/product?id=p2");
    const testShop = fresh.getByText("TEST - احذفني", { exact: true }).locator("..", { has: fresh.getByText("900,000 ل.س", { exact: true }) });
    await expect(testShop).toBeVisible();
    await expect(fresh.getByText("$90", { exact: true })).toHaveCount(0); await fresh.close();
  }

  for (const [suffix, phone, currency, id] of [
    ["g-test", "0911111111", "ليرة", testYId],
    ["g-hdo", "0937272727", "دولار", hdoYId],
  ] as const) {
    const { page, clientId } = await submissionPage(context, suffix); allCleanups.push(watchPage(page));
    await page.goto("/add"); await fillShop(page, phone); await fillCustomOffer(page, "TEST Phone Y", { currency }); await submit(page);
    remember("liveOffers", id); remember("submissions", clientId); await page.close();
  }
  {
    const page = await context.newPage(); allCleanups.push(watchPage(page));
    await page.goto("/product?id=live-samsung-test-phone-y-64gb-4g");
    await expect(page.getByText("جديد · دولار", { exact: true })).toBeVisible();
    await expect(page.getByText("جديد · ليرة سورية", { exact: true })).toBeVisible();
    await expect(page.getByText("الأرخص", { exact: true })).toHaveCount(2);
    await page.goto("/shop?id=shop3");
    await expect(page.getByText("TEST Phone Y", { exact: true })).toBeVisible();
    await page.goto("/shop?id=live-963937272727");
    await expect(page.getByRole("heading", { name: "هذا المحل غير موجود" })).toBeVisible();
    await page.close();
  }

  for (const cleanup of allCleanups) cleanup();
});
