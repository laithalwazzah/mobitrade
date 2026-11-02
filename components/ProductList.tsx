"use client";

import Link from "next/link";
import { useState } from "react";
import type { OfferCondition, Product } from "@/data/products";
import { conditionLabel, lowestOffer, formatPrice } from "@/data/helpers";
import CompareButton from "@/components/CompareButton";
import ProductMedia, { BrandLogo } from "@/components/ProductMedia";

export default function ProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [condition, setCondition] = useState<"all" | "new" | "used">("all");

  const brands = Array.from(new Set(products.map((p) => p.brand)));

  const filtered = products.filter((p) => {
    const searchTerm = query.trim().toLowerCase();
    const matchesQuery =
      p.name.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm);
    const matchesBrand = brand === "all" || p.brand === brand;
    const matchesCondition =
      condition === "all" ||
      p.offers.some((offer) => offer.condition === condition);
    return matchesQuery && matchesBrand && matchesCondition;
  });

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
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن موبايل... مثلاً آيفون 15"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-4 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["all", ...brands].map((currentBrand) => (
            <button
              key={currentBrand}
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

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-600">الحالة:</span>
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

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product, index) => {
          const displayedCondition: OfferCondition =
            condition === "all"
              ? product.offers.some((offer) => offer.condition === "new")
                ? "new"
                : "used"
              : condition;
          const displayedCurrency = product.offers.some(
            (offer) =>
              offer.condition === displayedCondition && offer.currency === "USD",
          )
            ? "USD"
            : "SYP";
          const displayedOffer = lowestOffer(
            product,
            displayedCondition,
            displayedCurrency,
          );
          const sameConditionCurrencyOffers = displayedOffer
            ? product.offers.filter(
                (offer) =>
                  offer.condition === displayedOffer.condition &&
                  offer.currency === displayedOffer.currency,
              )
            : [];
          const worst = sameConditionCurrencyOffers.length
            ? Math.max(...sameConditionCurrencyOffers.map((offer) => offer.price))
            : 0;
          const saving = displayedOffer ? worst - displayedOffer.price : 0;
          const shopCount = new Set(
            product.offers
              .filter(
                (offer) =>
                  condition === "all" || offer.condition === condition,
              )
              .map((offer) => offer.shopId),
          ).size;
          const showConditionBadge =
            displayedOffer &&
            (condition !== "all" || displayedOffer.condition === "used");

          return (
            <article
              key={product.id}
              className="animate-fade-up group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <Link
                href={`/product?id=${encodeURIComponent(product.id)}`}
                className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                aria-label={`عرض تفاصيل ${product.brand} ${product.name} ${product.storage}`}
              >
              <div className="relative">
                <ProductMedia product={product} className="h-44 w-full" />
                <span className="absolute top-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">
                  <BrandLogo brand={product.brand} className="h-4 w-5" />
                  <span>{product.brand}</span>
                </span>
                {saving > 0 && displayedOffer && (
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

                <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-400">
                        {condition === "all" && displayedCondition === "new"
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
                    {displayedOffer && (
                      <p className="text-2xl font-extrabold text-emerald-600">
                        {formatPrice(displayedOffer)}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
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
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-slate-500">
            ما في نتائج مطابقة، جرّب كلمة ثانية.
          </p>
        )}
      </div>
    </>
  );
}
