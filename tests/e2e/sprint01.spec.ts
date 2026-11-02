import { expect, test, type Page } from "@playwright/test";

function productCards(page: Page) {
  return page.locator("article");
}

function productIds(page: Page) {
  return productCards(page)
    .locator('a[href^="/product?id="]')
    .evaluateAll((links) =>
      links.map((link) => new URL((link as HTMLAnchorElement).href).searchParams.get("id")),
    );
}

test.beforeEach(async ({ page }) => {
  await page.route("**/firestore.googleapis.com/**", (route) => route.abort());
});

test("filters and sorting work together and price sorting requires one currency", async ({ page }) => {
  await page.goto("/");
  const search = page.getByPlaceholder(/ابحث عن موبايل/);
  const brandGroup = page.locator('[aria-label="الشركة"]');
  const conditionGroup = page.getByRole("group", { name: "الحالة" });
  const currencyGroup = page.getByRole("group", { name: "العملة" });
  const sorting = page.getByLabel("ترتيب المنتجات");
  const priceOption = sorting.locator('option[value="price"]');

  await expect(priceOption).toHaveAttribute("disabled", "");
  await expect(page.getByText(/اختر USD أو SYP/)).toBeVisible();

  await search.fill("Galaxy");
  await brandGroup.getByRole("button", { name: /Samsung/ }).click();
  await conditionGroup.getByRole("button", { name: "جديد" }).click();
  await currencyGroup.getByRole("button", { name: "USD" }).click();
  await expect(priceOption).not.toHaveAttribute("disabled", "");
  await sorting.selectOption("price");
  await expect(productCards(page)).toHaveCount(1);
  await expect(page.locator('a[href="/product?id=p2"]')).toBeVisible();
  await expect(page.locator('a[href="/product?id=p3"]')).toHaveCount(0);
  await expect(page.getByText("آخر تحديث: 2026-10-28", { exact: true })).toBeVisible();

  await currencyGroup.getByRole("button", { name: "SYP" }).click();
  await expect(page.getByRole("heading", { name: "لا توجد نتائج مطابقة" })).toBeVisible();
  await expect(page.getByRole("button", { name: "مسح الفلاتر وعرض الكل" })).toBeVisible();
});

test("reset clears every filter and restores newest sorting", async ({ page }) => {
  await page.goto("/");
  const search = page.getByPlaceholder(/ابحث عن موبايل/);
  const brandGroup = page.locator('[aria-label="الشركة"]');
  const conditionGroup = page.getByRole("group", { name: "الحالة" });
  const currencyGroup = page.getByRole("group", { name: "العملة" });
  const sorting = page.getByLabel("ترتيب المنتجات");

  await search.fill("لا توجد نتيجة");
  await brandGroup.getByRole("button", { name: /Apple/ }).click();
  await conditionGroup.getByRole("button", { name: "مستعمل" }).click();
  await currencyGroup.getByRole("button", { name: "USD" }).click();
  await sorting.selectOption("price");
  await page.getByRole("button", { name: "مسح الفلاتر", exact: true }).click();

  await expect(search).toHaveValue("");
  await expect(brandGroup.getByRole("button", { name: "الكل" })).toHaveAttribute("aria-pressed", "true");
  await expect(conditionGroup.getByRole("button", { name: "الكل" })).toHaveAttribute("aria-pressed", "true");
  await expect(currencyGroup.getByRole("button", { name: "الكل" })).toHaveAttribute("aria-pressed", "true");
  await expect(sorting).toHaveValue("newest");
  await expect(sorting.locator('option[value="price"]')).toHaveAttribute("disabled", "");
  await expect(productCards(page)).toHaveCount(2);
});

test("condition and currency matching controls cards, prices, and ordering", async ({ page }) => {
  await page.goto("/");
  const conditionGroup = page.getByRole("group", { name: "الحالة" });
  const currencyGroup = page.getByRole("group", { name: "العملة" });
  const sorting = page.getByLabel("ترتيب المنتجات");

  await currencyGroup.getByRole("button", { name: "USD" }).click();
  await sorting.selectOption("price");
  await expect.poll(() => productIds(page)).toEqual(["p2", "p3"]);

  await conditionGroup.getByRole("button", { name: "مستعمل" }).click();
  await expect(productCards(page)).toHaveCount(1);
  await expect(page.locator('a[href="/product?id=p3"]')).toContainText("$250");
  await expect(page.locator('a[href="/product?id=p3"]')).toContainText("1 محل");

  await conditionGroup.getByRole("button", { name: "جديد" }).click();
  await expect(productCards(page)).toHaveCount(1);
  await expect(page.locator('a[href="/product?id=p2"]')).toContainText("$230");
});

test("seven-day-old offers show stale badges without mobile or desktop overflow", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-04T12:00:00Z") });
  await page.goto("/");
  await expect(page.getByText("سعر قديم", { exact: true })).toHaveCount(2);
  await expect(page.getByText(/آخر تحديث:/)).toHaveCount(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});
