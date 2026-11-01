import { expect, test, type Page } from "@playwright/test";

const storageKey = "sa3erli-compare-products";
const galaxyKey = "samsung-galaxy-a32-128gb-4g";
const iphoneKey = "apple-iphone-11-128gb-4g";
const realmeKey = "realme-c55-128gb-4g";

test.beforeEach(async ({ page }) => {
  await page.route("**/firestore.googleapis.com/**", (route) => route.abort());
  await page.goto("/");
  await page.evaluate((key) => localStorage.removeItem(key), storageKey);
  await page.reload();
});

function productCard(page: Page, id: string) {
  return page.locator("article", { has: page.locator(`a[href="/product?id=${id}"]`) });
}

function collapsedTray(page: Page) {
  return page.getByRole("button", { name: /المقارنة \d/ });
}

async function expandTray(page: Page) {
  await collapsedTray(page).click();
  return page.getByRole("complementary", { name: "شريط المقارنة" });
}

test("tray stays collapsed, persists selection, rejects duplicates, and supports remove and clear", async ({ page }) => {
  const galaxy = productCard(page, "p2");
  const iphone = productCard(page, "p3");

  await galaxy.getByRole("button", { name: "أضف للمقارنة" }).click();
  await expect(collapsedTray(page)).toHaveText(/المقارنة\s*1/);
  await expect(page.getByRole("complementary", { name: "شريط المقارنة" })).toHaveCount(0);
  await expect(galaxy.getByRole("button", { name: "إزالة من المقارنة" })).toHaveAttribute("aria-pressed", "true");

  let tray = await expandTray(page);
  await expect(tray).toContainText("Galaxy A32");
  await tray.getByRole("button", { name: "إغلاق شريط المقارنة" }).click();
  await expect(tray).toHaveCount(0);

  await page.reload();
  await expect(collapsedTray(page)).toHaveText(/المقارنة\s*1/);
  await iphone.getByRole("button", { name: "أضف للمقارنة" }).click();
  await expect(collapsedTray(page)).toHaveText(/المقارنة\s*2/);
  tray = await expandTray(page);
  await expect(tray.getByRole("listitem")).toHaveCount(2);
  await expect(tray.getByRole("link", { name: "افتح المقارنة" })).toBeEnabled();

  await page.evaluate(
    ({ key, galaxy, iphone }) => localStorage.setItem(key, JSON.stringify([galaxy, galaxy, iphone, "third-phone"])),
    { key: storageKey, galaxy: galaxyKey, iphone: iphoneKey },
  );
  await page.reload();
  tray = await expandTray(page);
  await expect(tray.getByRole("listitem")).toHaveCount(2);
  await tray.getByRole("button", { name: /إزالة Galaxy A32/ }).click();
  await expect(tray).toContainText("المقارنة (1/2)");
  await tray.getByRole("button", { name: "مسح الكل" }).click();
  await expect(collapsedTray(page)).toHaveCount(0);
});

test("corrupt storage is safely reset", async ({ page }) => {
  await page.evaluate((key) => localStorage.setItem(key, "{corrupt"), storageKey);
  await page.reload();
  await expect(collapsedTray(page)).toHaveCount(0);
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe("[]");
});

test("comparison page hides the tray and highlights differences without mixing currencies", async ({ page }) => {
  await page.evaluate(
    ({ key, values }) => localStorage.setItem(key, JSON.stringify(values)),
    { key: storageKey, values: [galaxyKey, iphoneKey] },
  );
  await page.goto("/compare");
  await expect(page.getByRole("heading", { name: "اختر الأنسب إلك" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Galaxy A32" })).toBeVisible();
  await expect(page.getByRole("link", { name: "iPhone 11" })).toBeVisible();
  await expect(collapsedTray(page)).toHaveCount(0);
  await expect(page.getByRole("complementary", { name: "شريط المقارنة" })).toHaveCount(0);
  await expect(page.getByText("$230", { exact: true })).toBeVisible();
  await expect(page.getByText("$250", { exact: true })).toBeVisible();
  expect(await page.locator("td.bg-amber-50").count()).toBeGreaterThan(0);
  await expect(page.getByText(/الأسعار مفصولة حسب الحالة والعملة/)).toBeVisible();
});

test("Realme C55 model-level specifications render with product storage", async ({ page }) => {
  await page.evaluate(
    ({ key, values }) => localStorage.setItem(key, JSON.stringify(values)),
    { key: storageKey, values: [galaxyKey, realmeKey] },
  );
  await page.goto("/compare");
  await expect(page.getByRole("link", { name: "C55" })).toBeVisible();
  await expect(page.getByText("MediaTek Helio G88", { exact: true })).toBeVisible();
  await expect(page.getByText("33W SUPERVOOC", { exact: true })).toBeVisible();
  await expect(page.getByText("128GB", { exact: true })).toHaveCount(2);
  await expect(collapsedTray(page)).toHaveCount(0);
});

test("tray is compact on mobile and desktop and can always be closed", async ({ page }) => {
  await page.goto("/product?id=p2");
  const addButton = page.getByRole("button", { name: "أضف للمقارنة" });
  const addButtonBox = await addButton.boundingBox();
  await addButton.click();
  const collapsed = collapsedTray(page);
  await expect(collapsed).toBeVisible();

  const collapsedBox = await collapsed.boundingBox();
  expect(collapsedBox).not.toBeNull();
  expect(collapsedBox!.width).toBeLessThan(180);
  expect(collapsedBox!.height).toBeLessThan(64);
  if (addButtonBox) {
    const overlaps = collapsedBox!.x < addButtonBox.x + addButtonBox.width && collapsedBox!.x + collapsedBox!.width > addButtonBox.x && collapsedBox!.y < addButtonBox.y + addButtonBox.height && collapsedBox!.y + collapsedBox!.height > addButtonBox.y;
    expect(overlaps).toBe(false);
  }

  const tray = await expandTray(page);
  await expect(tray).toBeVisible();
  const trayBox = await tray.boundingBox();
  const viewport = page.viewportSize();
  expect(trayBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(trayBox!.x).toBeGreaterThanOrEqual(0);
  expect(trayBox!.y).toBeGreaterThanOrEqual(0);
  expect(trayBox!.x + trayBox!.width).toBeLessThanOrEqual(viewport!.width);
  expect(trayBox!.y + trayBox!.height).toBeLessThanOrEqual(viewport!.height);

  await tray.getByRole("button", { name: "إغلاق شريط المقارنة" }).click();
  await expect(tray).toHaveCount(0);
  await expect(collapsed).toBeVisible();
});
