"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AuthLoading, AuthUnavailable, primaryButtonClass } from "./AuthUi";

export default function AddAuthGate() {
  const auth = useAuth(); const router = useRouter();
  useEffect(() => { if (auth.available && auth.state.status === "signed-out") router.replace("/login?returnTo=%2Fadd"); if (auth.state.status === "signed-in-unverified") router.replace("/verify-email?returnTo=%2Fadd"); }, [auth.available, auth.state.status, router]);
  if (auth.state.status === "loading" || (auth.available && auth.state.status !== "signed-in-verified")) return <AuthLoading />;
  if (auth.available === false) return <AuthUnavailable />;
  return <div className="space-y-5 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl" aria-hidden="true">⏳</span><h2 className="text-xl font-extrabold">موافقة صاحب المحل مطلوبة</h2><p className="leading-8 text-slate-600">تم التحقق من حسابك. إضافة الأسعار متوقفة مؤقتاً حتى نضيف مراجعة واعتماد أصحاب المحلات في Sprint 04.</p><p className="rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-600">لن يتم نشر أي سعر أو إنشاء بيانات محل من هذه الصفحة الآن.</p><Link className={primaryButtonClass} href="/account">العودة إلى حسابي</Link></div>;
}
