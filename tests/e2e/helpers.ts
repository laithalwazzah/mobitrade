import { expect, type Page, type TestInfo } from "@playwright/test";

export function watchPage(page: Page, allowFailedRequest?: (url: string) => boolean) {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("ERR_ABORTED")) {
      const text = message.text();
      const category = text.includes("404")
        ? "404"
        : text.toLowerCase().includes("firestore")
          ? "firestore"
          : text.toLowerCase().includes("hydration")
            ? "hydration"
            : "other";
      problems.push(`browser console error (${category})`);
    }
    if (message.text().toLowerCase().includes("hydration")) {
      problems.push("React hydration warning");
    }
  });
  page.on("pageerror", () => problems.push("uncaught page error"));
  page.on("requestfailed", (request) => {
    const aborted = request.failure()?.errorText.includes("ERR_ABORTED");
    if (!aborted && !allowFailedRequest?.(request.url())) {
      problems.push(`failed request (${new URL(request.url()).hostname})`);
    }
  });
  return () => expect(problems, problems.join(", ")).toEqual([]);
}

export async function screenshot(page: Page, testInfo: TestInfo, name: string) {
  await page.screenshot({
    path: `test-artifacts/${testInfo.project.name}-${name}.png`,
    fullPage: true,
  });
}

export async function fillShop(page: Page, phone = "0911111111") {
  await page.getByLabel("اسم المحل").fill("TEST - احذفني");
  await page.getByLabel("المنطقة أو الحي").fill("TEST Area");
  await page.getByLabel("العنوان التفصيلي").fill("TEST Address");
  await page.getByLabel("رقم واتساب المحل").fill(phone);
  await page.getByLabel("رقم واتساب المحل").blur();
}

export async function fillCatalogOffer(
  page: Page,
  options: { condition?: "جديد" | "مستعمل"; price?: string } = {},
) {
  const row = page.locator("fieldset").first();
  await row.getByLabel("الشركة").selectOption("Samsung");
  await row.getByLabel("الموديل").selectOption({ label: "Galaxy A32" });
  await row.getByLabel("السعة").selectOption("128GB");
  await row.getByRole("button", { name: options.condition ?? "مستعمل", exact: true }).click();
  await row.getByLabel("السعر").fill(options.price ?? "100");
}

export async function fillCustomOffer(
  page: Page,
  name: string,
  options: { condition?: "جديد" | "مستعمل"; price?: string; currency?: "دولار" | "ليرة" } = {},
) {
  const row = page.locator("fieldset").first();
  await row.getByLabel("الشركة").selectOption("Samsung");
  await row.getByLabel("الموديل").selectOption("__other__");
  await row.getByLabel("اسم الموديل").fill(name);
  await row.getByLabel("السعة").fill("64GB");
  await row.getByRole("button", { name: options.condition ?? "جديد", exact: true }).click();
  await row.getByLabel("الشبكة").selectOption("4G");
  await row.getByLabel("السعر").fill(options.price ?? "100");
  if (options.currency) await row.getByRole("button", { name: options.currency, exact: true }).click();
}
