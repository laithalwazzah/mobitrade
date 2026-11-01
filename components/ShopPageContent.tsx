"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCatalog } from "@/components/CatalogProvider";
import { conditionLabel, formatPrice, getShop, getShopOffers } from "@/data/helpers";

function MissingShop({ loading }: { loading: boolean }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-16">
      <div className="w-full rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-extrabold">{loading ? "جارٍ تحميل أحدث الأسعار..." : "هذا المحل غير موجود"}</h1>
        {!loading && (
          <Link href="/" className="mt-5 inline-block rounded-full bg-emerald-600 px-5 py-2 font-bold text-white">العودة للرئيسية</Link>
        )}
      </div>
    </main>
  );
}

export default function ShopPageContent() {
  const searchParams = useSearchParams();
  const { products, shops, status } = useCatalog();
  const shop = getShop(searchParams.get("id") ?? "", shops);
  if (!shop) {
    return <MissingShop loading={status === "static" || status === "loading"} />;
  }
  const items = getShopOffers(shop.id, products);

  return (
    <>
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 pt-8 pb-16">
          <Link href="/" className="text-sm text-emerald-300 hover:underline">← رجوع للقائمة</Link>
          <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">{shop.name}</h1>
          <p className="mt-2 text-slate-300">{shop.area}</p>
          <p className="text-sm text-slate-400">{shop.address}</p>
          <a href={`https://wa.me/${shop.whatsapp}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block rounded-full bg-green-600 px-6 py-2.5 font-bold text-white transition hover:bg-green-700">تواصل عبر واتساب</a>
        </div>
      </section>
      <main className="mx-auto -mt-8 w-full max-w-3xl flex-1 px-4 pb-16">
        <div className="rounded-2xl bg-white p-2 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200">
          <h2 className="px-4 pt-4 pb-2 font-extrabold">العروض المتوفرة ({items.length})</h2>
          {items.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {items.map(({ product, offer }) => (
                <li key={`${product.id}-${offer.condition}-${offer.currency}`}>
                  <Link href={`/product?id=${encodeURIComponent(product.id)}`} className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 transition hover:bg-slate-50">
                    <div>
                      <p className="font-bold">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.brand} · {product.storage} · تحديث {offer.updatedAt}</p>
                      <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${offer.condition === "new" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {conditionLabel(offer.condition)}
                      </span>
                      {offer.notes && (
                        <p className="mt-2 break-words whitespace-pre-line text-sm text-slate-500">
                          {offer.notes}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 text-lg font-extrabold text-emerald-600">{formatPrice(offer)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 pb-4 text-sm text-slate-500">لا توجد أسعار مسجلة لهذا المحل حالياً.</p>
          )}
        </div>
      </main>
    </>
  );
}
