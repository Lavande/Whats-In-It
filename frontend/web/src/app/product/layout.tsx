import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Analysis - Nutrition & Ingredient Information | What's In It?",
  description: "Comprehensive nutrition analysis and ingredient breakdown. View health scores, nutrition facts, and AI-powered insights for food products.",
};

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}