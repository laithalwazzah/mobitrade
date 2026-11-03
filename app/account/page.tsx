import type { Metadata } from "next";
import AccountScreen from "@/components/auth/AccountScreen";
import { AuthShell } from "@/components/auth/AuthUi";
export const metadata: Metadata = { title: "حسابي", description: "إدارة جلسة وحالة حساب سعّرلي." };
export default function AccountPage() { return <AuthShell title="حسابي" description="حالة حسابك والتحقق من بريدك الإلكتروني."><AccountScreen /></AuthShell>; }
