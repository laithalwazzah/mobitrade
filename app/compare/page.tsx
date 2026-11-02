import ComparePageContent from "@/components/ComparePageContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مقارنة الموبايلات",
  description: "قارن مواصفات وأسعار موبايلين جنباً إلى جنب دون خلط العملات.",
};

export default function ComparePage() {
  return <ComparePageContent />;
}
