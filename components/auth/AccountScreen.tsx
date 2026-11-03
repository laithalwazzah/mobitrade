"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AuthLoading, AuthUnavailable, FormError, primaryButtonClass } from "./AuthUi";
import { mapAuthError } from "@/lib/auth";

export default function AccountScreen() {
  const auth = useAuth(); const router = useRouter(); const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => { if (auth.state.status === "signed-out" && auth.available) router.replace("/login?returnTo=%2Faccount"); }, [auth.available, auth.state.status, router]);
  if (auth.state.status === "loading" || (auth.state.status === "signed-out" && auth.available)) return <AuthLoading />;
  if (auth.available === false) return <AuthUnavailable />;
  if (auth.state.status === "signed-out") return null;
  async function logout() { if (busy) return; setBusy(true); try { await auth.logout(); router.replace("/"); } catch (value) { setError(mapAuthError(value)); setBusy(false); } }
  return <div className="space-y-5"><FormError message={error} /><dl className="space-y-3 rounded-xl bg-slate-50 p-4"><div><dt className="text-sm font-bold text-slate-500">البريد الإلكتروني</dt><dd dir="ltr" className="mt-1 break-all text-left font-bold">{auth.state.user.email}</dd></div><div><dt className="text-sm font-bold text-slate-500">حالة البريد</dt><dd className="mt-1 font-bold">{auth.state.status === "signed-in-verified" ? "تم التحقق" : "بانتظار التحقق"}</dd></div></dl>{auth.state.status === "signed-in-unverified" && <Link className={primaryButtonClass} href="/verify-email?returnTo=%2Faccount">إكمال التحقق من البريد</Link>}<Link href="/add" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-emerald-600 px-4 font-bold text-emerald-800">بوابة أصحاب المحلات</Link><button onClick={logout} disabled={busy} className="min-h-12 w-full rounded-xl border border-red-200 px-4 font-bold text-red-700 hover:bg-red-50 disabled:opacity-60">تسجيل الخروج</button></div>;
}
