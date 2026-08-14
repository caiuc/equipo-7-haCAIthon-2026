import { Header } from "@/components/layout/header";
import { PurchaseRequestsView } from "@/components/medstock/purchase-requests-view";
import { getPurchaseRequests } from "@/lib/data/medstock";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const purchaseRequests = await getPurchaseRequests();

  return (
    <main className="space-y-6">
      <Header
        title="Solicitudes de compra"
        subtitle="Reabastecimiento externo generado automáticamente"
      />
      <PurchaseRequestsView rows={purchaseRequests} />
    </main>
  );
}
