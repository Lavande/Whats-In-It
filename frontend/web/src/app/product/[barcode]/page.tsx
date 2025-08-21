import ProductView from '@/components/ProductView';

// Mark the component as async to properly handle params
export default async function ProductPage({ params }: { params: { barcode: string } }) {
  // Pass the barcode directly to the client component
  return <ProductView barcode={params.barcode} />;
}