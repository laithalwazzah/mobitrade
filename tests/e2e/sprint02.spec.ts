import { expect, test, type Page } from "@playwright/test";
import { watchPage } from "./helpers";

const responsivePaths = [
  "/",
  "/add",
  "/product?id=p2",
  "/shop?id=shop3",
  "/compare",
];

async function expectNoPageOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.route("**/firestore.googleapis.com/**", (route) => route.abort());
});

test("Sprint 02 responsive layouts have no page overflow at required widths", async ({ page }) => {
  const clean = watchPage(page, (url) => url.includes("firestore.googleapis.com"));

  for (const width of [320, 375, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: width < 768 ? 812 : 900 });
    for (const path of responsivePaths) {
      if (path === "/product?id=p2" || path === "/compare") {
        await page.goto("/");
        await page.evaluate(
          ({ keys }) => localStorage.setItem("sa3erli-compare-products", JSON.stringify(keys)),
          {
            keys:
              path === "/compare"
                ? ["samsung-galaxy-a32-128gb-4g", "apple-iphone-11-128gb-4g"]
                : ["samsung-galaxy-a32-128gb-4g"],
          },
        );
      }
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expectNoPageOverflow(page);
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      if (path === "/product?id=p2") {
        const trayButton = page.getByRole("button", { name: /المقارنة 1/ });
        await expect(trayButton).toBeVisible();
        const box = await trayButton.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      }
      if (path === "/compare") {
        await expect(page.getByRole("region", { name: "جدول مقارنة الأجهزة" })).toBeVisible();
      }
    }
  }

  clean();
});

test("long Arabic and English form content stays inside the 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto("/add");
  const longValue = "TEST نص عربي طويل Long-English-Content-Without-Spaces-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  await page.getByLabel("اسم المحل").fill(longValue);
  await page.getByLabel("المنطقة أو الحي").fill(longValue);
  await page.getByLabel("العنوان التفصيلي").fill(longValue.repeat(2));
  await expectNoPageOverflow(page);
  await expect(page.getByRole("heading", { name: "بيانات المحل" })).toBeVisible();
});

test("skip link, landmarks, focus visibility and keyboard controls are accessible", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "تخطَّ إلى المحتوى الرئيسي" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  const outline = await skipLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(outline.style).not.toBe("none");
  expect(Number.parseFloat(outline.width)).toBeGreaterThan(0);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("header nav[aria-label='التنقل الرئيسي']")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("footer")).toBeVisible();

  const used = page.getByRole("group", { name: "الحالة" }).getByRole("button", { name: "مستعمل" });
  await used.focus();
  await page.keyboard.press("Enter");
  await expect(used).toHaveAttribute("aria-pressed", "true");
});

test("comparison tray does not trap keyboard focus", async ({ page }) => {
  await page.goto("/product?id=p2");
  await page.getByRole("button", { name: "أضف للمقارنة" }).click();
  await page.getByRole("button", { name: /المقارنة 1/ }).click();
  const tray = page.getByRole("complementary", { name: "شريط المقارنة" });
  await expect(tray).toBeVisible();
  await tray.getByRole("button", { name: "مسح الكل" }).focus();
  await page.keyboard.press("Tab");
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.closest("aside") === null))
    .toBe(true);
});

test("reduced motion disables decorative animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const animated = page.locator(".animate-fade-up").first();
  await expect(animated).toBeVisible();
  await expect.poll(() => animated.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
});

test("404 and invalid runtime ids provide friendly recovery", async ({ page }) => {
  const response = await page.goto("/definitely-not-a-saarli-route");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "يبدو أن هذا الرابط غير صحيح" })).toBeVisible();
  await expect(page.getByRole("link", { name: "العودة إلى الرئيسية" })).toHaveAttribute("href", "/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);

  await page.goto("/product?id=not-real");
  await expect(page.getByRole("heading", { name: "هذا المنتج غير موجود" })).toBeVisible();
  await page.goto("/shop?id=not-real");
  await expect(page.getByRole("heading", { name: "هذا المحل غير موجود" })).toBeVisible();
});

test("metadata, robots and query-based internal routes are correct", async ({ page, request }) => {
  const expectations = [
    ["/", /أسعار الموبايلات في اللاذقية/],
    ["/add", /إضافة أسعار محل/],
    ["/product?id=p2", /تفاصيل الموبايل والأسعار/],
    ["/shop?id=shop3", /تفاصيل المحل وعروضه/],
    ["/compare", /مقارنة الموبايلات/],
  ] as const;

  for (const [path, title] of expectations) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /سعّرلي/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")).filter(Boolean),
    );
    for (const href of hrefs) {
      expect(href).not.toMatch(/^\/(product|shop)\//);
      if (href?.startsWith("/product") || href?.startsWith("/shop")) {
        expect(href).toContain("?id=");
      }
    }
  }

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Allow: /");
  expect((await request.get("/sitemap.xml")).status()).toBe(404);
});

test("media reserves stable space and loads without distortion", async ({ page }) => {
  await page.goto("/");
  const image = page.locator("article img").first();
  await expect(image).toBeVisible();
  const before = await image.boundingBox();
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  const after = await image.boundingBox();
  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  expect(Math.abs(before!.width - after!.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(before!.height - after!.height)).toBeLessThanOrEqual(1);
  await expect(image).toHaveCSS("object-fit", "contain");
});
