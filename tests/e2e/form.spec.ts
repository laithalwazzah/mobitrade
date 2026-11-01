import { expect, test } from "@playwright/test";
import { fillCatalogOffer, fillShop, watchPage } from "./helpers";

test("1.6 inline validation, phone normalization, price limits, duplicates and ten-row limit", async ({ page }) => {
  const clean = watchPage(page);
  await page.goto("/add");
  await page.getByLabel("اسم المحل").fill("TEST - احذفني");
  await page.getByRole("button", { name: "أرسل الأسعار" }).click();
  await expect(page.getByText("أدخل المنطقة أو الحي.")).toBeVisible();
  await expect(page.getByLabel("اسم المحل")).toHaveValue("TEST - احذفني");

  const phone = page.getByLabel("رقم واتساب المحل");
  for (const [input, normalized] of [
    ["0912345678", "963912345678"],
    ["912345678", "963912345678"],
    ["+963 912 345 678", "963912345678"],
    ["00963912345678", "963912345678"],
  ]) {
    await phone.fill(input);
    await phone.blur();
    await expect(phone).toHaveValue(normalized);
  }
  await phone.fill("9635454861215");
  await page.getByRole("button", { name: "أرسل الأسعار" }).click();
  await expect(page.getByText(/رقم واتساب غير صحيح/)).toBeVisible();

  await page.reload();
  await fillShop(page);
  await fillCatalogOffer(page, { price: "0" });
  await page.getByRole("button", { name: "أرسل الأسعار" }).click();
  await expect(page.getByText(/أدخل سعراً أكبر من صفر/)).toBeVisible();
  await page.getByLabel("السعر").fill("-1");
  await page.getByRole("button", { name: "أرسل الأسعار" }).click();
  await expect(page.getByText(/أدخل سعراً أكبر من صفر/)).toBeVisible();
  await page.getByLabel("السعر").fill("");
  await page.getByRole("button", { name: "أرسل الأسعار" }).click();
  await expect(page.getByText(/أدخل سعراً أكبر من صفر/)).toBeVisible();

  await page.getByLabel("السعر").fill("100");
  await page.getByRole("button", { name: "أضف موديل ثاني" }).click();
  const second = page.locator("fieldset").nth(1);
  await second.getByLabel("الشركة").selectOption("Samsung");
  await second.getByLabel("الموديل").selectOption({ label: "Galaxy A32" });
  await second.getByLabel("السعة").selectOption("128GB");
  await second.getByRole("button", { name: "مستعمل", exact: true }).click();
  await second.getByLabel("السعر").fill("90");
  await page.getByRole("button", { name: "أرسل الأسعار" }).click();
  await expect(page.getByText(/هذا العرض مكرر/).first()).toBeVisible();

  await page.reload();
  const row = page.locator("fieldset").first();
  await row.getByLabel("الشركة").selectOption("Samsung");
  await row.getByLabel("الموديل").selectOption("__other__");
  await expect(row.getByLabel("اسم الموديل")).toBeVisible();
  await row.getByLabel("اسم الموديل").fill("TEST Custom Validation");
  await row.getByLabel("السعة").fill("64GB");
  await expect(row.getByLabel("الشبكة").locator("option")).toHaveText(["اختر الشبكة", "4G", "5G"]);
  await page.reload();
  const catalogRow = page.locator("fieldset").first();
  await catalogRow.getByLabel("الشركة").selectOption("Samsung");
  await catalogRow.getByLabel("الموديل").selectOption({ label: "Galaxy A15" });
  await expect(catalogRow.getByLabel("السعة").locator("option")).toHaveText(["اختر السعة", "128GB", "256GB"]);
  await expect(catalogRow.getByLabel("الشبكة").locator("option")).toHaveText(["اختر الشبكة", "4G", "5G"]);

  await page.reload();
  for (let index = 1; index < 10; index += 1) {
    await page.getByRole("button", { name: "أضف موديل ثاني" }).click();
  }
  await expect(page.locator("fieldset")).toHaveCount(10);
  await expect(page.getByRole("button", { name: "أضف موديل ثاني" })).toHaveCount(0);
  clean();
});

test("1.7 remember checkbox and clear button control localStorage", async ({ page }) => {
  const clean = watchPage(page);
  await page.goto("/add");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const remember = page.getByLabel("تذكّر بيانات محلي على هذا الجهاز");
  await expect(remember).not.toBeChecked();
  await fillShop(page);
  expect(await page.evaluate(() => localStorage.getItem("sa3erli-shop-info"))).toBeNull();
  await remember.check();
  expect(await page.evaluate(() => localStorage.getItem("sa3erli-shop-info"))).not.toBeNull();
  await page.reload();
  await expect(page.getByLabel("اسم المحل")).toHaveValue("TEST - احذفني");
  await expect(remember).toBeChecked();
  await remember.uncheck();
  expect(await page.evaluate(() => localStorage.getItem("sa3erli-shop-info"))).toBeNull();
  await remember.check();
  await page.getByRole("button", { name: "مسح بيانات المحل" }).click();
  await expect(page.getByLabel("اسم المحل")).toHaveValue("");
  expect(await page.evaluate(() => localStorage.getItem("sa3erli-shop-info"))).toBeNull();
  clean();
});
