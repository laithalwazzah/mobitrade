import { expect, test } from "@playwright/test";
import { screenshot, watchPage } from "./helpers";

test("1.1 core pages, RTL, Cairo, responsive layout and not-found states", async ({ page }, testInfo) => {
  const clean = watchPage(page);
  for (const path of [
    "/", "/add", "/product?id=p2", "/product?id=p3",
    "/shop?id=shop3", "/shop?id=shop5",
  ]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    expect(await page.locator("body").evaluate((element) => getComputedStyle(element).fontFamily.toLowerCase())).toContain("cairo");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
  await page.goto("/product?id=nope");
  await expect(page.getByRole("heading", { name: "هذا المنتج غير موجود" })).toBeVisible();
  await page.goto("/shop?id=nope");
  await expect(page.getByRole("heading", { name: "هذا المحل غير موجود" })).toBeVisible();
  const response = await page.goto("/unknown-test-url");
  expect(response?.status()).toBe(404);
  await expect(page.getByText(/404|غير موجود/i).first()).toBeVisible();
  await screenshot(page, testInfo, "pages-404");
  clean();
});

test("1.1 unknown runtime id shows loading before not-found", async ({ page }) => {
  const clean = watchPage(page, (url) => url.includes("firestore.googleapis.com"));
  await page.route("**/firestore.googleapis.com/**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.abort();
  });
  await page.goto("/product?id=live-test-unknown");
  await expect(page.getByRole("heading", { name: /جارٍ تحميل أحدث الأسعار/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "هذا المنتج غير موجود" })).toBeVisible();
  clean();
});

test("1.2 add headings are not overlapped at 375, 768 and 1280", async ({ page }, testInfo) => {
  const clean = watchPage(page);
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 812 });
    await page.goto("/add");
    for (const headingText of ["بيانات المحل", "الأسعار والموديلات"]) {
      const heading = page.getByRole("heading", { name: headingText });
      await heading.scrollIntoViewIfNeeded();
      const box = await heading.boundingBox();
      expect(box).not.toBeNull();
      const visibleAtCenter = await heading.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return target === element || Boolean(target && element.contains(target));
      });
      expect(visibleAtCenter).toBe(true);
    }
    await screenshot(page, testInfo, `add-${width}`);
  }
  clean();
});

test("1.3 internal links use query ids and resolve", async ({ page }) => {
  const clean = watchPage(page);
  for (const path of ["/", "/add", "/product?id=p2", "/shop?id=shop3"]) {
    await page.goto(path);
    const links = await page.locator('a[href^="/"]').evaluateAll((elements) =>
      Array.from(new Set(elements.map((element) => element.getAttribute("href")).filter(Boolean))),
    );
    for (const href of links as string[]) {
      expect(href).not.toMatch(/^\/(product|shop)\/[^?]/);
      const response = await page.request.get(href);
      expect(response.status(), href).toBeLessThan(400);
    }
  }
  clean();
});

test("1.4 home filters, brand and search work together", async ({ page }) => {
  const clean = watchPage(page);
  await page.goto("/");
  const iphone = page.locator('a[href="/product?id=p3"]');
  await page.getByRole("button", { name: "مستعمل", exact: true }).click();
  await expect(iphone).toBeVisible();
  await expect(iphone.getByText("مستعمل", { exact: true })).toBeVisible();
  await expect(iphone.getByText("$250", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "جديد", exact: true }).click();
  await expect(iphone).toHaveCount(0);
  await page.getByRole("button", { name: "الكل", exact: true }).last().click();
  await page.getByRole("button", { name: "Samsung", exact: true }).click();
  await page.getByPlaceholder(/ابحث عن موبايل/).fill("Galaxy A32");
  await expect(page.locator('a[href="/product?id=p2"]')).toBeVisible();
  await expect(page.locator('a[href="/product?id=p3"]')).toHaveCount(0);
  await page.getByPlaceholder(/ابحث عن موبايل/).fill("لا توجد نتيجة اختبار");
  await expect(page.getByText(/ما في نتائج مطابقة/)).toBeVisible();
  clean();
});

test("1.5 product and shop details are complete", async ({ page }) => {
  const clean = watchPage(page);
  await page.goto("/product?id=p2");
  await expect(page.getByText("جديد · دولار", { exact: true })).toBeVisible();
  await expect(page.getByText("الأرخص", { exact: true })).toBeVisible();
  await expect(page.getByText("4G", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "واتساب" })).toHaveAttribute("href", /^https:\/\/wa\.me\/963937272727\?text=/);
  await expect(page.getByText(/آخر تحديث:/)).toBeVisible();
  await page.goto("/shop?id=shop3");
  await expect(page.getByText("الزراعة، جانب سور السكن", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "تواصل عبر واتساب" })).toHaveAttribute("href", "https://wa.me/963937272727");
  await expect(page.getByText("Galaxy A32", { exact: true })).toBeVisible();
  clean();
});
