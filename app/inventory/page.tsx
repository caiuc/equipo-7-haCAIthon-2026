import { Header } from "@/components/layout/header";
import { InventoryView } from "@/components/medstock/inventory-view";
import { getInventoryWithStatus } from "@/lib/data/medstock";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const rows = await getInventoryWithStatus();

  return (
    <main className="space-y-6">
      <Header
        title="Inventario"
        subtitle="Stock actual, cobertura y estado por centro y medicamento"
      />
      <InventoryView rows={rows} />
    </main>
  );
}
