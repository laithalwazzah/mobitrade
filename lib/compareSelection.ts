export const COMPARE_STORAGE_KEY = "sa3erli-compare-products";
export const MAX_COMPARE_PRODUCTS = 2;

const EMPTY_SELECTION_SNAPSHOT = "[]";
let selectionSnapshot = EMPTY_SELECTION_SNAPSHOT;
let selectionInitialized = false;
const selectionListeners = new Set<() => void>();

function isProductKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 120 &&
    /^[a-z0-9-]+$/.test(value)
  );
}

export function sanitizeCompareSelection(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter(isProductKey))).slice(
    0,
    MAX_COMPARE_PRODUCTS,
  );
}

export function parseCompareSelection(raw: string | null): string[] {
  if (!raw) return [];
  try {
    return sanitizeCompareSelection(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function addCompareSelection(selection: readonly string[], key: string) {
  const current = sanitizeCompareSelection(selection);
  if (!isProductKey(key) || current.includes(key)) return current;
  return current.length < MAX_COMPARE_PRODUCTS ? [...current, key] : current;
}

export function removeCompareSelection(
  selection: readonly string[],
  key: string,
) {
  return sanitizeCompareSelection(selection).filter((item) => item !== key);
}

export function replaceCompareSelection(
  selection: readonly string[],
  index: number,
  key: string,
) {
  const current = sanitizeCompareSelection(selection);
  if (!isProductKey(key) || index < 0 || index >= current.length) return current;
  if (current.includes(key)) return current;
  return current.map((item, itemIndex) => (itemIndex === index ? key : item));
}

function readSelectionSnapshot() {
  if (typeof window === "undefined" || selectionInitialized) {
    return selectionSnapshot;
  }
  selectionInitialized = true;
  try {
    const selection = parseCompareSelection(
      localStorage.getItem(COMPARE_STORAGE_KEY),
    );
    selectionSnapshot = JSON.stringify(selection);
    localStorage.setItem(COMPARE_STORAGE_KEY, selectionSnapshot);
  } catch {
    selectionSnapshot = EMPTY_SELECTION_SNAPSHOT;
  }
  return selectionSnapshot;
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== COMPARE_STORAGE_KEY && event.key !== null) return;
  selectionInitialized = false;
  readSelectionSnapshot();
  selectionListeners.forEach((listener) => listener());
}

export function subscribeToCompareSelection(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  selectionListeners.add(listener);
  window.addEventListener("storage", handleStorageChange);
  return () => {
    selectionListeners.delete(listener);
    window.removeEventListener("storage", handleStorageChange);
  };
}

export function getCompareSelectionSnapshot() {
  return readSelectionSnapshot();
}

export function getServerCompareSelectionSnapshot() {
  return EMPTY_SELECTION_SNAPSHOT;
}

export function saveCompareSelection(selection: readonly string[]) {
  const sanitized = sanitizeCompareSelection(selection);
  selectionSnapshot = JSON.stringify(sanitized);
  selectionInitialized = true;
  try {
    localStorage.setItem(COMPARE_STORAGE_KEY, selectionSnapshot);
  } catch {
    // Comparison remains usable in memory when storage is unavailable.
  }
  selectionListeners.forEach((listener) => listener());
}
