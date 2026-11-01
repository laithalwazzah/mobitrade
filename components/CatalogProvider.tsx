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
import { mergeCatalog } from "@/lib/mergeCatalog";

export type CatalogStatus = "static" | "loading" | "live" | "error";

type CatalogContextValue = ReturnType<typeof mergeCatalog> & {
  status: CatalogStatus;
  refresh: () => Promise<void>;
};

const initialCatalog = mergeCatalog(staticProducts, staticShops, []);
const CatalogContext = createContext<CatalogContextValue | null>(null);

export default function CatalogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [status, setStatus] = useState<CatalogStatus>("static");

  const refresh = useCallback(async () => {
    setStatus("loading");
    const liveOffers = await getLiveOffers();
    if (liveOffers === null) {
      setStatus("error");
      return;
    }

    setCatalog(mergeCatalog(staticProducts, staticShops, liveOffers));
    setStatus("live");
  }, []);

  useEffect(() => {
    let active = true;
    void getLiveOffers().then((liveOffers) => {
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
  }, []);

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
