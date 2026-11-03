import Link from "next/link";

export const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";
export const primaryButtonClass = "inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 font-extrabold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60";

export function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <main className="flex flex-1 items-center bg-slate-100 px-4 py-10 sm:py-16">
    <section className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-200">
      <div className="bg-slate-900 px-5 py-7 text-center text-white sm:px-8">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p>
      </div>
      <div className="p-5 sm:p-8">{children}</div>
    </section>
  </main>;
}

export function AuthUnavailable() {
  return <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-7 text-amber-900">خدمة تسجيل الدخول غير متاحة حالياً لأن إعداد Firebase غير مكتمل. يمكنك متابعة تصفح الأسعار والعودة لاحقاً.</div>;
}

export function AuthLoading() {
  return <div role="status" className="flex min-h-32 items-center justify-center text-sm font-bold text-slate-500">جارٍ استعادة الجلسة...</div>;
}

export function FormError({ message }: { message: string | null }) {
  return message ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">{message}</p> : null;
}

export function AuthFooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} prefetch={false} className="inline-flex min-h-11 items-center rounded-lg font-bold text-emerald-700 underline-offset-4 hover:underline">{children}</Link>;
}
