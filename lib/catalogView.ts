import type { Offer, OfferCondition, Product } from "@/data/products";

export type ConditionFilter = "all" | OfferCondition;
export type CurrencyFilter = "all" | Offer["currency"];
export type CatalogSort = "newest" | "name" | "price";

export type CatalogFilters = {
  query: string;
  brand: string;
  condition: ConditionFilter;
  currency: CurrencyFilter;
  sort: CatalogSort;
};

export type CatalogViewItem = {
  product: Product;
  displayedOffer: Offer;
};

const UTC_DAY_MS = 24 * 60 * 60 * 1000;

export function utcDateValue(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return timestamp;
}

export function utcCalendarAgeDays(
  value: string,
  currentDate: Date,
): number | null {
  const updatedAt = utcDateValue(value);
  if (updatedAt === null || Number.isNaN(currentDate.getTime())) return null;

  const today = Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate(),
  );
  return Math.floor((today - updatedAt) / UTC_DAY_MS);
}

export function isOfferStale(
  updatedAt: string,
  currentDate: Date,
  staleAfterDays = 7,
) {
  const age = utcCalendarAgeDays(updatedAt, currentDate);
  return age !== null && age >= staleAfterDays;
}

export function matchingOffers(
  product: Product,
  condition: ConditionFilter,
  currency: CurrencyFilter,
) {
  return product.offers.filter(
    (offer) =>
      (condition === "all" || offer.condition === condition) &&
      (currency === "all" || offer.currency === currency),
  );
}

export function displayedOffer(
  product: Product,
  condition: ConditionFilter,
  currency: CurrencyFilter,
): Offer | undefined {
  const eligible = matchingOffers(product, condition, currency);
  if (eligible.length === 0) return undefined;

  const selectedCondition: OfferCondition =
    condition === "all"
      ? eligible.some((offer) => offer.condition === "new")
        ? "new"
        : "used"
      : condition;
  const conditionOffers = eligible.filter(
    (offer) => offer.condition === selectedCondition,
  );
  const selectedCurrency: Offer["currency"] =
    currency === "all"
      ? conditionOffers.some((offer) => offer.currency === "USD")
        ? "USD"
        : "SYP"
      : currency;

  return conditionOffers
    .filter((offer) => offer.currency === selectedCurrency)
    .sort((first, second) => first.price - second.price)[0];
}

export function uniqueMatchingShopCount(
  product: Product,
  condition: ConditionFilter,
  currency: CurrencyFilter,
) {
  return new Set(
    matchingOffers(product, condition, currency).map((offer) => offer.shopId),
  ).size;
}

function compareNames(first: Product, second: Product) {
  return `${first.name} ${first.storage} ${first.brand}`.localeCompare(
    `${second.name} ${second.storage} ${second.brand}`,
    "ar",
    { numeric: true, sensitivity: "base" },
  );
}

export function filterAndSortCatalog(
  products: readonly Product[],
  filters: CatalogFilters,
): CatalogViewItem[] {
  const searchTerm = filters.query.trim().toLocaleLowerCase();
  const effectiveSort =
    filters.sort === "price" && filters.currency === "all"
      ? "newest"
      : filters.sort;

  const items = products.flatMap<CatalogViewItem>((product) => {
    const matchesQuery =
      product.name.toLocaleLowerCase().includes(searchTerm) ||
      product.brand.toLocaleLowerCase().includes(searchTerm);
    const matchesBrand =
      filters.brand === "all" || product.brand === filters.brand;
    const offer = displayedOffer(
      product,
      filters.condition,
      filters.currency,
    );

    return matchesQuery && matchesBrand && offer
      ? [{ product, displayedOffer: offer }]
      : [];
  });

  return items.sort((first, second) => {
    if (effectiveSort === "name") {
      return compareNames(first.product, second.product);
    }
    if (effectiveSort === "price") {
      return (
        first.displayedOffer.price - second.displayedOffer.price ||
        compareNames(first.product, second.product)
      );
    }

    const firstDate = utcDateValue(first.displayedOffer.updatedAt);
    const secondDate = utcDateValue(second.displayedOffer.updatedAt);
    if (firstDate === null && secondDate !== null) return 1;
    if (firstDate !== null && secondDate === null) return -1;
    return (
      (secondDate ?? 0) - (firstDate ?? 0) ||
      compareNames(first.product, second.product)
    );
  });
}
