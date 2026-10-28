import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import {
  conditionLabel,
  formatPrice,
  getProduct,
  getShop,
  lowestOffer,
  sortedOffers,
} from "@/data/helpers";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const offers = sortedOffers(product);

  return (
    <>
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-3xl px-4 pt-8 pb-16">
          <Link href="/" className="text-sm text-emerald-300 hover:underline">
            ← رجوع للقائمة
          </Link>
          <p className="mt-6 text-sm text-slate-400">{product.brand}</p>
          <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">
            {product.name}
          </h1>
          <span className="mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-sm">
            {product.storage}
          </span>
          {product.network && (
            <span className="mr-2 mt-3 inline-block rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-200">
              {product.network}
            </span>
          )}
        </div>
      </section>

      <main className="mx-auto -mt-8 w-full max-w-3xl flex-1 space-y-4 px-4 pb-16">
        {offers.map((offer, index) => {
          const shop = getShop(offer.shopId);
          if (!shop) return null;
          const message = encodeURIComponent(
            `مرحباً، بدي أسأل عن ${product.name} ${product.storage}`
          );
          const isBest = lowestOffer(product, offer.condition) === offer;
          const isNew = offer.condition === "new";

          return (
            <div
              key={offer.shopId}
              className={`animate-fade-up flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ${
                isBest
                  ? `ring-2 ${isNew ? "ring-emerald-500 shadow-emerald-500/10" : "ring-amber-400 shadow-amber-500/10"}`
                  : "ring-slate-200"
              }`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/shop/${shop.id}`}
                    className="text-lg font-extrabold hover:text-emerald-600"
                  >
                    {shop.name}
                  </Link>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      isNew
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {conditionLabel(offer.condition)}
                  </span>
                  {isBest && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${
                        isNew ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    >
                      الأرخص
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">{shop.area}</p>
                <p className="mt-1 text-xs text-slate-400">
                  آخر تحديث: {offer.updatedAt}
                </p>
              </div>

              <div className="text-left">
                <p
                  className={`text-2xl font-extrabold ${
                    isBest && isNew
                      ? "text-emerald-600"
                      : isBest
                        ? "text-amber-700"
                        : "text-slate-800"
                  }`}
                >
                  {formatPrice(offer)}
                </p>
                <a
                  href={`https://wa.me/${shop.whatsapp}?text=${message}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block rounded-full bg-green-600 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-green-700"
                >
                  واتساب
                </a>
              </div>
            </div>
          );
        })}

        <p className="pt-2 text-center text-xs text-slate-400">
          الأسعار إرشادية وقد تتغير، يرجى التأكد من المحل قبل الشراء.
        </p>
      </main>
    </>
  );
}