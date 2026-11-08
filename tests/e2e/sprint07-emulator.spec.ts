import { expect, test } from "@playwright/test";

const password = "Sprint05-Dummy-Only!";

test("admin dashboard consumes trusted summary/list/detail/document/decision APIs", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/login?returnTo=/admin");
  await page.locator('input[type="email"]').fill("admin-reviewer@example.test");
  await page.locator('input[type="password"]').fill(password);
  await page.locator("form button").first().click();
  await page.waitForURL(/\/admin\/?$/);
  await expect(page.getByText("الملخص العالمي")).toBeVisible();
  await expect(page.getByText("7", { exact: true })).toBeVisible();

  await page.getByLabel("عدد النتائج").selectOption("5");
  const rows = page.locator("article");
  await expect(rows).toHaveCount(5);
  const firstPage = await rows.getByRole("link", { name: "مراجعة الطلب" }).evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  await expect(page.getByRole("button", { name: "التالي" })).toBeEnabled();
  await page.getByRole("button", { name: "التالي" }).click();
  await expect(rows).toHaveCount(2);
  const secondPage = await rows.getByRole("link", { name: "مراجعة الطلب" }).evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(new Set([...firstPage, ...secondPage]).size).toBe(7);
  await page.getByRole("button", { name: "السابق" }).click();
  await expect(rows).toHaveCount(5);
  await expect.poll(() => rows.getByRole("link", { name: "مراجعة الطلب" }).evaluateAll((links) => links.map((link) => link.getAttribute("href")))).toEqual(firstPage);

  await page.getByRole("button", { name: "التالي" }).click();
  await expect(rows).toHaveCount(2);
  await page.getByLabel("الحالة").selectOption("pending");
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeLessThanOrEqual(5);
  await expect(page.getByRole("button", { name: "السابق" })).toBeDisabled();

  const webpRow = rows.filter({ hasText: "TEST pending webp" });
  await expect(webpRow).toHaveCount(1);
  await webpRow.getByRole("link", { name: "مراجعة الطلب" }).click();
  await expect(page.getByRole("heading", { name: "بيانات الطلب" })).toBeVisible();
  const documentResponse = page.waitForResponse((response) => response.url().includes("/document") && response.request().method() === "GET");
  await page.getByRole("button", { name: "عرض الوثيقة" }).click();
  const response = await documentResponse;
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/webp");
  expect(response.headers()["cache-control"]).toContain("private");
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["cache-control"]).toContain("max-age=0");
  expect(response.headers()["pragma"]).toBe("no-cache");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["content-disposition"]).toContain("attachment");
  expect(response.headers()["content-disposition"]).toContain("commercial-record.webp");
  const preview = page.getByAltText("صورة السجل التجاري الخاصة");
  await expect(preview).toBeVisible();
  await expect.poll(() => preview.evaluate((image: HTMLImageElement) => ({ complete: image.complete, width: image.naturalWidth, height: image.naturalHeight }))).toEqual({ complete: true, width: 1, height: 1 });
  await page.getByRole("button", { name: "إغلاق عرض الوثيقة" }).click();

  await page.getByRole("link", { name: "العودة إلى الطلبات" }).click();
  await page.getByLabel("الحالة").selectOption("pending");
  const decisionKind = testInfo.project.name === "mobile" ? "jpeg" : "png";
  await rows.filter({ hasText: `TEST pending ${decisionKind}` }).getByRole("link", { name: "مراجعة الطلب" }).click();
  await page.getByRole("button", { name: "موافقة" }).click();
  const decisionResponse = page.waitForResponse((candidate) => candidate.url().includes("/decision") && candidate.request().method() === "PATCH");
  await page.getByRole("button", { name: "تأكيد القرار" }).click();
  expect((await decisionResponse).status()).toBe(200);
  await expect(page.getByText("تم حفظ القرار بنجاح.")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(errors).toEqual([]);
});
