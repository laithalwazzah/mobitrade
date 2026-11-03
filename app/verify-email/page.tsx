import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailScreen from "@/components/auth/VerifyEmailScreen";
import { AuthLoading, AuthShell } from "@/components/auth/AuthUi";
export const metadata: Metadata = { title: "التحقق من البريد", description: "إكمال التحقق من البريد الإلكتروني في سعّرلي." };
export default function VerifyEmailPage() { return <AuthShell title="تحقق من بريدك" description="التحقق مطلوب قبل استخدام أدوات أصحاب المحلات."><Suspense fallback={<AuthLoading />}><VerifyEmailScreen /></Suspense></AuthShell>; }
