"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AuthFooterLink, AuthLoading, AuthUnavailable, inputClass, primaryButtonClass } from "./AuthUi";
import { validateEmail } from "@/lib/auth";

export default function ForgotPasswordScreen() {
  const auth = useAuth(); const [email, setEmail] = useState(""); const [error, setError] = useState<string>(); const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false);
  if (auth.state.status === "loading") return <AuthLoading />; if (auth.available === false) return <AuthUnavailable />;
  async function submit(event: React.FormEvent) { event.preventDefault(); const next = validateEmail(email); setError(next); if (next || busy) return; setBusy(true); try { await auth.sendPasswordReset(email.trim()); } catch { /* Intentionally generic to prevent account enumeration. */ } setSent(true); setBusy(false); }
  if (sent) return <div className="space-y-5"><p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-bold leading-7 text-emerald-900">إذا كان البريد مرتبطاً بحساب، فستصل إليه رسالة تتضمن خطوات إعادة تعيين كلمة المرور.</p><AuthFooterLink href="/login">العودة إلى تسجيل الدخول</AuthFooterLink></div>;
  return <form onSubmit={submit} noValidate className="space-y-5"><label className="block text-sm font-bold">البريد الإلكتروني<input className={inputClass} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(error)} /></label>{error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}<button className={primaryButtonClass} disabled={busy}>{busy ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}</button><AuthFooterLink href="/login">العودة إلى تسجيل الدخول</AuthFooterLink></form>;
}
