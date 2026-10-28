"use client";

import { useSyncExternalStore } from "react";

const subscribeToYear = () => () => {};
const getCurrentYear = () => new Date().getFullYear();
const getServerYear = () => 2026;

export default function Footer() {
  const year = useSyncExternalStore(
    subscribeToYear,
    getCurrentYear,
    getServerYear,
  );

  return (
    <footer className="bg-slate-900 py-10 text-center">
      <p className="font-bold text-white">سعّرلي · اللاذقية</p>
      <p className="mt-2 text-xs text-slate-400">
        الأسعار إرشادية وقد تتغير. الموقع لا يبيع المنتجات بنفسه.
      </p>
      <p className="mt-4 text-xs text-slate-500">
        © {year} جميع الحقوق محفوظة
      </p>
    </footer>
  );
}