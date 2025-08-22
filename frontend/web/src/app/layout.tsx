import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "What's In It? - Food Analyzer & Nutrition Scanner | AI-Powered Health Insights",
  description: "Scan food barcodes instantly for comprehensive nutrition analysis, ingredient safety checks, and health scores. Get AI-powered insights into food additives, allergens, and nutritional content to make healthier choices.",
  keywords: "food analyzer, barcode scanner, nutrition analysis, food health checker, ingredient scanner, food safety, nutrition facts, AI food analysis, healthy eating, food additives checker",
  openGraph: {
    title: "What's In It? - Smart Food Analysis Tool",
    description: "Scan any food barcode to get instant nutrition analysis, health scores, and ingredient safety information powered by AI.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "What's In It? - Food Analyzer & Nutrition Scanner",
    description: "Scan food barcodes for instant nutrition analysis and health insights. Make smarter food choices with AI-powered analysis.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // Replace with actual verification code when available
  },
};

import { UserPreferencesProvider } from "@/context/UserPreferencesContext";
import { HistoryProvider } from "@/context/HistoryContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#6366f1" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-48FHJN18EL"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-48FHJN18EL');
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "What's In It? - Food Analyzer",
              "applicationCategory": "HealthApplication",
              "description": "AI-powered food analyzer that scans barcodes to provide nutrition analysis, health scores, and ingredient safety information",
              "url": "https://whats-in-it.org",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Barcode scanning and analysis",
                "Nutrition facts analysis",
                "Health score calculation",
                "Ingredient safety checking",
                "Food additive information",
                "Dietary recommendations"
              ],
              "author": {
                "@type": "Organization",
                "name": "What's In It Team"
              },
              "keywords": "food analyzer, nutrition scanner, barcode scanner, health checker, ingredient analysis"
            })
          }}
        />
      </head>
      <body className={`${inter.className}`}>
        <UserPreferencesProvider>
          <HistoryProvider>
            <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
              <Sidebar />
              <main className="flex-1 md:ml-64 p-8">
                {children}
              </main>
            </div>
          </HistoryProvider>
        </UserPreferencesProvider>
      </body>
    </html>
  );
}