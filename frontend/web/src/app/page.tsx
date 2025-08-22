"use client";

import BarcodeForm from "@/components/BarcodeForm";
import { Package } from "lucide-react";

export default function Home() {
  return (
    <div className="text-center mt-16">
      <div className="mb-8">
        <Package className="w-20 h-20 text-[var(--primary)] mx-auto mb-4" />
      </div>
      <h1 className="text-5xl font-extrabold mb-4 tracking-tight text-[var(--text-primary)]">
        Analyze Your Food
      </h1>
      <p className="text-xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto">
        Get instant, AI-powered insights into food products. Just enter the barcode below to begin.
      </p>
      <BarcodeForm />
    </div>
  );
}
