"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useCatalog } from "@/components/CatalogProvider";
import { catalog } from "@/data/catalog";
import type { Product } from "@/data/products";
import {
  addCompareSelection,
  getCompareSelectionSnapshot,
  getServerCompareSelectionSnapshot,
  parseCompareSelection,
  removeCompareSelection,
  replaceCompareSelection,
  saveCompareSelection,
  subscribeToCompareSelection,
} from "@/lib/compareSelection";
import { createProductKey } from "@/lib/productKey";

type CompareContextValue = {
  selectedKeys: string[];
  selectedProducts: Product[];
  candidate: Product | null;
  isSelected: (product: Product) => boolean;
  requestAdd: (product: Product) => void;
  remove: (product: Product) => void;
  replace: (index: number) => void;
  cancelReplace: () => void;
  clear: () => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

const catalogComparisonProducts: Product[] = catalog.flatMap((model) =>
  model.storages.flatMap((storage) =>
    model.network.map((network) => ({
      id: `catalog-${model.id}-${storage.toLowerCase()}-${network.toLowerCase()}`,
      brand: model.brand,
      name: model.name,
      storage,
      network,
      offers: [],
    })),
  ),
);

export default function CompareProvider({ children }: { children: React.ReactNode }) {
  const { products } = useCatalog();
  const selectionSnapshot = useSyncExternalStore(
    subscribeToCompareSelection,
    getCompareSelectionSnapshot,
    getServerCompareSelectionSnapshot,
  );
  const selectedKeys = useMemo(
    () => parseCompareSelection(selectionSnapshot),
    [selectionSnapshot],
  );
  const [candidate, setCandidate] = useState<Product | null>(null);

  const update = useCallback((next: string[]) => {
    saveCompareSelection(next);
  }, []);

  const selectedProducts = useMemo(
    () =>
      selectedKeys.flatMap((key) => {
        const product =
          products.find((item) => createProductKey(item) === key) ??
          catalogComparisonProducts.find((item) => createProductKey(item) === key);
        return product ? [product] : [];
      }),
    [products, selectedKeys],
  );

  const isSelected = useCallback(
    (product: Product) => selectedKeys.includes(createProductKey(product)),
    [selectedKeys],
  );

  const requestAdd = useCallback(
    (product: Product) => {
      const key = createProductKey(product);
      if (selectedKeys.includes(key)) return;
      const next = addCompareSelection(selectedKeys, key);
      if (next.length === selectedKeys.length) {
        setCandidate(product);
      } else {
        update(next);
      }
    },
    [selectedKeys, update],
  );

  const remove = useCallback(
    (product: Product) => {
      update(removeCompareSelection(selectedKeys, createProductKey(product)));
      setCandidate(null);
    },
    [selectedKeys, update],
  );

  const replace = useCallback(
    (index: number) => {
      if (!candidate) return;
      update(
        replaceCompareSelection(
          selectedKeys,
          index,
          createProductKey(candidate),
        ),
      );
      setCandidate(null);
    },
    [candidate, selectedKeys, update],
  );

  const clear = useCallback(() => {
    update([]);
    setCandidate(null);
  }, [update]);

  const value = useMemo(
    () => ({
      selectedKeys,
      selectedProducts,
      candidate,
      isSelected,
      requestAdd,
      remove,
      replace,
      cancelReplace: () => setCandidate(null),
      clear,
    }),
    [candidate, clear, isSelected, remove, replace, requestAdd, selectedKeys, selectedProducts],
  );

  return (
    <CompareContext.Provider value={value}>
      {children}
      <CompareTray />
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) throw new Error("useCompare must be used inside CompareProvider.");
  return context;
}

function CompareTray() {
  const { selectedProducts, candidate, remove, replace, cancelReplace, clear } = useCompare();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  if (pathname === "/compare" || (selectedProducts.length === 0 && !candidate)) {
    return null;
  }

  if (!isExpanded) {
    return (
      <button
        type="button"
        aria-expanded="false"
        aria-controls="compare-tray-panel"
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 left-4 z-40 flex min-h-11 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-extrabold text-white shadow-xl ring-1 ring-white/20 transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      >
        <span>المقارنة</span>
        <span className="grid size-6 place-items-center rounded-full bg-emerald-400 text-xs text-slate-950">
          {selectedProducts.length}
        </span>
      </button>
    );
  }

  return (
    <aside
      id="compare-tray-panel"
      aria-label="شريط المقارنة"
      className="fixed right-3 bottom-3 left-3 z-40 max-h-[min(75vh,32rem)] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white shadow-2xl md:top-1/2 md:right-auto md:bottom-auto md:left-4 md:w-72 md:-translate-y-1/2"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-extrabold">المقارنة ({selectedProducts.length}/2)</h2>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          aria-label="إغلاق شريط المقارنة"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-xl leading-none text-white hover:bg-white/20"
        >
          ×
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {selectedProducts.map((product) => (
          <li key={createProductKey(product)} className="flex items-center justify-between gap-2 rounded-xl bg-white/10 px-3 py-2">
            <span className="min-w-0 truncate text-sm font-bold">{product.brand} {product.name}</span>
            <button type="button" onClick={() => { remove(product); if (selectedProducts.length === 1) setIsExpanded(false); }} aria-label={`إزالة ${product.name} من المقارنة`} className="shrink-0 rounded-full px-2 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white">
              إزالة
            </button>
          </li>
        ))}
      </ul>
      {candidate && (
        <div className="mt-3 rounded-xl bg-amber-400/10 p-3 ring-1 ring-amber-300/30">
          <p className="text-xs text-amber-100">القائمة ممتلئة. استبدل جهازاً بـ {candidate.name}:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedProducts.map((product, index) => (
              <button key={createProductKey(product)} type="button" onClick={() => replace(index)} className="rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-slate-900">
                استبدل {product.name}
              </button>
            ))}
            <button type="button" onClick={cancelReplace} className="rounded-full px-3 py-1 text-xs text-slate-300 hover:bg-white/10">إلغاء</button>
          </div>
        </div>
      )}
      {selectedProducts.length === 2 ? (
        <Link href="/compare" prefetch={false} className="mt-3 block rounded-full bg-emerald-500 px-4 py-2 text-center text-sm font-bold text-slate-950 hover:bg-emerald-400">
          افتح المقارنة
        </Link>
      ) : (
        <span aria-disabled="true" className="mt-3 block rounded-full bg-slate-700 px-4 py-2 text-center text-sm font-bold text-slate-400">
          افتح المقارنة
        </span>
      )}
      <button
        type="button"
        onClick={() => { clear(); setIsExpanded(false); }}
        className="mt-3 w-full text-center text-xs text-slate-300 hover:text-white hover:underline"
      >
        مسح الكل
      </button>
    </aside>
  );
}
