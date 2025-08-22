import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "What's In It?",
  description: "Get detailed analysis of food products.",
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