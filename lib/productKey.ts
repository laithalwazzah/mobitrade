import type { OfferCondition } from "@/data/products";

export type ProductIdentity = {
  brand: string;
  name: string;
  storage: string;
  network?: "4G" | "5G";
};

function shortHash(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function createProductKey(product: ProductIdentity) {
  const original = `${product.brand}-${product.name}-${product.storage}-${product.network ?? "any"}`.toLowerCase();
  if (!/[a-z0-9]/i.test(product.name)) {
    return `hash-${shortHash(original)}`;
  }
  const normalized = original
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || `hash-${shortHash(original)}`;
}

export function createLiveOfferDocumentId(
  whatsapp: string,
  product: ProductIdentity,
  condition: OfferCondition,
) {
  if (!/^9639\d{8}$/.test(whatsapp)) {
    throw new Error("Invalid normalized Syrian WhatsApp number.");
  }
  return `${whatsapp}_${createProductKey(product)}_${condition}`;
}
