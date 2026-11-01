import test from "node:test";
import assert from "node:assert/strict";
import type { Product, Shop } from "../data/products";
import { lowestOffer } from "../data/helpers";
import { getDuplicateOfferIndexes } from "../lib/duplicateOffers";
import type { LiveOfferDocument } from "../lib/liveOffer";
import { mergeCatalog } from "../lib/mergeCatalog";
import {
  createLiveOfferDocumentId,
  createProductKey,
  type ProductIdentity,
} from "../lib/productKey";
import {
  buildFirestoreWrites,
  type SubmissionPayload,
} from "../lib/submitOffer";

const staticShops: Shop[] = [
  {
    id: "shop-static",
    name: "Static Shop",
    area: "Area",
    address: "Address",
    whatsapp: "963937272727",
  },
];
const staticProducts: Product[] = [
  {
    id: "product-static",
    brand: "Samsung",
    name: "Galaxy A32",
    storage: "128GB",
    network: "4G",
    offers: [
      {
        shopId: "shop-static",
        condition: "used",
        price: 120,
        currency: "USD",
        updatedAt: "2026-01-01",
      },
    ],
  },
];

function liveOffer(
  overrides: Partial<LiveOfferDocument> = {},
): LiveOfferDocument {
  const product = overrides.product ?? {
    brand: "Samsung",
    name: "Galaxy A32",
    storage: "128GB",
    network: "4G",
  };
  const shop = overrides.shop ?? {
    name: "Live Shop",
    area: "Live Area",
    address: "Live Address",
    whatsapp: "963937272727",
  };
  const condition = overrides.condition ?? "used";
  return {
    id: createLiveOfferDocumentId(shop.whatsapp, product, condition),
    shop,
    product,
    condition,
    price: overrides.price ?? 100,
    currency: overrides.currency ?? "USD",
    updatedAt: overrides.updatedAt ?? "2026-02-01",
    ...(overrides.updatedAtMillis !== undefined
      ? { updatedAtMillis: overrides.updatedAtMillis }
      : {}),
    ...(overrides.notes ? { notes: overrides.notes } : {}),
  };
}

test("productKey normalizes English identities and never contains underscores", () => {
  const key = createProductKey({
    brand: "Samsung_Test",
    name: "Galaxy A32",
    storage: "128GB",
    network: "4G",
  });
  assert.equal(key, "samsung-test-galaxy-a32-128gb-4g");
  assert.equal(key.includes("_"), false);
});

test("productKey uses a stable hash for Arabic-only identities", () => {
  const product: ProductIdentity = {
    brand: "Samsung",
    name: "هاتف عربي",
    storage: "64GB",
    network: "4G",
  };
  const first = createProductKey(product);
  assert.match(first, /^hash-[a-z0-9]+$/);
  assert.equal(first, createProductKey(product));
  assert.equal(first.includes("_"), false);
});

test("live offer document id uses normalized phone, product key, and condition", () => {
  const id = createLiveOfferDocumentId(
    "963937272727",
    {
      brand: "Samsung",
      name: "Galaxy A32",
      storage: "128GB",
      network: "4G",
    },
    "used",
  );
  assert.equal(id, "963937272727_samsung-galaxy-a32-128gb-4g_used");
});

test("mergeCatalog matches static product and shop and lets newer live data win", () => {
  const merged = mergeCatalog(staticProducts, staticShops, [liveOffer()]);
  assert.equal(merged.shops.length, 1);
  assert.equal(merged.products.length, 1);
  assert.deepEqual(merged.products[0].offers, [
    {
      shopId: "shop-static",
      condition: "used",
      price: 100,
      currency: "USD",
      updatedAt: "2026-02-01",
    },
  ]);
});

test("mergeCatalog preserves trimmed notes from live offers", () => {
  const merged = mergeCatalog(staticProducts, staticShops, [
    liveOffer({ notes: "  Available today\nCall first  " }),
  ]);
  assert.equal(merged.products[0].offers[0].notes, "Available today\nCall first");
});

test("mergeCatalog omits missing, blank, and invalid live notes", () => {
  const document = liveOffer();
  const documents: unknown[] = [
    document,
    { ...document, notes: "   " },
    { ...document, notes: 42 },
  ];

  for (const liveDocument of documents) {
    const merged = mergeCatalog(staticProducts, staticShops, [liveDocument]);
    assert.equal(merged.products[0].offers.length, 1);
    assert.equal(merged.products[0].offers[0].notes, undefined);
  }
});

test("mergeCatalog keeps newer static conflict and keeps new plus used offers", () => {
  const olderUsed = liveOffer({ updatedAt: "2025-12-01", price: 90 });
  const newOffer = liveOffer({ condition: "new", price: 140 });
  const merged = mergeCatalog(staticProducts, staticShops, [olderUsed, newOffer]);
  assert.equal(merged.products[0].offers.length, 2);
  assert.equal(
    merged.products[0].offers.find((offer) => offer.condition === "used")?.price,
    120,
  );
  assert.equal(
    merged.products[0].offers.find((offer) => offer.condition === "new")?.price,
    140,
  );
});

test("mergeCatalog creates virtual products and newest virtual shop metadata", () => {
  const shop = {
    name: "Older Name",
    area: "Area",
    address: "Old Address",
    whatsapp: "963911111111",
  };
  const productOne = {
    brand: "Test",
    name: "Phone X",
    storage: "64GB",
  };
  const productTwo = {
    brand: "Test",
    name: "Phone Y",
    storage: "128GB",
    network: "5G" as const,
  };
  const older = liveOffer({
    shop,
    product: productOne,
    updatedAt: "2026-04-01",
    updatedAtMillis: 1,
  });
  const newer = liveOffer({
    shop: { ...shop, name: "Newest Name", address: "New Address" },
    product: productTwo,
    condition: "new",
    updatedAt: "2026-04-01",
    updatedAtMillis: 2,
  });
  const merged = mergeCatalog(staticProducts, staticShops, [older, newer]);
  const virtualShop = merged.shops.find(
    (item) => item.id === "live-963911111111",
  );
  assert.equal(virtualShop?.name, "Newest Name");
  assert.equal(virtualShop?.address, "New Address");
  assert.ok(
    merged.products.some(
      (product) => product.id === `live-${createProductKey(productOne)}`,
    ),
  );
});

test("mergeCatalog skips malformed documents", () => {
  const merged = mergeCatalog(staticProducts, staticShops, [
    { id: "bad", price: -1 },
  ]);
  assert.deepEqual(merged, {
    products: staticProducts,
    shops: staticShops,
  });
});

test("cheapest offers are calculated separately per currency", () => {
  const product: Product = {
    id: "mixed",
    brand: "Test",
    name: "Mixed",
    storage: "64GB",
    offers: [
      {
        shopId: "one",
        condition: "new",
        currency: "USD",
        price: 100,
        updatedAt: "2026-01-01",
      },
      {
        shopId: "two",
        condition: "new",
        currency: "SYP",
        price: 500,
        updatedAt: "2026-01-01",
      },
      {
        shopId: "three",
        condition: "new",
        currency: "USD",
        price: 90,
        updatedAt: "2026-01-01",
      },
    ],
  };
  assert.equal(lowestOffer(product, "new", "USD")?.price, 90);
  assert.equal(lowestOffer(product, "new", "SYP")?.price, 500);
});

test("duplicate detection catches same product and condition only", () => {
  const base = {
    brand: "Samsung",
    name: "Galaxy A32",
    storage: "128GB",
    network: "4G" as const,
  };
  assert.deepEqual(
    getDuplicateOfferIndexes([
      { ...base, condition: "used" },
      { ...base, condition: "used" },
      { ...base, condition: "new" },
    ]),
    [0, 1],
  );
});

function hasUndefined(value: unknown): boolean {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.some(hasUndefined);
  if (typeof value === "object" && value !== null) {
    return Object.values(value).some(hasUndefined);
  }
  return false;
}

test("Firestore write payload matches the allowed rules contract", () => {
  const payload: SubmissionPayload = {
    shop: {
      name: "Test Shop",
      area: "Area",
      address: "Address",
      whatsapp: "963911111111",
    },
    offers: [
      {
        brand: "Test",
        name: "Phone X",
        storage: "64GB",
        condition: "new",
        price: 100,
        currency: "USD",
      },
    ],
  };
  const timestamp = { serverTimestamp: true };
  const writes = buildFirestoreWrites(payload, "client-id", timestamp);
  const live = writes.liveOffers[0];

  assert.deepEqual(Object.keys(live.data).sort(), [
    "condition",
    "currency",
    "price",
    "product",
    "shop",
    "updatedAt",
  ]);
  assert.deepEqual(Object.keys(live.data.product).sort(), [
    "brand",
    "name",
    "storage",
  ]);
  assert.deepEqual(Object.keys(writes.submission.data).sort(), [
    "clientId",
    "createdAt",
    "offers",
    "shop",
    "status",
  ]);
  assert.equal(hasUndefined(writes), false);
  assert.equal(live.id.split("_")[0], payload.shop.whatsapp);
});
