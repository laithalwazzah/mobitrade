import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogProvider from "@/components/CatalogProvider";
import CompareProvider from "@/components/CompareProvider";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: {
    default: "سعّرلي | أسعار الموبايلات في اللاذقية",
    template: "%s | سعّرلي",
  },
  description: "قارن أسعار الموبايلات بين محلات اللاذقية بثواني.",
  applicationName: "سعّرلي",
  openGraph: {
    title: "سعّرلي | أسعار الموبايلات في اللاذقية",
    description: "قارن أسعار الموبايلات بين محلات اللاذقية بثواني.",
    siteName: "سعّرلي",
    locale: "ar_SY",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.variable} flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased`}
      >
        <a href="#main-content" className="skip-link">
          تخطَّ إلى المحتوى الرئيسي
        </a>
        <CatalogProvider>
          <CompareProvider>
            <Header />
            <div id="main-content" tabIndex={-1} className="flex min-h-0 min-w-0 flex-1 flex-col">
              {children}
            </div>
            <Footer />
          </CompareProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
