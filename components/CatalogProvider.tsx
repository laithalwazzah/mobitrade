"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { products as staticProducts, shops as staticShops } from "@/data/products";
import { getLiveOffers } from "@/lib/liveData";
import type { LiveOfferDocument } from "@/lib/liveOffer";
import { mergeCatalog } from "@/lib/mergeCatalog";

export type CatalogStatus = "static" | "loading" | "live" | "error";
export type LiveCatalogLoader = () => Promise<LiveOfferDocument[] | null>;

declare global {
  interface Window {
    __SA3ERLI_E2E_CATALOG_LOADER__?: LiveCatalogLoader;
  }
}

type CatalogContextValue = ReturnType<typeof mergeCatalog> & {
  status: CatalogStatus;
  refresh: () => Promise<void>;
};

const initialCatalog = mergeCatalog(staticProducts, staticShops, []);
const CatalogContext = createContext<CatalogContextValue | null>(null);
const catalogLoaderTestBuild =
  process.env.NEXT_PUBLIC_CATALOG_LOADER_TEST_MODE === "1";

async function getTestLiveOffers() {
  if (
    typeof window === "undefined" ||
    (window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1")
  ) {
    return null;
  }

  return window.__SA3ERLI_E2E_CATALOG_LOADER__?.() ?? null;
}

async function loadSafely(loader: LiveCatalogLoader) {
  try {
    return await loader();
  } catch {
    return null;
  }
}

export default function CatalogProvider({
  children,
  liveCatalogLoader,
}: {
  children: React.ReactNode;
  liveCatalogLoader?: LiveCatalogLoader;
}) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [status, setStatus] = useState<CatalogStatus>("static");
  const loader =
    liveCatalogLoader ??
    (catalogLoaderTestBuild ? getTestLiveOffers : getLiveOffers);

  const refresh = useCallback(async () => {
    setStatus("loading");
    const liveOffers = await loadSafely(loader);
    if (liveOffers === null) {
      setStatus("error");
      return;
    }

    setCatalog(mergeCatalog(staticProducts, staticShops, liveOffers));
    setStatus("live");
  }, [loader]);

  useEffect(() => {
    let active = true;
    void loadSafely(loader).then((liveOffers) => {
      if (!active) return;
      if (liveOffers === null) {
        setStatus("error");
        return;
      }
      setCatalog(mergeCatalog(staticProducts, staticShops, liveOffers));
      setStatus("live");
    });
    return () => {
      active = false;
    };
  }, [loader]);

  const value = useMemo(
    () => ({ ...catalog, status, refresh }),
    [catalog, refresh, status],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used inside CatalogProvider.");
  }
  return context;
}
