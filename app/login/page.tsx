import type { Metadata } from "next";
import { Suspense } from "react";
import LoginScreen from "@/components/auth/LoginScreen";
import { AuthLoading, AuthShell } from "@/components/auth/AuthUi";
export const metadata: Metadata = { title: "تسجيل الدخول", description: "تسجيل الدخول إلى حسابك في سعّرلي." };
export default function LoginPage() { return <AuthShell title="تسجيل الدخول" description="ادخل إلى حسابك للوصول إلى أدوات أصحاب المحلات."><Suspense fallback={<AuthLoading />}><LoginScreen /></Suspense></AuthShell>; }
