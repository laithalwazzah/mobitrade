import { Suspense } from "react";
import ShopPageContent from "@/components/ShopPageContent";

export default function ShopPage() {
  return (
    <Suspense fallback={<p className="flex-1 p-10 text-center">جارٍ التحميل...</p>}>
      <ShopPageContent />
    </Suspense>
  );
}
