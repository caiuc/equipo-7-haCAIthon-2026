import { Header } from "@/components/layout/header";
import { ProcessLane } from "@/components/medstock/process-lane";
import { ResolveStockFlow } from "@/components/medstock/resolve-stock-flow";
import { KpiCard } from "@/components/ui/kpi-card";
import { getDashboardData, getFlowScenario } from "@/lib/data/medstock";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [dashboard, scenario] = await Promise.all([getDashboardData(), getFlowScenario()]);

  return (
    <main className="space-y-6">
      <Header
        title="Dashboard MedStock"
        subtitle="Gestion de stock distribuida para la red de salud publica"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Centros conectados" value={String(dashboard.centersCount)} tone="blue" />
        <KpiCard label="Medicamentos monitoreados" value={String(dashboard.medsCount)} tone="green" />
        <KpiCard label="Riesgos de quiebre" value={String(dashboard.risks)} tone="red" />
        <KpiCard label="Transferencias sugeridas" value={String(dashboard.suggestedTransfers)} tone="yellow" />
        <KpiCard label="Solicitudes pendientes" value={String(dashboard.pendingPurchases)} tone="blue" />
      </section>

      <ResolveStockFlow scenario={scenario} />

      <ProcessLane />
    </main>
  );
}
