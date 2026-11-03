import type { Metadata } from "next";
import AddAuthGate from "@/components/auth/AddAuthGate";

export const metadata: Metadata = { title: "بوابة أصحاب المحلات", description: "بوابة حسابات أصحاب المحلات في سعّرلي." };

export default function AddPage() {
  return <><section className="relative overflow-hidden bg-slate-900 text-white"><div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/30 blur-3xl" /><div className="relative mx-auto max-w-3xl px-4 py-12 text-center sm:py-16"><h1 className="text-3xl font-extrabold sm:text-5xl">بوابة <span className="text-emerald-300">أصحاب المحلات</span></h1><p className="mx-auto mt-4 max-w-lg text-slate-300">سجّل الدخول بحساب موثّق للوصول إلى أدوات أصحاب المحلات.</p></div></section><main className="mx-auto -mt-3 w-full max-w-3xl flex-1 px-4 pb-16"><div className="min-w-0 rounded-2xl bg-white p-5 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 sm:p-8"><AddAuthGate /></div></main></>;
}
