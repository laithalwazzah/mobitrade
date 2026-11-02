import { Suspense } from "react";
import type { Metadata } from "next";
import ProductPageContent from "@/components/ProductPageContent";

export const metadata: Metadata = {
  title: "تفاصيل الموبايل والأسعار",
  description: "قارن عروض وأسعار الموبايل حسب الحالة والعملة في محلات اللاذقية.",
};

export default function ProductPage() {
  return (
    <Suspense fallback={<p role="status" aria-live="polite" className="flex-1 p-10 text-center">جارٍ التحميل...</p>}>
      <ProductPageContent />
    </Suspense>
  );
}
