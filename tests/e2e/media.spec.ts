import { expect, test, type Locator, type Page } from "@playwright/test";

const storageKey = "sa3erli-compare-products";
const galaxyKey = "samsung-galaxy-a32-128gb-4g";
const iphoneKey = "apple-iphone-11-128gb-4g";

async function expectLoadedImage(image: Locator) {
  await expect(image).toHaveAttribute("alt", /.+/);
  await expect
    .poll(() =>
      image.evaluate(
        (element) =>
          element instanceof HTMLImageElement &&
          element.complete &&
          element.naturalWidth > 0 &&
          element.naturalHeight > 0,
      ),
    )
    .toBe(true);
}

async function expectNoPageOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.route("**/firestore.googleapis.com/**", (route) => route.abort());
});

test("device images and brand logos load without shifting card layout", async ({ page }) => {
  await page.route("**/images/devices/samsung-galaxy-a32-4g.webp", async (route) => {
    const response = await route.fetch();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({ response });
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const card = page.locator("article", {
    has: page.locator('a[href="/product?id=p2"]'),
  });
  const media = card.locator('[data-product-media="image"]');
  const before = await media.boundingBox();
  expect(before).not.toBeNull();
  await expectLoadedImage(media.locator("img"));
  const after = await media.boundingBox();
  expect(after).not.toBeNull();
  expect(after!.width).toBe(before!.width);
  expect(after!.height).toBe(before!.height);
  expect(after!.height).toBeGreaterThanOrEqual(170);

  await expectLoadedImage(card.locator('img[src*="/images/brands/"]'));
  const samsungFilter = page.getByRole("button", { name: /Samsung/ });
  await expectLoadedImage(samsungFilter.locator("img"));
  await expectNoPageOverflow(page);
});

test("product details and comparison render local media with Arabic alt text", async ({ page }) => {
  await page.goto("/product?id=p2");
  const detailMedia = page.locator('main, section').locator('[data-product-media="image"]').first();
  await expectLoadedImage(detailMedia.locator("img"));
  await expect(detailMedia.locator("img")).toHaveAttribute("alt", /صورة Samsung Galaxy A32 4G/);
  await expectLoadedImage(page.locator('img[src*="/images/brands/"]').first());
  await expectNoPageOverflow(page);

  await page.evaluate(
    ({ key, values }) => localStorage.setItem(key, JSON.stringify(values)),
    { key: storageKey, values: [galaxyKey, iphoneKey] },
  );
  await page.goto("/compare");
  const comparisonImages = page.locator('thead [data-product-media="image"] img');
  await expect(comparisonImages).toHaveCount(2);
  for (let index = 0; index < 2; index += 1) {
    await expectLoadedImage(comparisonImages.nth(index));
  }
  await expect(page.locator('thead img[src*="/images/brands/"]')).toHaveCount(2);
  await expectNoPageOverflow(page);
});

test("failed or unavailable product image uses the polished fallback", async ({ page }) => {
  await page.route("**/images/devices/samsung-galaxy-a32-4g.webp", (route) => route.abort());
  await page.goto("/product?id=p2");
  const fallback = page.locator('[data-product-media="fallback"]');
  await expect(fallback).toBeVisible();
  await expect(fallback).toContainText("صورة غير متوفرة");
  const box = await fallback.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(220);
  await expectNoPageOverflow(page);
});
