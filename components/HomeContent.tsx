"use client";

import ProductList from "@/components/ProductList";
import { useCatalog } from "@/components/CatalogProvider";

export default function HomeContent() {
  const { products, shops, status } = useCatalog();
  const stats = [
    { value: products.length, label: "موديل" },
    { value: shops.length, label: "محل" },
    {
      value: products.reduce((total, product) => total + product.offers.length, 0),
      label: "عرض",
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-28 text-center sm:pt-20">
          <span className="inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-sm text-emerald-300">
            مقارنة أسعار حقيقية · اللاذقية
          </span>
          <h1 className="animate-fade-up mt-6 text-4xl leading-tight font-extrabold sm:text-6xl">
            لا تدفع أكتر من{" "}
            <span className="bg-gradient-to-l from-emerald-300 to-sky-300 bg-clip-text text-transparent">
              سعر الموبايل الحقيقي
            </span>
          </h1>
          <p
            className="animate-fade-up mx-auto mt-5 max-w-xl text-base text-slate-300 sm:text-lg"
            style={{ animationDelay: "100ms" }}
          >
            قارن أسعار الموبايلات بين محلات اللاذقية بثواني، وتواصل مع المحل
            مباشرة عبر واتساب.
          </p>
          <div
            className="animate-fade-up mx-auto mt-10 grid max-w-xl grid-cols-3 gap-2 sm:gap-6"
            style={{ animationDelay: "200ms" }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-2 py-3 backdrop-blur sm:px-5"
              >
                <p className="text-2xl font-extrabold text-emerald-300">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <main className="relative z-10 mx-auto -mt-14 w-full max-w-6xl flex-1 px-4 pb-16">
        {status === "error" && (
          <p role="status" className="mb-3 text-center text-sm text-amber-800">
            تعذر تحميل أحدث الأسعار، يتم عرض البيانات المحفوظة
          </p>
        )}
        <ProductList products={products} />
      </main>
    </>
  );
}
