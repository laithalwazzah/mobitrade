"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AuthLoading, AuthUnavailable, FormError, primaryButtonClass } from "./AuthUi";
import { mapAuthError, sanitizeReturnPath } from "@/lib/auth";

export default function VerifyEmailScreen() {
  const auth = useAuth(); const router = useRouter(); const params = useSearchParams(); const returnTo = sanitizeReturnPath(params.get("returnTo"));
  const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  if (auth.state.status === "loading") return <AuthLoading />; if (auth.available === false) return <AuthUnavailable />;
  if (auth.state.status === "signed-out") return <div className="space-y-4"><p className="leading-7 text-slate-600">سجّل الدخول أولاً للوصول إلى صفحة التحقق.</p><Link className={primaryButtonClass} href={`/login?returnTo=${encodeURIComponent(returnTo)}`}>تسجيل الدخول</Link></div>;
  if (auth.state.status === "signed-in-verified") return <div className="space-y-4"><p role="status" className="rounded-xl bg-emerald-50 p-4 font-bold text-emerald-900">تم التحقق من بريدك الإلكتروني.</p><Link className={primaryButtonClass} href={returnTo}>متابعة</Link></div>;
  async function resend() { if (busy) return; setBusy(true); setError(null); try { await auth.sendVerification(); setMessage("أُعيد إرسال رسالة التحقق. تحقق من صندوق الوارد والرسائل غير المرغوب فيها."); } catch (value) { setError(mapAuthError(value)); } setBusy(false); }
  async function check() { if (busy) return; setBusy(true); setError(null); try { const user = await auth.reloadUser(); if (user?.emailVerified) router.replace(returnTo); else setMessage("لم يكتمل التحقق بعد. افتح الرابط في رسالة البريد ثم حاول مجدداً."); } catch (value) { setError(mapAuthError(value)); } setBusy(false); }
  return <div className="space-y-5"><p className="leading-7 text-slate-600">أرسلنا رسالة تحقق إلى <bdi className="font-bold text-slate-900">{auth.state.user.email}</bdi>. يجب التحقق قبل استخدام أدوات المحلات.</p><FormError message={error} />{message && <p role="status" className="rounded-xl bg-sky-50 p-3 text-sm font-bold leading-6 text-sky-900">{message}</p>}<button onClick={check} disabled={busy} className={primaryButtonClass}>تحققت من بريدي</button><button onClick={resend} disabled={busy} className="min-h-12 w-full rounded-xl border border-slate-300 px-4 font-bold hover:bg-slate-50 disabled:opacity-60">إعادة إرسال رسالة التحقق</button></div>;
}
