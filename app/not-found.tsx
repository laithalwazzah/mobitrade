import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة",
  description: "تعذر العثور على الصفحة المطلوبة في سعّرلي.",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-[65vh] flex-1 items-center overflow-hidden bg-slate-900 px-4 py-16 text-white">
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="relative mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl backdrop-blur sm:p-10">
        <p className="text-sm font-extrabold text-emerald-300">404 · الصفحة غير موجودة</p>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">يبدو أن هذا الرابط غير صحيح</h1>
        <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-300">
          لم نتمكن من العثور على الصفحة المطلوبة. يمكنك العودة إلى قائمة الموبايلات ومتابعة مقارنة الأسعار.
        </p>
        <Link
          href="/"
          prefetch={false}
          className="mt-7 inline-flex min-h-11 items-center rounded-full bg-emerald-500 px-6 py-2 font-extrabold text-slate-950 transition hover:bg-emerald-400"
        >
          العودة إلى الرئيسية
        </Link>
      </div>
    </main>
  );
}
