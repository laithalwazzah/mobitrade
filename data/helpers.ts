import {
  products,
  shops,
  type Product,
  type Offer,
  type OfferCondition,
} from "./products";

export function getShop(id: string) {
  return shops.find((s) => s.id === id);
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function sortedOffers(product: Product): Offer[] {
  return [...product.offers].sort(
    (a, b) =>
      a.price - b.price ||
      (a.condition === b.condition ? 0 : a.condition === "new" ? -1 : 1),
  );
}

export function lowestOffer(
  product: Product,
  condition?: OfferCondition,
): Offer | undefined {
  const offers = condition
    ? product.offers.filter((offer) => offer.condition === condition)
    : product.offers;
  return sortedOffers({ ...product, offers })[0];
}

export function conditionLabel(condition: OfferCondition) {
  return condition === "new" ? "جديد" : "مستعمل";
}

export function findProduct(
  brand: string,
  name: string,
  storage: string,
  network?: "4G" | "5G",
) {
  return products.find(
    (product) =>
      product.brand === brand &&
      product.name === name &&
      product.storage === storage &&
      (!network || product.network === network),
  );
}

export function formatPrice(offer: Offer) {
  const symbol = offer.currency === "USD" ? "$" : " ل.س";
  return offer.currency === "USD"
    ? `${symbol}${offer.price}`
    : `${offer.price.toLocaleString("en-US")}${symbol}`;
}

export function getShopOffers(shopId: string) {
  return products
    .map((product) => ({
      product,
      offer: product.offers.find((offer) => offer.shopId === shopId),
    }))
    .filter(
      (item): item is { product: Product; offer: Offer } => Boolean(item.offer),
    );
}