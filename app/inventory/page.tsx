import { Header } from "@/components/layout/header";
import { InventoryView } from "@/components/medstock/inventory-view";
import { getActiveHealthCenter, getInventoryWithStatus } from "@/lib/data/medstock";

export const dynamic = "force-dynamic";

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function InventoryPage({ searchParams }: PageProps<"/inventory">) {
  const params = await searchParams;
  const activeCenter = await getActiveHealthCenter(readParam(params.node));
  const rows = await getInventoryWithStatus({ healthCenterId: activeCenter?.id });

  return (
    <main className="space-y-6">
      <Header
        title={activeCenter ? `Inventario de ${activeCenter.name}` : "Inventario"}
        subtitle={
          activeCenter
            ? "Stock visible para el nodo autenticado"
            : "Stock actual, cobertura y estado por centro y medicamento"
        }
      />
      <InventoryView rows={rows} />
    </main>
  );
}
