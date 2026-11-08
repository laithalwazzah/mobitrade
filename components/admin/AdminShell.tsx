"use client";

import Link from "next/link";

export default function AdminShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <main className="min-w-0 flex-1 pb-16">
    <section className="bg-slate-900 px-4 pb-16 pt-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-bold text-emerald-300">لوحة الإدارة</p><h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl leading-8 text-slate-300">{description}</p></div>
        <nav aria-label="تنقل لوحة الإدارة" className="flex flex-wrap gap-2"><Link href="/admin" prefetch={false} className="inline-flex min-h-11 items-center rounded-xl border border-white/20 px-4 font-bold hover:bg-white/10">الطلبات</Link><Link href="/account" prefetch={false} className="inline-flex min-h-11 items-center rounded-xl border border-white/20 px-4 font-bold hover:bg-white/10">الحساب</Link></nav>
      </div>
    </section>
    <div className="mx-auto -mt-8 min-w-0 max-w-6xl px-3 sm:px-4"><div className="min-w-0 rounded-2xl bg-white p-4 shadow-xl sm:p-6">{children}</div></div>
  </main>;
}
