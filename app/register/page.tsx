import type { Metadata } from "next";
import { Suspense } from "react";
import RegisterScreen from "@/components/auth/RegisterScreen";
import { AuthLoading, AuthShell } from "@/components/auth/AuthUi";
export const metadata: Metadata = { title: "إنشاء حساب", description: "إنشاء حساب جديد في سعّرلي." };
export default function RegisterPage() { return <AuthShell title="إنشاء حساب" description="أنشئ حساباً ثم تحقق من بريدك الإلكتروني."><Suspense fallback={<AuthLoading />}><RegisterScreen /></Suspense></AuthShell>; }
