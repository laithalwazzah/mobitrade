import test from "node:test";
import assert from "node:assert/strict";
import type { Product } from "../data/products";
import {
  displayedOffer,
  filterAndSortCatalog,
  isOfferStale,
  uniqueMatchingShopCount,
  utcCalendarAgeDays,
  utcDateValue,
  type CatalogFilters,
} from "../lib/catalogView";

const products: Product[] = [
  {
    id: "alpha",
    brand: "Samsung",
    name: "Alpha",
    storage: "128GB",
    network: "4G",
    offers: [
      { shopId: "one", condition: "new", currency: "USD", price: 300, updatedAt: "2026-10-30" },
      { shopId: "one", condition: "used", currency: "SYP", price: 2_000_000, updatedAt: "2026-10-29" },
      { shopId: "two", condition: "used", currency: "SYP", price: 1_900_000, updatedAt: "2026-10-28" },
    ],
  },
  {
    id: "beta",
    brand: "Apple",
    name: "Beta",
    storage: "64GB",
    network: "4G",
    offers: [
      { shopId: "three", condition: "new", currency: "USD", price: 200, updatedAt: "2026-10-31" },
    ],
  },
  {
    id: "gamma",
    brand: "Samsung",
    name: "Gamma",
    storage: "256GB",
    network: "5G",
    offers: [
      { shopId: "four", condition: "used", currency: "USD", price: 100, updatedAt: "invalid" },
    ],
  },
];

const defaultFilters: CatalogFilters = {
  query: "",
  brand: "all",
  condition: "all",
  currency: "all",
  sort: "newest",
};

test("freshness uses UTC calendar days with an inclusive seven-day boundary", () => {
  const now = new Date("2026-11-02T23:59:59-08:00");
  assert.equal(utcCalendarAgeDays("2026-10-27", now), 7);
  assert.equal(isOfferStale("2026-10-27", now), true);
  assert.equal(isOfferStale("2026-10-28", now), false);
  assert.equal(isOfferStale("2026-11-04", now), false);
});

test("freshness rejects invalid and non-existent date-only values", () => {
  const now = new Date("2026-11-02T12:00:00Z");
  for (const value of ["", "2026-02-30", "2026-2-03", "not-a-date"]) {
    assert.equal(utcDateValue(value), null);
    assert.equal(utcCalendarAgeDays(value, now), null);
    assert.equal(isOfferStale(value, now), false);
  }
  assert.notEqual(utcDateValue("2024-02-29"), null);
});

test("displayed offers preserve currency separation and current condition preference", () => {
  assert.equal(displayedOffer(products[0], "all", "all")?.price, 300);
  assert.equal(displayedOffer(products[0], "used", "all")?.price, 1_900_000);
  assert.equal(displayedOffer(products[0], "all", "SYP")?.price, 1_900_000);
  assert.equal(displayedOffer(products[0], "new", "SYP"), undefined);
});

test("catalog sorting supports newest, name, and price without mixed currencies", () => {
  assert.deepEqual(
    filterAndSortCatalog(products, defaultFilters).map((item) => item.product.id),
    ["beta", "alpha", "gamma"],
  );
  assert.deepEqual(
    filterAndSortCatalog(products, { ...defaultFilters, sort: "name" }).map((item) => item.product.id),
    ["alpha", "beta", "gamma"],
  );
  assert.deepEqual(
    filterAndSortCatalog(products, { ...defaultFilters, currency: "USD", sort: "price" }).map((item) => item.product.id),
    ["gamma", "beta", "alpha"],
  );
  assert.deepEqual(
    filterAndSortCatalog(products, { ...defaultFilters, sort: "price" }).map((item) => item.product.id),
    ["beta", "alpha", "gamma"],
  );
});

test("search, brand, condition, and currency combine and remove products without matches", () => {
  const result = filterAndSortCatalog(products, {
    query: "alp",
    brand: "Samsung",
    condition: "used",
    currency: "SYP",
    sort: "price",
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].product.id, "alpha");
  assert.equal(result[0].displayedOffer.price, 1_900_000);
  assert.equal(uniqueMatchingShopCount(result[0].product, "used", "SYP"), 2);

  assert.deepEqual(
    filterAndSortCatalog(products, {
      ...defaultFilters,
      brand: "Apple",
      condition: "used",
      currency: "SYP",
    }),
    [],
  );
});
