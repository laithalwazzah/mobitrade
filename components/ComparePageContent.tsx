"use client";

import Link from "next/link";
import { useCatalog } from "@/components/CatalogProvider";
import { useCompare } from "@/components/CompareProvider";
import {
  getSpecificationsOrUnavailable,
  specificationFields,
} from "@/data/specifications";
import { conditionLabel, formatPrice, groupedOffers } from "@/data/helpers";
import type { Product } from "@/data/products";

function LowestPrices({ product }: { product: Product }) {
  const groups = groupedOffers(product);
  if (groups.length === 0) return <span>غير متوفر</span>;
  return (
    <ul className="space-y-1 text-sm">
      {groups.map((group) => (
        <li key={`${group.condition}-${group.currency}`}>
          <span className="text-slate-500">
            {conditionLabel(group.condition)} · {group.currency === "USD" ? "دولار" : "ليرة سورية"}:
          </span>{" "}
          <strong className="text-emerald-700">{formatPrice(group.offers[0])}</strong>
        </li>
      ))}
    </ul>
  );
}

export default function ComparePageContent() {
  const { status } = useCatalog();
  const { selectedKeys, selectedProducts, remove, clear } = useCompare();

  if (selectedKeys.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-16">
        <div className="w-full rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-extrabold">لا توجد أجهزة للمقارنة</h1>
          <p className="mt-2 text-slate-500">اختر جهازين من القائمة لتظهر المقارنة هنا.</p>
          <Link href="/" className="mt-5 inline-block rounded-full bg-emerald-600 px-5 py-2 font-bold text-white">اختيار الأجهزة</Link>
        </div>
      </main>
    );
  }

  if (selectedProducts.length < 2) {
    const waitingForLive = selectedKeys.length === 2 && (status === "static" || status === "loading");
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-16">
        <div className="w-full rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-extrabold">{waitingForLive ? "جارٍ تحميل الأجهزة..." : "اختر جهازاً ثانياً"}</h1>
          <p className="mt-2 text-slate-500">تحتاج المقارنة إلى جهازين مختلفين.</p>
          <Link href="/" className="mt-5 inline-block rounded-full bg-emerald-600 px-5 py-2 font-bold text-white">العودة للقائمة</Link>
        </div>
      </main>
    );
  }

  const products = selectedProducts.slice(0, 2);
  const specifications = products.map(getSpecificationsOrUnavailable);

  return (
    <>
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <p className="text-sm font-bold text-emerald-300">مقارنة جهازين</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">اختر الأنسب إلك</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">المواصفات جنباً إلى جنب، والأسعار مفصولة حسب الحالة والعملة حتى لا نقارن الدولار بالليرة.</p>
        </div>
      </section>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <div className="mb-5 flex justify-end">
          <button type="button" onClick={clear} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 hover:border-red-300 hover:text-red-700">مسح المقارنة</button>
        </div>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-200">
          <table className="w-full min-w-[700px] table-fixed border-collapse text-right">
            <thead>
              <tr className="bg-slate-100">
                <th className="w-40 p-4 text-sm text-slate-500">الجهاز</th>
                {products.map((product) => (
                  <th key={product.id} className="p-4 align-top">
                    <p className="text-sm text-slate-500">{product.brand}</p>
                    <Link href={`/product?id=${encodeURIComponent(product.id)}`} className="mt-1 inline-block text-xl font-extrabold hover:text-emerald-700">{product.name}</Link>
                    <p className="mt-1 text-sm text-slate-500">{product.storage} · {product.network ?? "غير متوفر"}</p>
                    <button type="button" onClick={() => remove(product)} className="mt-3 text-xs font-bold text-red-600 hover:underline">إزالة من المقارنة</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200">
                <th className="p-4 text-sm text-slate-600">أقل الأسعار الحالية</th>
                {products.map((product) => <td key={product.id} className="p-4 align-top"><LowestPrices product={product} /></td>)}
              </tr>
              {specificationFields.map(({ key, label }) => {
                const different = specifications[0][key] !== specifications[1][key];
                return (
                  <tr key={key} className="border-t border-slate-200">
                    <th className="p-4 text-sm text-slate-600">{label}</th>
                    {products.map((product, index) => (
                      <td key={product.id} className={`p-4 align-top text-sm leading-6 ${different ? "bg-amber-50 font-bold text-slate-900" : "text-slate-700"}`}>
                        {specifications[index][key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">الخلايا المظللة تشير إلى اختلاف المواصفات. بعض القيم قد تكون غير متوفرة من المصدر الرسمي.</p>
      </main>
    </>
  );
}
