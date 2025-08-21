"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useHistory } from '@/context/HistoryContext';
import { Loader } from 'lucide-react';

export default function HistoryPage() {
  const { history, isLoading } = useHistory();

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin text-blue-500 h-12 w-12" />
        </div>
    );
  }

  if (history.length === 0) {
    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">No Scan History</h1>
            <p className="text-gray-400">You haven't scanned any products yet. Start by entering a barcode on the homepage.</p>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Scan History</h1>
      <div className="bg-gray-900 rounded-lg shadow">
        <ul className="divide-y divide-gray-700">
          {history.map((item) => (
            <li key={item.barcode}>
              <Link href={`/product/${item.barcode}`} className="flex items-center p-4 hover:bg-gray-800 transition-colors">
                <div className="relative w-16 h-16 mr-4 bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                    <Image 
                        src={item.imageUrl || '/placeholder.svg'}
                        alt={item.productName}
                        fill
                        className="object-contain"
                    />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-lg">{item.productName}</p>
                  <p className="text-sm text-gray-500">{new Date(item.date).toLocaleString()}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}