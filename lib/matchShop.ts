import type { Shop } from "@/data/products";

// Use before adding a shop to prevent duplicate WhatsApp entries.
export function matchShop(
  shops: readonly Shop[],
  whatsapp: string,
): Shop | undefined {
  return shops.find((shop) => shop.whatsapp === whatsapp);
}
