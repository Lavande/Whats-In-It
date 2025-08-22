import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings & Preferences - Customize Your Food Analysis | What's In It?",
  description: "Customize your food analysis preferences. Set diet type, allergies, health focus areas, and personalize your nutrition insights.",
  alternates: {
    canonical: "https://whats-in-it.org/settings",
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}