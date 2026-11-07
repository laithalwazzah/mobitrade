import { expect, test } from "@playwright/test";
import {
  delayedLiveOffer,
  installDeferredCatalogLoader,
} from "./catalog-loader-harness";

const loadingHeading = /جارٍ تحميل أحدث الأسعار/;
const notFoundHeading = "هذا المنتج غير موجود";
const unrelatedProductHeading = /Galaxy|iPhone|Realme/;

test("known static product renders immediately while live loading is pending", async ({
  page,
}) => {
  await installDeferredCatalogLoader(page);
  await page.goto("/product?id=p2");

  await expect(page.getByRole("heading", { name: "Galaxy A32" })).toBeVisible();
  await expect(page.getByRole("heading", { name: loadingHeading })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: notFoundHeading })).toHaveCount(0);
});

test("unknown live product stays loading without not-found or an unrelated product", async ({
  page,
}) => {
  await installDeferredCatalogLoader(page);
  await page.goto("/product?id=live-test-delayed");

  await expect(page.getByRole("heading", { name: loadingHeading })).toBeVisible();
  await expect(page.getByRole("heading", { name: notFoundHeading })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: unrelatedProductHeading }),
  ).toHaveCount(0);
});

test("delayed live product renders after the controlled loader resolves", async ({
  page,
}) => {
  const loader = await installDeferredCatalogLoader(page);
  await page.goto(
    "/product?id=live-testbrand-test-delayed-phone-64gb-4g",
  );
  await expect(page.getByRole("heading", { name: loadingHeading })).toBeVisible();

  await loader.resolve([delayedLiveOffer]);

  await expect(
    page.getByRole("heading", { name: "TEST Delayed Phone" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: notFoundHeading })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: unrelatedProductHeading }),
  ).toHaveCount(0);
});

test("completed live loading without the product renders not-found", async ({
  page,
}) => {
  const loader = await installDeferredCatalogLoader(page);
  await page.goto("/product?id=live-test-missing");
  await expect(page.getByRole("heading", { name: loadingHeading })).toBeVisible();

  await loader.resolve([]);

  await expect(page.getByRole("heading", { name: notFoundHeading })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: unrelatedProductHeading }),
  ).toHaveCount(0);
});

test("live loader failure uses the safe static-data fallback", async ({ page }) => {
  const loader = await installDeferredCatalogLoader(page);
  await page.goto("/");

  await loader.reject();

  await expect(
    page.getByText("تعذر تحميل أحدث الأسعار، يتم عرض البيانات المحفوظة"),
  ).toBeVisible();
  await expect(page.getByText("Galaxy A32", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("iPhone 11", { exact: true }).first()).toBeVisible();
});
