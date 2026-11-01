import type { Product, Shop } from "@/data/products";
import { findProduct } from "@/data/helpers";
import { parseLiveOfferDocument } from "@/lib/liveOffer";
import { matchShop } from "@/lib/matchShop";
import { createProductKey } from "@/lib/productKey";

export type MergedCatalog = {
  products: Product[];
  shops: Shop[];
};

export function mergeCatalog(
  staticProducts: readonly Product[],
  staticShops: readonly Shop[],
  liveDocuments: readonly unknown[],
): MergedCatalog {
  const liveOffers = liveDocuments
    .map(parseLiveOfferDocument)
    .filter((document) => document !== null);
  const shops = staticShops.map((shop) => ({ ...shop }));
  const products = staticProducts.map((product) => ({
    ...product,
    offers: product.offers.map((offer) => ({ ...offer })),
  }));

  const newestShopDocument = new Map<string, (typeof liveOffers)[number]>();
  for (const liveOffer of liveOffers) {
    const current = newestShopDocument.get(liveOffer.shop.whatsapp);
    const liveTime =
      liveOffer.updatedAtMillis ?? Date.parse(`${liveOffer.updatedAt}T00:00:00`);
    const currentTime = current
      ? current.updatedAtMillis ?? Date.parse(`${current.updatedAt}T00:00:00`)
      : Number.NEGATIVE_INFINITY;
    if (!current || liveTime > currentTime) {
      newestShopDocument.set(liveOffer.shop.whatsapp, liveOffer);
    }
  }

  for (const liveOffer of newestShopDocument.values()) {
    if (!matchShop(shops, liveOffer.shop.whatsapp)) {
      shops.push({
        id: `live-${liveOffer.shop.whatsapp}`,
        ...liveOffer.shop,
      });
    }
  }

  for (const liveOffer of liveOffers) {
    const shop = matchShop(shops, liveOffer.shop.whatsapp);
    if (!shop) continue;

    let product = findProduct(
      liveOffer.product.brand,
      liveOffer.product.name,
      liveOffer.product.storage,
      liveOffer.product.network,
      products,
    );
    if (!product) {
      product = {
        id: `live-${createProductKey(liveOffer.product)}`,
        ...liveOffer.product,
        offers: [],
      };
      products.push(product);
    }

    const nextOffer = {
      shopId: shop.id,
      price: liveOffer.price,
      currency: liveOffer.currency,
      updatedAt: liveOffer.updatedAt,
      condition: liveOffer.condition,
      ...(liveOffer.notes ? { notes: liveOffer.notes } : {}),
    };
    const conflictIndex = product.offers.findIndex(
      (offer) =>
        offer.shopId === shop.id && offer.condition === liveOffer.condition,
    );

    if (conflictIndex === -1) {
      product.offers.push(nextOffer);
    } else if (
      liveOffer.updatedAt >= product.offers[conflictIndex].updatedAt
    ) {
      product.offers[conflictIndex] = nextOffer;
    }
  }

  return { products, shops };
}
