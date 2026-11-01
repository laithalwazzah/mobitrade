import {
  products,
  shops,
  type Product,
  type Shop,
  type Offer,
  type OfferCondition,
} from "./products";

export function getShop(id: string, shopList: readonly Shop[] = shops) {
  return shopList.find((shop) => shop.id === id);
}

export function getProduct(
  id: string,
  productList: readonly Product[] = products,
) {
  return productList.find((product) => product.id === id);
}

export type OfferGroup = {
  condition: OfferCondition;
  currency: Offer["currency"];
  offers: Offer[];
};

export function sortedOffers(
  product: Product,
  condition: OfferCondition,
  currency: Offer["currency"],
): Offer[] {
  return product.offers
    .filter(
      (offer) =>
        offer.condition === condition && offer.currency === currency,
    )
    .sort((a, b) => a.price - b.price);
}

export function groupedOffers(product: Product): OfferGroup[] {
  const groups: OfferGroup[] = [];

  for (const condition of ["new", "used"] as const) {
    for (const currency of ["USD", "SYP"] as const) {
      const offers = sortedOffers(product, condition, currency);
      if (offers.length > 0) groups.push({ condition, currency, offers });
    }
  }

  return groups;
}

export function lowestOffer(
  product: Product,
  condition: OfferCondition,
  currency: Offer["currency"],
): Offer | undefined {
  return sortedOffers(product, condition, currency)[0];
}

export function conditionLabel(condition: OfferCondition) {
  return condition === "new" ? "جديد" : "مستعمل";
}

export function findProduct(
  brand: string,
  name: string,
  storage: string,
  network?: "4G" | "5G",
  productList: readonly Product[] = products,
) {
  return productList.find(
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

export function getShopOffers(
  shopId: string,
  productList: readonly Product[] = products,
) {
  return productList.flatMap((product) =>
    product.offers
      .filter((offer) => offer.shopId === shopId)
      .map((offer) => ({ product, offer })),
  );
}
