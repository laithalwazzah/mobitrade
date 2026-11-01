"use client";

import { collection, getDocs } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase";
import {
  isLiveOfferDocument,
  type LiveOfferDocument,
} from "@/lib/liveOffer";

function toLocalDate(value: unknown) {
  if (
    typeof value !== "object" ||
    value === null ||
    !("toDate" in value) ||
    typeof value.toDate !== "function"
  ) {
    return undefined;
  }

  const date = value.toDate();
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return undefined;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return {
    date: `${date.getFullYear()}-${month}-${day}`,
    milliseconds: date.getTime(),
  };
}

function parseLiveOffer(id: string, value: unknown): LiveOfferDocument | null {
  if (typeof value !== "object" || value === null) return null;
  const data = value as Record<string, unknown>;
  const updatedAt = toLocalDate(data.updatedAt);
  if (!updatedAt) return null;
  const candidate = {
    ...data,
    id,
    updatedAt: updatedAt.date,
    updatedAtMillis: updatedAt.milliseconds,
  };
  return isLiveOfferDocument(candidate) ? candidate : null;
}

export async function getLiveOffers(): Promise<LiveOfferDocument[] | null> {
  try {
    const db = getFirebaseFirestore();
    if (!db) return null;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const snapshot = await Promise.race([
        getDocs(collection(db, "liveOffers")),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error("Live offers request timed out.")),
            5000,
          );
        }),
      ]);

      return snapshot.docs
        .map((document) => parseLiveOffer(document.id, document.data()))
        .filter((document): document is LiveOfferDocument => document !== null);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  } catch {
    return null;
  }
}
