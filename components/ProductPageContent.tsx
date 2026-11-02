"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCatalog } from "@/components/CatalogProvider";
import CompareButton from "@/components/CompareButton";
import ProductMedia, { BrandLogo } from "@/components/ProductMedia";
import {
  conditionLabel,
  formatPrice,
  getProduct,
  getShop,
  groupedOffers,
} from "@/data/helpers";

function MissingProduct({ loading }: { loading: boolean }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-16">
      <div aria-live="polite" className="w-full rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200 sm:p-8">
        <h1 className="text-2xl font-extrabold">
          {loading ? "جارٍ تحميل أحدث الأسعار..." : "هذا المنتج غير موجود"}
        </h1>
        {!loading && (
          <Link href="/" prefetch={false} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-emerald-600 px-5 py-2 font-bold text-white">
            العودة للرئيسية
          </Link>
        )}
      </div>
    </main>
  );
}

export default function ProductPageContent() {
  const searchParams = useSearchParams();
  const { products, shops, status } = useCatalog();
  const product = getProduct(searchParams.get("id") ?? "", products);
  if (!product) {
    return <MissingProduct loading={status === "static" || status === "loading"} />;
  }

  return (
    <>
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-4xl px-4 pt-8 pb-16">
          <Link href="/" prefetch={false} className="text-sm text-emerald-300 hover:underline">← رجوع للقائمة</Link>
          <div className="mt-6 grid items-center gap-6 sm:grid-cols-[1fr_220px]">
            <div>
              <p className="flex items-center gap-2 text-sm text-slate-300">
                <span className="inline-flex rounded-md bg-white p-1">
                  <BrandLogo brand={product.brand} className="h-5 w-7" />
                </span>
                {product.brand}
              </p>
              <h1 className="mt-2 break-words text-3xl font-extrabold sm:text-4xl">{product.name}</h1>
              <span className="mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-sm">{product.storage}</span>
              {product.network && (
                <span className="mr-2 mt-3 inline-block rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-200">{product.network}</span>
              )}
              <div className="mt-5">
                <CompareButton product={product} className="border-white/30 bg-white/10 text-white hover:border-emerald-300 hover:text-emerald-200" />
              </div>
            </div>
            <ProductMedia product={product} className="h-56 w-full rounded-2xl" sizes="220px" />
          </div>
        </div>
      </section>
      <main className="mx-auto -mt-8 w-full max-w-4xl flex-1 space-y-4 px-4 pb-16">
        {groupedOffers(product).map((group, groupIndex) => {
          const isNew = group.condition === "new";
          return (
            <section key={`${group.condition}-${group.currency}`}>
              <h2 className="mb-3 px-1 text-sm font-extrabold text-slate-600">
                {conditionLabel(group.condition)} · {group.currency === "USD" ? "دولار" : "ليرة سورية"}
              </h2>
              <div className="space-y-4">
                {group.offers.map((offer, index) => {
                  const shop = getShop(offer.shopId, shops);
                  if (!shop) return null;
                  const message = encodeURIComponent(`مرحباً، بدي أسأل عن ${product.name} ${product.storage}`);
                  const isBest = index === 0;
                  return (
                    <div
                      key={`${offer.shopId}-${offer.condition}-${offer.currency}`}
                      className={`animate-fade-up flex min-w-0 flex-col items-stretch justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 sm:flex-row sm:items-center sm:p-5 ${
                        isBest
                          ? `ring-2 ${isNew ? "ring-emerald-500 shadow-emerald-500/10" : "ring-amber-400 shadow-amber-500/10"}`
                          : "ring-slate-200"
                      }`}
                      style={{ animationDelay: `${(groupIndex + index) * 80}ms` }}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/shop?id=${encodeURIComponent(shop.id)}`} prefetch={false} className="break-words rounded text-lg font-extrabold hover:text-emerald-600">{shop.name}</Link>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${isNew ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                            {conditionLabel(offer.condition)}
                          </span>
                          {isBest && (
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${isNew ? "bg-emerald-500" : "bg-amber-500"}`}>الأرخص</span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{shop.area}</p>
                        <p className="mt-1 text-xs text-slate-400">آخر تحديث: {offer.updatedAt}</p>
                        {offer.notes && (
                          <p className="mt-2 break-words whitespace-pre-line text-sm text-slate-500">
                            {offer.notes}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right sm:text-left">
                        <p className={`text-2xl font-extrabold ${isBest && isNew ? "text-emerald-600" : isBest ? "text-amber-700" : "text-slate-800"}`}>
                          {formatPrice(offer)}
                        </p>
                        <a href={`https://wa.me/${shop.whatsapp}?text=${message}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700">واتساب</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
        <p className="pt-2 text-center text-xs text-slate-400">الأسعار إرشادية وقد تتغير، يرجى التأكد من المحل قبل الشراء.</p>
      </main>
    </>
  );
}
