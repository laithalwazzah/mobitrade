import Link from "next/link";
import { notFound } from "next/navigation";
import { shops } from "@/data/products";
import {
  conditionLabel,
  formatPrice,
  getShop,
  getShopOffers,
} from "@/data/helpers";

export function generateStaticParams() {
  return shops.map((shop) => ({ id: shop.id }));
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shop = getShop(id);
  if (!shop) notFound();

  const items = getShopOffers(shop.id);

  return (
    <>
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 pt-8 pb-16">
          <Link href="/" className="text-sm text-emerald-300 hover:underline">
            ← رجوع للقائمة
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">
            {shop.name}
          </h1>
          <p className="mt-2 text-slate-300">{shop.area}</p>
          <p className="text-sm text-slate-400">{shop.address}</p>

          <a
            href={`https://wa.me/${shop.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-green-600 px-6 py-2.5 font-bold text-white transition hover:bg-green-700"
          >
            تواصل عبر واتساب
          </a>
        </div>
      </section>

      <main className="mx-auto -mt-8 w-full max-w-3xl flex-1 px-4 pb-16">
        <div className="rounded-2xl bg-white p-2 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200">
          <h2 className="px-4 pt-4 pb-2 font-extrabold">
            الموبايلات المتوفرة ({items.length})
          </h2>
          {items.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {items.map(({ product, offer }) => (
                <li key={product.id}>
                  <Link
                    href={`/product/${product.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 transition hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-bold">{product.name}</p>
                      <p className="text-xs text-slate-500">
                        {product.brand} · {product.storage} · تحديث{" "}
                        {offer.updatedAt}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          offer.condition === "new"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {conditionLabel(offer.condition)}
                      </span>
                    </div>
                    <p className="shrink-0 text-lg font-extrabold text-emerald-600">
                      {formatPrice(offer)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 pb-4 text-sm text-slate-500">
              لا توجد أسعار مسجلة لهذا المحل حالياً.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
