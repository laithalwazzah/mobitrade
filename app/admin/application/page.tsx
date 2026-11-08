import type { Metadata } from "next";
import { Suspense } from "react";
import AdminApplicationPage from "@/components/admin/AdminApplicationPage";

export const metadata: Metadata = { title: "مراجعة طلب اعتماد", description: "تفاصيل طلب اعتماد محل للمستخدم الإداري المصرح." };

export default function Page() {
  return <Suspense fallback={<main className="mx-auto w-full max-w-3xl px-4 py-16"><p role="status" className="rounded-2xl bg-white p-8 text-center font-bold shadow-sm">جارٍ فتح الطلب...</p></main>}><AdminApplicationPage /></Suspense>;
}
