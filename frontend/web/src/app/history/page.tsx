"use client";

import { useRouter } from "next/navigation";
import Head from "next/head";
import { Clock, Package, Trash2, Search } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function HistoryPage() {
  const router = useRouter();
  const { scanHistory, clearScanHistory } = useAppStore();

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  const handleProductClick = (barcode: string) => {
    router.push(`/product/${barcode}`);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your scan history? This action cannot be undone.')) {
      clearScanHistory();
    }
  };

  if (scanHistory.length === 0) {
    return (
      <>
        <Head>
          <link rel="canonical" href="https://whats-in-it.org/history" />
          <title>Scan History - Food Analysis History | What's In It?</title>
          <meta name="description" content="View your food scan history and previous nutrition analyses. Track your food choices and revisit health insights." />
        </Head>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Scan History
          </h1>
        </div>

        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[var(--surface-variant)] rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">
              No scans yet
            </h3>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">
              Start scanning products to see your history here. Your scan history helps you track the products you've analyzed.
            </p>
            <Button onClick={() => router.push('/')}>
              Start Scanning
            </Button>
          </div>
        </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <link rel="canonical" href="https://whats-in-it.org/history" />
        <title>Scan History - Food Analysis History | What's In It?</title>
        <meta name="description" content="View your food scan history and previous nutrition analyses. Track your food choices and revisit health insights." />
      </Head>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Scan History
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            {scanHistory.length} product{scanHistory.length === 1 ? '' : 's'} scanned
          </p>
        </div>
        
        <Button variant="outline" onClick={handleClearHistory}>
          <Trash2 className="w-4 h-4 mr-2" />
          Clear History
        </Button>
      </div>

      <div className="space-y-4">
        {scanHistory.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div
              className="p-6 cursor-pointer"
              onClick={() => handleProductClick(item.barcode)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {item.product.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg border border-[var(--surface-variant)] flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-[var(--surface-variant)] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-[var(--text-secondary)]" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {item.product.brand} • {item.barcode}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(item.scannedAt)}</span>
                      </div>
                      
                      {item.analysisResult && (
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            item.analysisResult.health_score >= 80 ? 'bg-green-500' :
                            item.analysisResult.health_score >= 60 ? 'bg-yellow-500' :
                            item.analysisResult.health_score >= 40 ? 'bg-orange-500' :
                            'bg-red-500'
                          }`} />
                          <span className="text-sm text-[var(--text-secondary)]">
                            Health Score: {item.analysisResult.health_score}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                  <Search className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {scanHistory.length > 10 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            Showing your most recent scans. History is automatically limited to 50 items.
          </p>
        </div>
      )}
      </div>
    </>
  );
}