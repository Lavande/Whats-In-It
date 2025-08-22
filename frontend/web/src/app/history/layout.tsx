import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scan History - Food Analysis History | What's In It?",
  description: "View your food scan history and previous nutrition analyses. Track your food choices and revisit health insights.",
  alternates: {
    canonical: "https://whats-in-it.org/history",
  },
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}