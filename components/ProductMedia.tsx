"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/data/products";
import { getBrandMedia, getDeviceMedia } from "@/data/media";

export function BrandLogo({
  brand,
  className = "h-5 w-8",
}: {
  brand: string;
  className?: string;
}) {
  const media = getBrandMedia(brand);
  if (!media) {
    return (
      <span aria-hidden="true" className={`grid place-items-center rounded-md bg-slate-200 text-[10px] font-black text-slate-600 ${className}`}>
        {brand.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <span className={`relative inline-block shrink-0 ${className}`}>
      <Image
        src={media.path}
        alt={media.alt}
        fill
        sizes="48px"
        unoptimized
        className="object-contain"
      />
    </span>
  );
}

export default function ProductMedia({
  product,
  className = "h-40 w-full",
  sizes = "(max-width: 640px) 100vw, 33vw",
}: {
  product: Product;
  className?: string;
  sizes?: string;
}) {
  const media = getDeviceMedia(product);
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const showImage = media && failedPath !== media.path;

  return (
    <div
      className={`relative isolate overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-200 ${className}`}
      data-product-media={showImage ? "image" : "fallback"}
    >
      {showImage ? (
        <Image
          src={media.path}
          alt={media.alt}
          fill
          sizes={sizes}
          unoptimized
          onError={() => setFailedPath(media.path)}
          className="object-contain p-3 transition duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
          <span className="grid size-20 place-items-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-slate-200">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <rect x="7" y="2" width="10" height="20" rx="2.5" />
              <path d="M11 18h2" />
            </svg>
          </span>
          <span className="max-w-[85%] truncate text-xs font-bold">{product.brand} {product.name}</span>
          <span className="text-[10px]">صورة غير متوفرة</span>
        </div>
      )}
    </div>
  );
}
