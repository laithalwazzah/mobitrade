import type { Page } from "@playwright/test";
import type { LiveOfferDocument } from "../../lib/liveOffer";

type CatalogLoaderControl = {
  resolve: (offers: LiveOfferDocument[] | null) => void;
  reject: () => void;
};

declare global {
  interface Window {
    __SA3ERLI_E2E_CATALOG_CONTROL__?: CatalogLoaderControl;
  }
}

export async function installDeferredCatalogLoader(page: Page) {
  await page.addInitScript(() => {
    let resolveLoader!: (offers: LiveOfferDocument[] | null) => void;
    let rejectLoader!: () => void;
    const result = new Promise<LiveOfferDocument[] | null>((resolve, reject) => {
      resolveLoader = resolve;
      rejectLoader = () => reject(new Error("Deterministic catalog failure."));
    });

    window.__SA3ERLI_E2E_CATALOG_LOADER__ = () => result;
    window.__SA3ERLI_E2E_CATALOG_CONTROL__ = {
      resolve: resolveLoader,
      reject: rejectLoader,
    };
  });

  return {
    resolve: (offers: LiveOfferDocument[] | null) =>
      page.evaluate((value) => {
        window.__SA3ERLI_E2E_CATALOG_CONTROL__?.resolve(value);
      }, offers),
    reject: () =>
      page.evaluate(() => {
        window.__SA3ERLI_E2E_CATALOG_CONTROL__?.reject();
      }),
  };
}

export const delayedLiveOffer: LiveOfferDocument = {
  id: "963911111111_testbrand-test-delayed-phone-64gb-4g_new",
  shop: {
    name: "TEST Shop",
    area: "TEST Area",
    address: "TEST Address",
    whatsapp: "963911111111",
  },
  product: {
    brand: "TestBrand",
    name: "TEST Delayed Phone",
    storage: "64GB",
    network: "4G",
  },
  condition: "new",
  price: 100,
  currency: "USD",
  updatedAt: "2026-11-07",
  updatedAtMillis: Date.UTC(2026, 10, 7),
};
