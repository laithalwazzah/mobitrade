import type { OfferCondition } from "@/data/products";
import {
  createLiveOfferDocumentId,
  type ProductIdentity,
} from "@/lib/productKey";

export type LiveOfferDocument = {
  id: string;
  shop: {
    name: string;
    area: string;
    address: string;
    whatsapp: string;
  };
  product: ProductIdentity;
  condition: OfferCondition;
  price: number;
  currency: "USD" | "SYP";
  notes?: string;
  updatedAt: string;
  updatedAtMillis?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseLiveOfferDocument(
  value: unknown,
): LiveOfferDocument | null {
  if (!isRecord(value) || !isRecord(value.shop) || !isRecord(value.product)) {
    return null;
  }

  const { shop, product } = value;
  const networkIsValid =
    product.network === undefined ||
    product.network === "4G" ||
    product.network === "5G";
  const millisecondsAreValid =
    value.updatedAtMillis === undefined ||
    (typeof value.updatedAtMillis === "number" &&
      Number.isFinite(value.updatedAtMillis));

  if (
    typeof value.id !== "string" ||
    typeof shop.name !== "string" ||
    typeof shop.area !== "string" ||
    typeof shop.address !== "string" ||
    typeof shop.whatsapp !== "string" ||
    !/^9639\d{8}$/.test(shop.whatsapp) ||
    typeof product.brand !== "string" ||
    typeof product.name !== "string" ||
    typeof product.storage !== "string" ||
    !networkIsValid ||
    (value.condition !== "new" && value.condition !== "used") ||
    typeof value.price !== "number" ||
    !Number.isFinite(value.price) ||
    value.price <= 0 ||
    value.price >= 1_000_000_000 ||
    (value.currency !== "USD" && value.currency !== "SYP") ||
    !millisecondsAreValid ||
    typeof value.updatedAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.updatedAt)
  ) {
    return null;
  }

  const normalizedProduct: ProductIdentity = {
    brand: product.brand,
    name: product.name,
    storage: product.storage,
    ...(product.network === "4G" || product.network === "5G"
      ? { network: product.network }
      : {}),
  };

  if (
    value.id !==
    createLiveOfferDocumentId(
      shop.whatsapp,
      normalizedProduct,
      value.condition,
    )
  ) {
    return null;
  }

  const notes = typeof value.notes === "string" ? value.notes.trim() : "";
  return {
    id: value.id,
    shop: {
      name: shop.name,
      area: shop.area,
      address: shop.address,
      whatsapp: shop.whatsapp,
    },
    product: normalizedProduct,
    condition: value.condition,
    price: value.price,
    currency: value.currency,
    ...(notes ? { notes } : {}),
    updatedAt: value.updatedAt,
    ...(typeof value.updatedAtMillis === "number"
      ? { updatedAtMillis: value.updatedAtMillis }
      : {}),
  };
}
