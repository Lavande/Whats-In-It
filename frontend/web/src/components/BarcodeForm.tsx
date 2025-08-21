
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const BarcodeForm = () => {
  const [barcode, setBarcode] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      router.push(`/product/${barcode.trim()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex items-center max-w-lg mx-auto">
      <input
        type="text"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        placeholder="Enter product barcode..."
        className="w-full px-4 py-3 rounded-l-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500"
        disabled={!barcode.trim()}
      >
        <Search size={24} />
      </button>
    </form>
  );
};

export default BarcodeForm;
