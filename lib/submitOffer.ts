import { WHATSAPP_DESTINATION_PHONE } from "@/lib/config";
import { conditionLabel } from "@/data/helpers";
import type { OfferCondition } from "@/data/products";
import { normalizeSyrianWhatsAppNumber } from "@/lib/phone";

export type OfferCurrency = "USD" | "SYP";
export type { OfferCondition } from "@/data/products";

export type SubmissionOffer = {
  brand: string;
  name: string;
  storage: string;
  condition: OfferCondition;
  network: "4G" | "5G";
  price: number;
  currency: OfferCurrency;
};

export type SubmissionPayload = {
  shop: {
    name: string;
    area: string;
    address: string;
    whatsapp: string;
  };
  offers: SubmissionOffer[];
  notes?: string;
};

function getLocalDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function buildSubmissionMessage(payload: SubmissionPayload) {
  const offerLines = payload.offers.map((offer, index) => {
    const fullName = `${offer.brand} ${offer.name}`;
    const condition = conditionLabel(offer.condition);
    const price = `${offer.price.toLocaleString("en-US")} ${offer.currency}`;
    return `${index + 1}. ${fullName} | ${offer.storage} | ${condition} | ${offer.network} | ${price}`;
  });
  const whatsapp = normalizeSyrianWhatsAppNumber(payload.shop.whatsapp);
  if (!whatsapp) {
    throw new Error("رقم واتساب غير صحيح. مثال: 0912345678");
  }

  const data = {
    shop: { ...payload.shop, whatsapp },
    offers: payload.offers.map((offer) => ({
      name: offer.name,
      brand: offer.brand,
      storage: offer.storage,
      condition: offer.condition,
      network: offer.network,
      price: offer.price,
      currency: offer.currency,
      updatedAt: getLocalDate(),
    })),
  };

  return [
    "طلب إضافة أسعار إلى موقع سعّرلي",
    "",
    "بيانات المحل:",
    `اسم المحل: ${payload.shop.name}`,
    `المنطقة: ${payload.shop.area}`,
    `العنوان: ${payload.shop.address}`,
    `واتساب المحل: ${whatsapp}`,
    "",
    "الأسعار:",
    ...offerLines,
    ...(payload.notes ? ["", `ملاحظات: ${payload.notes}`] : []),
    "",
    "---DATA---",
    JSON.stringify(data, null, 2),
    "---END---",
  ].join("\n");
}

export async function submitOffer(
  payload: SubmissionPayload,
): Promise<{ ok: boolean }> {
  if (typeof window === "undefined") return { ok: false };

  const whatsapp = normalizeSyrianWhatsAppNumber(payload.shop.whatsapp);
  if (!whatsapp) return { ok: false };

  const normalizedPayload = {
    ...payload,
    shop: { ...payload.shop, whatsapp },
  };
  const message = buildSubmissionMessage(normalizedPayload);
  const url = `https://wa.me/${WHATSAPP_DESTINATION_PHONE}?text=${encodeURIComponent(message)}`;
  const openedWindow = window.open(url, "_blank");

  if (openedWindow) openedWindow.opener = null;
  return { ok: openedWindow !== null };
}
