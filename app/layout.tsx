import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "سعّرلي | أسعار الموبايلات في اللاذقية",
  description: "قارن أسعار الموبايلات بين محلات اللاذقية بثواني.",
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
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}