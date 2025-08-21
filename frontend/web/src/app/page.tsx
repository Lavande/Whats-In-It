import BarcodeForm from "@/components/BarcodeForm";

export default function Home() {
  return (
    <div className="text-center mt-16">
      <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
        Analyze Your Food
      </h1>
      <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
        Get instant, AI-powered insights into food products. Just enter the barcode below to begin.
      </p>
      <BarcodeForm />
    </div>
  );
}
