import { Suspense } from "react";
import type { Metadata } from "next";
import ShopPageContent from "@/components/ShopPageContent";

export const metadata: Metadata = {
  title: "تفاصيل المحل وعروضه",
  description: "شاهد عروض وأسعار الموبايلات المتاحة لدى محلات اللاذقية.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<p role="status" aria-live="polite" className="flex-1 p-10 text-center">جارٍ التحميل...</p>}>
      <ShopPageContent />
    </Suspense>
  );
}
