"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { mapAuthError } from "@/lib/auth";

export default function Header() {
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    if (busy) return;
    setBusy(true); setError("");
    try { await auth.logout(); } catch (value) { setError(mapAuthError(value)); } finally { setBusy(false); }
  }
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
      <nav aria-label="التنقل الرئيسي" className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <Link href="/" prefetch={false} className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl sm:gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-900">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="7" y="2" width="10" height="20" rx="2.5" />
              <path d="M11 18h2" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold text-white">
              سعّرلي
            </span>
            <span className="hidden text-xs text-slate-400 min-[360px]:block">
              موبايلات اللاذقية
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {auth.state.status === "loading" ? <span role="status" aria-label="جارٍ استعادة الجلسة" className="h-11 w-24 animate-pulse rounded-full bg-slate-700" /> : auth.state.status === "signed-out" ? <Link href="/login" prefetch={false} className="inline-flex min-h-11 items-center rounded-full border border-emerald-400/40 px-3 py-2 text-sm font-bold text-emerald-300 hover:bg-emerald-400 hover:text-slate-900 sm:px-5">تسجيل الدخول</Link> : <><Link href="/account" prefetch={false} className="inline-flex min-h-11 items-center rounded-full border border-emerald-400/40 px-3 py-2 text-sm font-bold text-emerald-300 hover:bg-emerald-400 hover:text-slate-900">حسابي</Link><button type="button" onClick={logout} disabled={busy} className="inline-flex min-h-11 items-center rounded-full px-2 text-xs font-bold text-slate-200 hover:bg-slate-700 disabled:opacity-60 sm:px-3 sm:text-sm">خروج</button></>}
        </div>
      </nav>
      {error && <p role="alert" className="bg-red-950 px-4 py-2 text-center text-xs font-bold text-red-100">{error}</p>}
    </header>
  );
}
