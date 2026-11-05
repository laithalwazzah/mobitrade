import { expect, test } from "@playwright/test";

const password = "Sprint05-Dummy-Only!";

test("frontend submits and restores a merchant application through the trusted API", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  const email = testInfo.project.name === "mobile" ? "verified-owner@example.test" : "second-owner@example.test";

  await page.goto("/login?returnTo=/add");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator("form button").first().click();
  await page.waitForURL(/\/add\/?$/);
  await expect(page.locator("#merchant-name")).toBeVisible();

  await page.locator("#merchant-name").fill("  TEST   Sprint 06 Shop  ");
  await page.locator("#merchant-area").fill("TEST Area");
  await page.locator("#merchant-address").fill("TEST Address");
  await page.locator("#merchant-whatsapp").fill("0911111111");
  await page.locator("#commercial-record").setInputFiles({
    name: "record.png",
    mimeType: "image/png",
    buffer: Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(24)]),
  });
  const responsePromise = page.waitForResponse((response) => response.url().endsWith("/api/v1/merchant-applications") && response.request().method() === "POST");
  await page.locator('form button[type="submit"]').click();
  const response = await responsePromise;
  expect(response.status()).toBe(201);
  await expect(page.locator("form")).toHaveCount(0);

  await page.reload();
  await expect(page.locator("form")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(errors).toEqual([]);
});
