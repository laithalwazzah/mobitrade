import type { Metadata } from "next";
import ForgotPasswordScreen from "@/components/auth/ForgotPasswordScreen";
import { AuthShell } from "@/components/auth/AuthUi";
export const metadata: Metadata = { title: "استعادة كلمة المرور", description: "استعادة الوصول إلى حساب سعّرلي." };
export default function ForgotPasswordPage() { return <AuthShell title="استعادة كلمة المرور" description="أدخل بريدك وسنرسل تعليمات الاستعادة إن كان مرتبطاً بحساب."><ForgotPasswordScreen /></AuthShell>; }
