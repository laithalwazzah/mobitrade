"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import type { Product } from "@/data/products";
import { conditionLabel, formatPrice } from "@/data/helpers";
import CompareButton from "@/components/CompareButton";
import ProductMedia, { BrandLogo } from "@/components/ProductMedia";
import {
  filterAndSortCatalog,
  isOfferStale,
  uniqueMatchingShopCount,
  type CatalogSort,
  type ConditionFilter,
  type CurrencyFilter,
} from "@/lib/catalogView";

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export default function ProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [condition, setCondition] = useState<ConditionFilter>("all");
  const [currency, setCurrency] = useState<CurrencyFilter>("all");
  const [sort, setSort] = useState<CatalogSort>("newest");
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  const brands = Array.from(new Set(products.map((product) => product.brand)));
  const items = filterAndSortCatalog(products, {
    query,
    brand,
    condition,
    currency,
    sort,
  });

  function resetFilters() {
    setQuery("");
    setBrand("all");
    setCondition("all");
    setCurrency("all");
    setSort("newest");
  }

  function selectCurrency(value: CurrencyFilter) {
    setCurrency(value);
    if (value === "all" && sort === "price") setSort("newest");
  }

  return (
    <>
      <div className="rounded-2xl bg-white p-4 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 sm:p-5">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن موبايل... مثلاً آيفون 15"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-4 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="الشركة">
          {["all", ...brands].map((currentBrand) => (
            <button
              key={currentBrand}
              type="button"
              aria-pressed={brand === currentBrand}
              onClick={() => setBrand(currentBrand)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold transition ${
                brand === currentBrand
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {currentBrand !== "all" && (
                <BrandLogo brand={currentBrand} className="h-4 w-5" />
              )}
              {currentBrand === "all" ? "الكل" : currentBrand}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div>
            <p className="mb-2 text-sm font-bold text-slate-600">الحالة</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="الحالة">
              {(
                [
                  { value: "all", label: "الكل" },
                  { value: "new", label: "جديد" },
                  { value: "used", label: "مستعمل" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={condition === option.value}
                  onClick={() => setCondition(option.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                    condition === option.value
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-slate-600">العملة</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="العملة">
              {(
                [
                  { value: "all", label: "الكل" },
                  { value: "USD", label: "USD" },
                  { value: "SYP", label: "SYP" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={currency === option.value}
                  onClick={() => selectCurrency(option.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                    currency === option.value
                      ? "bg-sky-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-2 text-sm font-bold text-slate-600">
              ترتيب المنتجات
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as CatalogSort)}
                className="min-w-44 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="newest">الأحدث أولاً</option>
                <option value="name">اسم المنتج</option>
                <option value="price" disabled={currency === "all"}>
                  السعر الأقل
                </option>
              </select>
            </label>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-red-300 hover:text-red-700"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>
        {currency === "all" && (
          <p className="mt-3 text-xs text-slate-400">
            اختر USD أو SYP لتفعيل الترتيب حسب السعر.
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ product, displayedOffer }, index) => {
          const sameConditionCurrencyOffers = product.offers.filter(
            (offer) =>
              offer.condition === displayedOffer.condition &&
              offer.currency === displayedOffer.currency,
          );
          const worst = Math.max(
            ...sameConditionCurrencyOffers.map((offer) => offer.price),
          );
          const saving = worst - displayedOffer.price;
          const shopCount = uniqueMatchingShopCount(
            product,
            condition,
            currency,
          );
          const showConditionBadge =
            condition !== "all" || displayedOffer.condition === "used";
          const stale =
            hydrated && isOfferStale(displayedOffer.updatedAt, new Date());

          return (
            <article
              key={product.id}
              className="animate-fade-up group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <Link
                href={`/product?id=${encodeURIComponent(product.id)}`}
                prefetch={false}
                className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                aria-label={`عرض تفاصيل ${product.brand} ${product.name} ${product.storage}`}
              >
                <div className="relative">
                  <ProductMedia product={product} className="h-44 w-full" />
                  <span className="absolute top-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">
                    <BrandLogo brand={product.brand} className="h-4 w-5" />
                    <span>{product.brand}</span>
                  </span>
                  {saving > 0 && (
                    <span className="absolute top-3 left-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      وفّر {formatPrice({ ...displayedOffer, price: saving })}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-extrabold">{product.name}</h2>
                  <span className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {product.storage}
                  </span>

                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs text-slate-400">
                          {condition === "all" &&
                          displayedOffer.condition === "new"
                            ? "أرخص سعر جديد"
                            : "أرخص سعر"}
                        </p>
                        {showConditionBadge && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                              displayedOffer.condition === "new"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {conditionLabel(displayedOffer.condition)}
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-extrabold text-emerald-600">
                        {formatPrice(displayedOffer)}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>آخر تحديث: {displayedOffer.updatedAt}</span>
                        {stale && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 font-bold text-red-700">
                            سعر قديم
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="shrink-0 text-xs text-slate-500">
                      {shopCount} محل
                    </p>
                  </div>
                </div>
              </Link>
              <div className="px-5 pb-5">
                <CompareButton product={product} className="w-full" />
              </div>
            </article>
          );
        })}
        {items.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <h2 className="text-xl font-extrabold text-slate-800">
              لا توجد نتائج مطابقة
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              جرّب تغيير البحث أو الفلاتر لعرض أجهزة أخرى.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              مسح الفلاتر وعرض الكل
            </button>
          </div>
        )}
      </div>
    </>
  );
}
