import type { OfferCondition } from "@/data/products";
import { createProductKey, type ProductIdentity } from "@/lib/productKey";

export type DuplicateOfferCandidate = ProductIdentity & {
  condition: OfferCondition | "";
};

export function getDuplicateOfferIndexes(
  offers: readonly DuplicateOfferCandidate[],
) {
  const indexesByKey = new Map<string, number[]>();

  offers.forEach((offer, index) => {
    if (!offer.brand || !offer.name || !offer.storage || !offer.condition) return;
    const key = `${createProductKey(offer)}|${offer.condition}`;
    indexesByKey.set(key, [...(indexesByKey.get(key) ?? []), index]);
  });

  return Array.from(indexesByKey.values())
    .filter((indexes) => indexes.length > 1)
    .flat();
}
