import { WHATSAPP_DESTINATION_PHONE } from "@/lib/config";
import { conditionLabel } from "@/data/helpers";
import type { OfferCondition } from "@/data/products";
import { getFirebaseFirestore } from "@/lib/firebase";
import { normalizeSyrianWhatsAppNumber } from "@/lib/phone";
import {
  doc,
  serverTimestamp,
  setDoc,
  type Firestore,
} from "firebase/firestore";

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

export type SubmissionResult =
  | {
      ok: true;
      channel: "firestore" | "whatsapp";
      clientId: string;
      message?: string;
    }
  | { ok: false; clientId: string; message: string };

function createClientId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getLocalDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function buildSubmissionMessage(
  payload: SubmissionPayload,
  clientId: string,
) {
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

  const shop = {
    name: payload.shop.name,
    area: payload.shop.area,
    address: payload.shop.address,
    whatsapp,
  };
  const data = {
    clientId,
    shop,
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
    `اسم المحل: ${shop.name}`,
    `المنطقة: ${shop.area}`,
    `العنوان: ${shop.address}`,
    `واتساب المحل: ${whatsapp}`,
    `رقم الطلب: ${clientId}`,
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
): Promise<SubmissionResult> {
  const clientId = createClientId();
  if (typeof window === "undefined") {
    return { ok: false, clientId, message: "" };
  }

  const whatsapp = normalizeSyrianWhatsAppNumber(payload.shop.whatsapp);
  if (!whatsapp) {
    return {
      ok: false,
      clientId,
      message: "رقم واتساب غير صحيح. مثال: 0912345678",
    };
  }

  const normalizedPayload = {
    ...payload,
    shop: {
      name: payload.shop.name,
      area: payload.shop.area,
      address: payload.shop.address,
      whatsapp,
    },
  };
  let db: Firestore | null = null;
  try {
    db = getFirebaseFirestore();
  } catch {
    console.warn("Firebase initialization failed; using WhatsApp fallback.");
  }
  const pendingWindow = db ? window.open("about:blank", "_blank") : null;

  if (pendingWindow) {
    pendingWindow.document.title = "إرسال الطلب";
    pendingWindow.document.body.textContent = "جارٍ إرسال طلبك للمراجعة...";
  }

  if (db) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        setDoc(doc(db, "submissions", clientId), {
          shop: normalizedPayload.shop,
          offers: normalizedPayload.offers,
          ...(normalizedPayload.notes
            ? { notes: normalizedPayload.notes }
            : {}),
          status: "pending",
          createdAt: serverTimestamp(),
          clientId,
        }),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error("Firestore submission timed out.")),
            8000,
          );
        }),
      ]);
      pendingWindow?.close();
      return { ok: true, channel: "firestore", clientId };
    } catch {
      console.warn("Firestore submission failed; using WhatsApp fallback.");
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  const message = buildSubmissionMessage(normalizedPayload, clientId);
  const url = `https://wa.me/${WHATSAPP_DESTINATION_PHONE}?text=${encodeURIComponent(message)}`;
  const openedWindow = pendingWindow ?? window.open(url, "_blank");

  if (pendingWindow) {
    pendingWindow.location.href = url;
  }
  if (openedWindow) openedWindow.opener = null;
  return openedWindow
    ? { ok: true, channel: "whatsapp", clientId, message }
    : { ok: false, clientId, message };
}
