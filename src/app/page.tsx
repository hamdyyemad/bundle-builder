// Components
import { BundleBuilder } from "@/frontend/components/features/BundleBuilder";

// Providers
import { CatalogProvider } from "@/frontend/providers";

// API
import { getCatalog } from "@/frontend/api";

export default async function Home() {
  const catalog = await getCatalog();

  return (
    <CatalogProvider catalog={catalog}>
      <BundleBuilder />
    </CatalogProvider>
  );
}
