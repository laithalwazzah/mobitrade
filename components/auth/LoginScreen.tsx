"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { AuthFooterLink, AuthLoading, AuthUnavailable, FormError, inputClass, primaryButtonClass } from "./AuthUi";
import { hasValidationErrors, mapAuthError, sanitizeReturnPath, validateLoginInput } from "@/lib/auth";

export default function LoginScreen() {
  const auth = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = sanitizeReturnPath(params.get("returnTo"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ReturnType<typeof validateLoginInput>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (auth.state.status === "signed-in-verified") router.replace(returnTo);
    if (auth.state.status === "signed-in-unverified") router.replace(`/verify-email?returnTo=${encodeURIComponent(returnTo)}`);
  }, [auth.state.status, returnTo, router]);
  if (auth.state.status === "loading") return <AuthLoading />;
  if (auth.available === false) return <AuthUnavailable />;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const next = validateLoginInput(email, password);
    setErrors(next); setMessage(null);
    if (hasValidationErrors(next) || busy) return;
    setBusy(true);
    try { await auth.login(email.trim(), password); }
    catch (error) { setMessage(mapAuthError(error)); setBusy(false); }
  }
  async function google() {
    if (busy) return;
    setBusy(true); setMessage(null);
    try { await auth.signInWithGoogle(); }
    catch (error) { setMessage(mapAuthError(error)); setBusy(false); }
  }
  return <div className="space-y-5">
    <FormError message={message} />
    <form onSubmit={submit} noValidate className="space-y-4">
      <label className="block text-sm font-bold">البريد الإلكتروني<input className={inputClass} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "login-email-error" : undefined} /></label>
      {errors.email && <p id="login-email-error" className="text-sm font-bold text-red-700">{errors.email}</p>}
      <label className="block text-sm font-bold">كلمة المرور<input className={inputClass} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={Boolean(errors.password)} /></label>
      {errors.password && <p className="text-sm font-bold text-red-700">{errors.password}</p>}
      <button className={primaryButtonClass} disabled={busy}>{busy ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}</button>
    </form>
    <button type="button" onClick={google} disabled={busy} className="min-h-12 w-full rounded-xl border border-slate-300 px-4 font-extrabold hover:bg-slate-50 disabled:opacity-60">المتابعة باستخدام Google</button>
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><AuthFooterLink href="/forgot-password">نسيت كلمة المرور؟</AuthFooterLink><AuthFooterLink href={`/register?returnTo=${encodeURIComponent(returnTo)}`}>إنشاء حساب</AuthFooterLink></div>
  </div>;
}
