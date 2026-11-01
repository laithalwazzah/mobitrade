import { Suspense } from "react";
import ProductPageContent from "@/components/ProductPageContent";

export default function ProductPage() {
  return (
    <Suspense fallback={<p className="flex-1 p-10 text-center">جارٍ التحميل...</p>}>
      <ProductPageContent />
    </Suspense>
  );
}
