"use client";

import type { Product } from "@/data/products";
import { useCompare } from "@/components/CompareProvider";

export default function CompareButton({ product, className = "" }: { product: Product; className?: string }) {
  const { isSelected, requestAdd, remove } = useCompare();
  const selected = isSelected(product);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => (selected ? remove(product) : requestAdd(product))}
      className={`rounded-full border px-4 py-2 text-sm font-bold transition ${selected ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-700"} ${className}`}
    >
      {selected ? "إزالة من المقارنة" : "أضف للمقارنة"}
    </button>
  );
}
