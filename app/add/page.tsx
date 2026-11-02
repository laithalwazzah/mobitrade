import AddPriceForm from "@/components/AddPriceForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "إضافة أسعار محل",
  description: "أرسل أسعار الموبايلات من محلك لإضافتها إلى سعّرلي.",
};

export default function AddPrice() {
  return (
    <>
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 py-12 text-center sm:py-16">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            صاحب محل؟ <span className="text-emerald-300">أرسل أسعارك</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-slate-300">
            اختر الموديلات والسعات وأرسل أسعارك للمراجعة قبل نشرها.
          </p>
        </div>
      </section>

      <main className="mx-auto -mt-3 w-full max-w-3xl flex-1 px-4 pb-16">
        <div className="min-w-0 rounded-2xl bg-white p-4 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 sm:px-8 sm:pt-14 sm:pb-8">
          <AddPriceForm />
        </div>
      </main>
    </>
  );
}
