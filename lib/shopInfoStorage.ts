import { normalizeSyrianWhatsAppNumber } from "@/lib/phone";

export type ShopInfoDraft = {
  name: string;
  area: string;
  address: string;
  whatsapp: string;
};

const STORAGE_KEY = "sa3erli-shop-info";
const EMPTY_SHOP_INFO: ShopInfoDraft = {
  name: "",
  area: "",
  address: "",
  whatsapp: "",
};
const EMPTY_SNAPSHOT = JSON.stringify(EMPTY_SHOP_INFO);
const listeners = new Set<() => void>();
let snapshot = EMPTY_SNAPSHOT;
let initialized = false;

function isShopInfoDraft(value: unknown): value is ShopInfoDraft {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.name === "string" &&
    typeof record.area === "string" &&
    typeof record.address === "string" &&
    typeof record.whatsapp === "string"
  );
}

function readSnapshot() {
  if (typeof window === "undefined" || initialized) return snapshot;
  initialized = true;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (isShopInfoDraft(parsed)) {
        const whatsapp = normalizeSyrianWhatsAppNumber(parsed.whatsapp);
        const sanitized = {
          ...parsed,
          whatsapp: whatsapp ?? "",
        };
        snapshot = JSON.stringify(sanitized);
        if (sanitized.whatsapp !== parsed.whatsapp) {
          try {
            window.localStorage.setItem(STORAGE_KEY, snapshot);
          } catch {
            // The sanitized in-memory value remains available for this visit.
          }
        }
      }
    }
  } catch {
    snapshot = EMPTY_SNAPSHOT;
  }

  return snapshot;
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  initialized = false;
  readSnapshot();
  notifyListeners();
}

export function subscribeToShopInfo(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  listeners.add(listener);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorageChange);
  };
}

export function getShopInfoSnapshot() {
  return readSnapshot();
}

export function getServerShopInfoSnapshot() {
  return EMPTY_SNAPSHOT;
}

export function parseShopInfoSnapshot(value: string): ShopInfoDraft {
  try {
    const parsed: unknown = JSON.parse(value);
    return isShopInfoDraft(parsed) ? parsed : EMPTY_SHOP_INFO;
  } catch {
    return EMPTY_SHOP_INFO;
  }
}

export function saveShopInfo(info: ShopInfoDraft) {
  snapshot = JSON.stringify(info);
  initialized = true;

  try {
    window.localStorage.setItem(STORAGE_KEY, snapshot);
  } catch {
    // Saving is optional; the form remains usable when storage is unavailable.
  }

  notifyListeners();
}
