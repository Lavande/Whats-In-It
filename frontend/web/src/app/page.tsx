"use client";

import Head from "next/head";
import BarcodeForm from "@/components/BarcodeForm";
import Card from "@/components/ui/Card";
import { Search, Heart, Shield } from "lucide-react";

export default function Home() {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://whats-in-it.org/" />
        <title>What's In It? - Food Analyzer & Nutrition Scanner | AI-Powered Health Insights</title>
        <meta name="description" content="Scan food barcodes instantly for comprehensive nutrition analysis, ingredient safety checks, and health scores. Get AI-powered insights into food additives, allergens, and nutritional content to make healthier choices." />
      </Head>
      <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center pt-12 pb-2">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight text-[var(--text-primary)] max-w-4xl mx-auto leading-tight">
          Smart Food Analyzer & Nutrition Scanner
        </h1>
        <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-6 max-w-3xl mx-auto leading-relaxed">
          Scan any food barcode to get instant nutrition analysis, health scores, and ingredient safety information. Make informed food choices with AI-powered insights.
        </p>
      </section>

      {/* Main Action Section - Highlighted */}
      <section className="max-w-2xl mx-auto -mt-12">
        <Card className="p-8 bg-gradient-to-br from-[var(--surface-container)] to-[var(--surface-container-high)] border-2 border-[var(--primary)]/20 shadow-lg">
          <div className="text-center mb-6">
            <Search className="w-12 h-12 text-[var(--primary)] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Start Your Food Analysis
            </h2>
            <p className="text-[var(--text-secondary)]">
              Enter a product barcode to get comprehensive nutrition insights
            </p>
          </div>
          <BarcodeForm />
        </Card>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-12">
          Comprehensive Food Analysis Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
              Barcode Food Scanner
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Instantly scan product barcodes for comprehensive food analysis with our extensive product database
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
              Nutrition Analysis
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Get detailed nutrition facts, health scores, and personalized dietary recommendations
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
              Ingredient Safety
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Check food additives, allergens, and ingredient safety information for informed choices
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-12">
          How Our Food Health Checker Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Card className="p-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center font-bold mr-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                Scan or Enter Barcode
              </h3>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Simply enter any food product barcode using the form above or use our mobile app to scan with your camera. Our food analyzer supports millions of products worldwide.
            </p>
          </Card>

          <Card className="p-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center font-bold mr-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                Get Instant Analysis
              </h3>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Receive comprehensive nutrition analysis, ingredient breakdown, health scores, and safety information for informed decision-making about your food choices.
            </p>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center bg-gradient-to-r from-[var(--surface-container)] to-[var(--surface-container-high)] py-16 rounded-2xl max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">
          Make Healthier Food Choices Today
        </h2>
        <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed mb-8">
          Join thousands of users who rely on our AI-powered food analyzer to understand what's really in their food. Start analyzing nutrition facts, checking ingredients, and making healthier choices with confidence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="text-[var(--text-secondary)] text-sm">
            📱 Want camera scanning? 
            <a 
              href="https://github.com/Lavande/Whats-In-It" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:text-[var(--primary-dark)] underline ml-1 transition-colors"
            >
              Try our mobile app
            </a>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
